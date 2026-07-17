namespace RealEstatePro.Models;

public enum ApplicationStatus { Pending, Denied, Approved }
public enum PaymentStatus { Pending, Paid, PartiallyPaid, Overdue }

public class Application
{
    public int Id { get; set; }
    public DateTime ApplicationDate { get; set; } = DateTime.UtcNow;
    public DateTime? DecisionDate { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public string Message { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int PropertyId { get; set; }
    public int TenantId { get; set; }
    public Property? Property { get; set; }
    public Tenant? Tenant { get; set; }
    public Lease? Lease { get; set; }
}

public class Lease
{
    public int Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Rent { get; set; }
    public decimal Deposit { get; set; }
    public int PropertyId { get; set; }
    public int TenantId { get; set; }
    public int? ApplicationId { get; set; }
    public Property? Property { get; set; }
    public Tenant? Tenant { get; set; }
    public Application? Application { get; set; }
    public List<Payment> Payments { get; set; } = new();
}

public class Payment
{
    public int Id { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public int LeaseId { get; set; }
    public Lease? Lease { get; set; }
}
