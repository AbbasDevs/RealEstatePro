using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstatePro.Data;
using RealEstatePro.DTOs;
using RealEstatePro.Models;

namespace RealEstatePro.Controllers;

[ApiController]
[Route("api/properties")]
public class PropertiesController : ControllerBase
{
    private readonly PropertyDbContext _propertyDb;
    private readonly PeopleDbContext _peopleDb;

    public PropertiesController(PropertyDbContext propertyDb, PeopleDbContext peopleDb)
    {
        _propertyDb = propertyDb;
        _peopleDb = peopleDb;
    }

    [HttpGet]
    public async Task<IActionResult> GetProperties([FromQuery] PropertyQueryDto query)
    {
        var q = _propertyDb.Properties
            .Include(p => p.Location)
            .AsQueryable();

        if (!string.IsNullOrEmpty(query.Location))
        {
            var loc = query.Location.ToLower();
            q = q.Where(p =>
                p.Location!.City.ToLower().Contains(loc) ||
                p.Location!.State.ToLower().Contains(loc) ||
                p.Location!.Country.ToLower().Contains(loc));
        }

        if (query.MinPrice.HasValue) q = q.Where(p => p.PricePerMonth >= query.MinPrice.Value);
        if (query.MaxPrice.HasValue) q = q.Where(p => p.PricePerMonth <= query.MaxPrice.Value);
        if (query.Beds.HasValue) q = q.Where(p => p.Beds >= query.Beds.Value);

        if (!string.IsNullOrEmpty(query.PropertyType) &&
            Enum.TryParse<PropertyType>(query.PropertyType, true, out var pt))
            q = q.Where(p => p.PropertyType == pt);

        if (query.PetsAllowed.HasValue) q = q.Where(p => p.IsPetsAllowed == query.PetsAllowed.Value);
        if (query.ParkingIncluded.HasValue) q = q.Where(p => p.IsParkingIncluded == query.ParkingIncluded.Value);

        var properties = await q.ToListAsync();
        return Ok(properties);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProperty(int id)
    {
        var property = await _propertyDb.Properties
            .Include(p => p.Location)
            .FirstOrDefaultAsync(p => p.Id == id);

        return property is null ? NotFound() : Ok(property);
    }

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyDto dto)
    {
        var managerIdClaim = User.FindFirst("managerId")?.Value;
        int managerId;

        if (!int.TryParse(managerIdClaim, out managerId) || managerId <= 0)
        {
            // Fallback for legacy tokens/accounts: resolve manager by user id (sub claim).
            var userIdClaim = User.FindFirst("sub")?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid manager context." });

            var manager = await _peopleDb.Managers.FirstOrDefaultAsync(m => m.UserId == userId.ToString());
            if (manager is null)
                return Unauthorized(new { message = "Manager profile not found for this account." });

            managerId = manager.Id;
        }

        var location = new Location
        {
            Address = dto.Address,
            City = dto.City,
            State = dto.State,
            Country = dto.Country,
            PostalCode = dto.PostalCode,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude
        };
        _propertyDb.Locations.Add(location);
        await _propertyDb.SaveChangesAsync();

        var property = new Property
        {
            Name = dto.Name,
            Description = dto.Description,
            PricePerMonth = dto.PricePerMonth,
            SecurityDeposit = dto.SecurityDeposit,
            ApplicationFee = dto.ApplicationFee,
            IsPetsAllowed = dto.IsPetsAllowed,
            IsParkingIncluded = dto.IsParkingIncluded,
            Beds = dto.Beds,
            Baths = dto.Baths,
            SquareFeet = dto.SquareFeet,
            PropertyType = Enum.Parse<PropertyType>(dto.PropertyType, true),
            LocationId = location.Id,
            ManagerId = managerId
        };

        if (dto.Amenities != null)
            property.Amenities = dto.Amenities
                .Select(a => Enum.Parse<Amenity>(a, true))
                .ToList();

        if (dto.Highlights != null)
            property.Highlights = dto.Highlights
                .Select(h => Enum.Parse<Highlight>(h, true))
                .ToList();

        _propertyDb.Properties.Add(property);
        await _propertyDb.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProperty), new { id = property.Id }, new
        {
            property.Id,
            property.Name,
            property.PricePerMonth,
            property.PropertyType,
            property.ManagerId,
            property.LocationId
        });
    }
}
