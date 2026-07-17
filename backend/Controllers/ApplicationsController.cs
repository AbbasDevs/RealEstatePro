using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstatePro.Data;
using RealEstatePro.DTOs;
using RealEstatePro.Models;

namespace RealEstatePro.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly PropertyDbContext _propertyDb;
    private readonly PeopleDbContext _peopleDb;

    public ApplicationsController(PropertyDbContext propertyDb, PeopleDbContext peopleDb)
    {
        _propertyDb = propertyDb;
        _peopleDb = peopleDb;
    }

    [HttpGet]
    public async Task<IActionResult> ListApplications()
    {
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        IQueryable<Application> q = _propertyDb.Applications
            .Include(a => a.Property).ThenInclude(p => p!.Location);

        if (role == "Tenant")
        {
            var tenantId = User.FindFirst("tenantId")?.Value;
            if (int.TryParse(tenantId, out var tid))
                q = q.Where(a => a.TenantId == tid);
        }
        else if (role == "Manager")
        {
            var managerId = User.FindFirst("managerId")?.Value;
            if (int.TryParse(managerId, out var mgrId))
                q = q.Where(a => a.Property!.ManagerId == mgrId);
        }

        var applications = await q.ToListAsync();
        var tenantIds = applications.Select(a => a.TenantId).Distinct().ToList();
        var tenantLookup = await _peopleDb.Tenants
            .Where(t => tenantIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id, t => new
            {
                t.Id,
                t.UserId,
                t.Name,
                t.Email,
                t.PhoneNumber
            });

        var response = applications.Select(a => new
        {
            a.Id,
            a.ApplicationDate,
            a.DecisionDate,
            a.Status,
            a.Message,
            a.Name,
            a.Email,
            a.PhoneNumber,
            a.PropertyId,
            a.TenantId,
            a.Property,
            Tenant = tenantLookup.TryGetValue(a.TenantId, out var tenant) ? tenant : null
        });

        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> CreateApplication([FromBody] CreateApplicationDto dto)
    {
        var tenantIdClaim = User.FindFirst("tenantId")?.Value;
        if (!int.TryParse(tenantIdClaim, out var tenantId))
            return Unauthorized();

        var property = await _propertyDb.Properties.FindAsync(dto.PropertyId);
        if (property is null) return NotFound(new { message = "Property not found." });

        var existing = await _propertyDb.Applications.AnyAsync(
            a => a.PropertyId == dto.PropertyId && a.TenantId == tenantId);
        if (existing)
            return Conflict(new { message = "You already applied to this property." });

        var application = new Application
        {
            PropertyId = dto.PropertyId,
            TenantId = tenantId,
            Message = dto.Message,
            Name = dto.Name,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Status = ApplicationStatus.Pending
        };
        _propertyDb.Applications.Add(application);
        await _propertyDb.SaveChangesAsync();
        return CreatedAtAction(nameof(ListApplications), new { }, application);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateApplicationStatusDto dto)
    {
        var application = await _propertyDb.Applications
            .Include(a => a.Property)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (application is null) return NotFound();

        var managerId = User.FindFirst("managerId")?.Value;
        if (!int.TryParse(managerId, out var mgrId) || application.Property?.ManagerId != mgrId)
            return Forbid();

        if (!Enum.TryParse<ApplicationStatus>(dto.Status, true, out var status))
            return BadRequest(new { message = "Invalid status value." });

        application.Status = status;
        application.DecisionDate = status is ApplicationStatus.Approved or ApplicationStatus.Denied
            ? DateTime.UtcNow
            : null;

        if (status == ApplicationStatus.Approved)
        {
            var lease = new Lease
            {
                PropertyId = application.PropertyId,
                TenantId = application.TenantId,
                ApplicationId = application.Id,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddYears(1),
                Rent = (await _propertyDb.Properties.FindAsync(application.PropertyId))!.PricePerMonth,
                Deposit = (await _propertyDb.Properties.FindAsync(application.PropertyId))!.SecurityDeposit
            };
            _propertyDb.Leases.Add(lease);
        }

        await _propertyDb.SaveChangesAsync();
        return Ok(application);
    }
}
