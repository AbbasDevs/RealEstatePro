using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstatePro.Data;
using RealEstatePro.DTOs;
using RealEstatePro.Models;

namespace RealEstatePro.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly PeopleDbContext _peopleDb;

    public AdminController(PeopleDbContext peopleDb)
    {
        _peopleDb = peopleDb;
    }

    [HttpGet("owner-requests")]
    public async Task<IActionResult> GetOwnerRequests()
    {
        var requests = await _peopleDb.Users
            .Where(u => u.OwnerRequestStatus != OwnerRequestStatus.None)
            .GroupJoin(
            _peopleDb.Tenants,
                user => user.Id.ToString(),
                tenant => tenant.UserId,
                (user, tenants) => new { user, tenant = tenants.FirstOrDefault() })
            .OrderBy(x => x.user.OwnerRequestStatus)
            .ThenBy(x => x.user.Email)
            .Select(x => new OwnerRequestDto(
                x.user.Id,
                x.user.Email,
                x.user.TenantId != null ? int.Parse(x.user.TenantId) : null,
                x.user.ManagerId != null ? int.Parse(x.user.ManagerId) : null,
                x.tenant != null ? x.tenant.Name : x.user.Email,
                x.tenant != null ? x.tenant.PhoneNumber : string.Empty,
                x.user.OwnerRequestStatus.ToString().ToLower()))
            .ToListAsync();

        return Ok(requests);
    }

    [HttpPost("owner-requests/{userId:int}/approve")]
    public async Task<IActionResult> ApproveOwnerRequest(int userId)
    {
        var user = await _peopleDb.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
            return NotFound(new { message = "User not found." });

        var tenant = await _peopleDb.Tenants.FirstOrDefaultAsync(t => t.UserId == user.Id.ToString());
        if (tenant is null)
            return BadRequest(new { message = "Tenant profile not found for this user." });

        var manager = await _peopleDb.Managers.FirstOrDefaultAsync(m => m.UserId == user.Id.ToString());
        if (manager is null)
        {
            manager = new Manager
            {
                UserId = user.Id.ToString(),
                Name = tenant.Name,
                Email = tenant.Email,
                PhoneNumber = tenant.PhoneNumber
            };
            _peopleDb.Managers.Add(manager);
            await _peopleDb.SaveChangesAsync();
        }

        user.Role = UserRole.Manager;
        user.ManagerId = manager.Id.ToString();
        user.OwnerRequestStatus = OwnerRequestStatus.Approved;
        await _peopleDb.SaveChangesAsync();

        return Ok(new { message = "Owner request approved.", userId, managerId = manager.Id });
    }

    [HttpPost("owner-requests/{userId:int}/reject")]
    public async Task<IActionResult> RejectOwnerRequest(int userId)
    {
        var user = await _peopleDb.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
            return NotFound(new { message = "User not found." });

        user.Role = UserRole.Tenant;
        user.OwnerRequestStatus = OwnerRequestStatus.Rejected;
        user.ManagerId = null;
        await _peopleDb.SaveChangesAsync();

        return Ok(new { message = "Owner request rejected.", userId });
    }
}