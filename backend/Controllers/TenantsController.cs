using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstatePro.Data;
using RealEstatePro.DTOs;

namespace RealEstatePro.Controllers;

[ApiController]
[Route("api/tenants")]
public class TenantsController : ControllerBase
{
    private readonly PeopleDbContext _peopleDb;
    private readonly PropertyDbContext _propertyDb;

    public TenantsController(PeopleDbContext peopleDb, PropertyDbContext propertyDb)
    {
        _peopleDb = peopleDb;
        _propertyDb = propertyDb;
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetTenant(int id)
    {
        var tenant = await _peopleDb.Tenants.FirstOrDefaultAsync(t => t.Id == id);
        if (tenant is null) return NotFound();

        var favoriteIds = await _propertyDb.TenantFavorites
            .Where(tf => tf.TenantId == id)
            .Select(tf => tf.PropertyId)
            .ToListAsync();

        var favorites = await _propertyDb.Properties
            .Where(p => favoriteIds.Contains(p.Id))
            .Include(p => p.Location)
            .ToListAsync();

        return Ok(new
        {
            tenant.Id,
            tenant.UserId,
            tenant.Name,
            tenant.Email,
            tenant.PhoneNumber,
            Favorites = favorites
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> UpdateTenant(int id, [FromBody] UpdateTenantDto dto)
    {
        var tenant = await _peopleDb.Tenants.FindAsync(id);
        if (tenant is null) return NotFound();
        tenant.Name = dto.Name;
        tenant.Email = dto.Email;
        tenant.PhoneNumber = dto.PhoneNumber;
        await _peopleDb.SaveChangesAsync();
        return Ok(tenant);
    }

    [HttpGet("{id:int}/current-residences")]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> GetCurrentResidences(int id)
    {
        var residences = await _propertyDb.Leases
            .Where(l => l.TenantId == id && l.EndDate >= DateTime.UtcNow)
            .Include(l => l.Property)
            .ThenInclude(p => p!.Location)
            .ToListAsync();
        return Ok(residences);
    }

    [HttpPost("{id:int}/favorites/{propertyId:int}")]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> AddFavorite(int id, int propertyId)
    {
        var tenant = await _peopleDb.Tenants.FindAsync(id);
        var property = await _propertyDb.Properties.FindAsync(propertyId);

        if (tenant is null || property is null) return NotFound();

        var exists = await _propertyDb.TenantFavorites
            .AnyAsync(tf => tf.TenantId == id && tf.PropertyId == propertyId);
        if (!exists)
        {
            _propertyDb.TenantFavorites.Add(new RealEstatePro.Models.TenantFavorite
            {
                TenantId = id,
                PropertyId = propertyId
            });
            await _propertyDb.SaveChangesAsync();
        }

        return await GetTenant(id);
    }

    [HttpDelete("{id:int}/favorites/{propertyId:int}")]
    [Authorize(Roles = "Tenant")]
    public async Task<IActionResult> RemoveFavorite(int id, int propertyId)
    {
        var tenant = await _peopleDb.Tenants.FindAsync(id);
        if (tenant is null) return NotFound();

        var fav = await _propertyDb.TenantFavorites
            .FirstOrDefaultAsync(tf => tf.TenantId == id && tf.PropertyId == propertyId);
        if (fav is not null)
        {
            _propertyDb.TenantFavorites.Remove(fav);
            await _propertyDb.SaveChangesAsync();
        }

        return await GetTenant(id);
    }
}
