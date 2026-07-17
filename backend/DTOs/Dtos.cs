using System.ComponentModel.DataAnnotations;

namespace RealEstatePro.DTOs;

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password
);

public record RegisterDto(
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password,
    [Required] string Name,
    [Required] string PhoneNumber,
    bool RequestOwnerAccess
);

public record AuthResponseDto(
    string Token,
    string Email,
    string Role,
    int? TenantId,
    int? ManagerId,
    string OwnerRequestStatus
);

public record OwnerRequestDto(
    int UserId,
    string Email,
    int? TenantId,
    int? ManagerId,
    string Name,
    string PhoneNumber,
    string Status
);

// Property DTOs
public record PropertyQueryDto(
    string? Location,
    decimal? MinPrice,
    decimal? MaxPrice,
    int? Beds,
    string? PropertyType,
    bool? PetsAllowed,
    bool? ParkingIncluded,
    string? Amenities
);

public record CreatePropertyDto(
    string Name,
    string Description,
    decimal PricePerMonth,
    decimal SecurityDeposit,
    decimal ApplicationFee,
    bool IsPetsAllowed,
    bool IsParkingIncluded,
    int Beds,
    double Baths,
    int SquareFeet,
    string PropertyType,
    string Address,
    string City,
    string State,
    string Country,
    string PostalCode,
    double? Latitude,
    double? Longitude,
    List<string>? Amenities,
    List<string>? Highlights
);

// Application DTOs
public record CreateApplicationDto(
    int PropertyId,
    string Message,
    string Name,
    string Email,
    string PhoneNumber
);

public record UpdateApplicationStatusDto(string Status);

// Profile update DTOs
public record UpdateTenantDto(string Name, string Email, string PhoneNumber);
public record UpdateManagerDto(string Name, string Email, string PhoneNumber);
