namespace RealEstatePro.Models;

public enum UserRole { Tenant, Manager, Admin }

public enum OwnerRequestStatus { None, Pending, Approved, Rejected }

public class AppUser
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public OwnerRequestStatus OwnerRequestStatus { get; set; } = OwnerRequestStatus.None;
    public string? TenantId { get; set; }
    public string? ManagerId { get; set; }
}

public class Manager
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public List<Property> ManagedProperties { get; set; } = new();
}

public class Tenant
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public List<Property> Properties { get; set; } = new();
    public List<Property> Favorites { get; set; } = new();
    public List<Application> Applications { get; set; } = new();
    public List<Lease> Leases { get; set; } = new();
}
