using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstatePro.Data;
using RealEstatePro.DTOs;
using RealEstatePro.Models;

namespace RealEstatePro.Controllers;

[ApiController]
[Route("api/managers")]
public class ManagersController : ControllerBase
{
    private readonly PeopleDbContext _peopleDb;
    private readonly PropertyDbContext _propertyDb;

    public ManagersController(PeopleDbContext peopleDb, PropertyDbContext propertyDb)
    {
        _peopleDb = peopleDb;
        _propertyDb = propertyDb;
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetManager(int id)
    {
        var manager = await _peopleDb.Managers.FindAsync(id);
        return manager is null ? NotFound() : Ok(manager);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateManager(int id, [FromBody] UpdateManagerDto dto)
    {
        var manager = await _peopleDb.Managers.FindAsync(id);
        if (manager is null) return NotFound();
        manager.Name = dto.Name;
        manager.Email = dto.Email;
        manager.PhoneNumber = dto.PhoneNumber;
        await _peopleDb.SaveChangesAsync();
        return Ok(manager);
    }

    [HttpGet("{id:int}/properties")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> GetManagerProperties(int id)
    {
        var manager = await _peopleDb.Managers.FindAsync(id);
        if (manager is null) return NotFound();

        var properties = await _propertyDb.Properties
            .Where(p => p.ManagerId == id)
            .Include(p => p.Location)
            .ToListAsync();
        return Ok(properties);
    }

    [HttpPost("{id:int}/adopt-orphan-properties")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> AdoptOrphanProperties(int id)
    {
        var claimManagerId = User.FindFirst("managerId")?.Value;
        if (!int.TryParse(claimManagerId, out var authenticatedManagerId) || authenticatedManagerId != id)
            return Forbid();

        var manager = await _peopleDb.Managers.FindAsync(id);
        if (manager is null) return NotFound();

        var orphaned = await _propertyDb.Properties
            .Where(p => p.ManagerId == 0)
            .ToListAsync();

        foreach (var property in orphaned)
            property.ManagerId = id;

        await _propertyDb.SaveChangesAsync();

        return Ok(new
        {
            adoptedCount = orphaned.Count,
            managerId = id,
            message = orphaned.Count == 0
                ? "No orphaned properties found."
                : "Orphaned properties were assigned to this manager."
        });
    }

    [HttpPost("{id:int}/claim-all-properties")]
    public async Task<IActionResult> ClaimAllProperties(int id)
    {
        var manager = await _peopleDb.Managers.FindAsync(id);
        if (manager == null) return NotFound(new { message = "Manager not found." });

        var all = await _propertyDb.Properties.ToListAsync();
        foreach (var p in all) p.ManagerId = id;
        await _propertyDb.SaveChangesAsync();

        return Ok(new { updated = all.Count, managerId = id, message = $"All {all.Count} properties reassigned to manager {id}." });
    }
}
