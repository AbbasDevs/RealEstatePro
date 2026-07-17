using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstatePro.Data;
using RealEstatePro.DTOs;
using RealEstatePro.Models;
using RealEstatePro.Services;

namespace RealEstatePro.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly PeopleDbContext _peopleDb;
    private readonly JwtService _jwt;

    public AuthController(PeopleDbContext peopleDb, JwtService jwt)
    {
        _peopleDb = peopleDb;
        _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _peopleDb.Users.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "Email already registered." });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new AppUser
        {
            Email = dto.Email,
            PasswordHash = passwordHash,
            Role = UserRole.Tenant,
            OwnerRequestStatus = dto.RequestOwnerAccess ? OwnerRequestStatus.Pending : OwnerRequestStatus.None
        };
        _peopleDb.Users.Add(user);
        await _peopleDb.SaveChangesAsync();

        var tenant = new Tenant
        {
            UserId = user.Id.ToString(),
            Name = dto.Name,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber
        };
        _peopleDb.Tenants.Add(tenant);
        await _peopleDb.SaveChangesAsync();
        user.TenantId = tenant.Id.ToString();

        await _peopleDb.SaveChangesAsync();
        var token = _jwt.GenerateToken(user);

        return Ok(new AuthResponseDto(
            token,
            user.Email,
            user.Role.ToString().ToLower(),
            user.TenantId != null ? int.Parse(user.TenantId) : null,
            user.ManagerId != null ? int.Parse(user.ManagerId) : null,
            user.OwnerRequestStatus.ToString().ToLower()
        ));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _peopleDb.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        // Recover legacy accounts that were created without linking ids on the AppUser row.
        if (user.Role == UserRole.Manager && string.IsNullOrWhiteSpace(user.ManagerId))
        {
            var manager = await _peopleDb.Managers.FirstOrDefaultAsync(m => m.UserId == user.Id.ToString());
            if (manager is not null)
            {
                user.ManagerId = manager.Id.ToString();
                await _peopleDb.SaveChangesAsync();
            }
        }
        else if (user.Role == UserRole.Tenant && string.IsNullOrWhiteSpace(user.TenantId))
        {
            var tenant = await _peopleDb.Tenants.FirstOrDefaultAsync(t => t.UserId == user.Id.ToString());
            if (tenant is not null)
            {
                user.TenantId = tenant.Id.ToString();
                await _peopleDb.SaveChangesAsync();
            }
        }

        var token = _jwt.GenerateToken(user);
        return Ok(new AuthResponseDto(
            token,
            user.Email,
            user.Role.ToString().ToLower(),
            user.TenantId != null ? int.Parse(user.TenantId) : null,
            user.ManagerId != null ? int.Parse(user.ManagerId) : null,
            user.OwnerRequestStatus.ToString().ToLower()
        ));
    }
}
