namespace RealEstatePro.Models;

public enum PropertyType { Rooms, Tinyhouse, Apartment, Villa, Townhouse, Cottage }
public enum Amenity
{
    WasherDryer, AirConditioning, Dishwasher, HighSpeedInternet,
    HardwoodFloors, WalkInClosets, Microwave, Refrigerator,
    Pool, Gym, Parking, PetsAllowed, WiFi
}
public enum Highlight
{
    HighSpeedInternetAccess, WasherDryer, AirConditioning, Heating,
    SmokeFree, CableReady, SatelliteTV, DoubleVanities, TubShower,
    Intercom, SprinklerSystem, RecentlyRenovated, CloseToTransit,
    GreatView, QuietNeighborhood
}

public class Property
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PricePerMonth { get; set; }
    public decimal SecurityDeposit { get; set; }
    public decimal ApplicationFee { get; set; }
    public List<string> PhotoUrls { get; set; } = new();
    public List<Amenity> Amenities { get; set; } = new();
    public List<Highlight> Highlights { get; set; } = new();
    public bool IsPetsAllowed { get; set; }
    public bool IsParkingIncluded { get; set; }
    public int Beds { get; set; }
    public double Baths { get; set; }
    public int SquareFeet { get; set; }
    public PropertyType PropertyType { get; set; }
    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
    public double? AverageRating { get; set; } = 0;
    public int? NumberOfReviews { get; set; } = 0;
    public int LocationId { get; set; }
    public int ManagerId { get; set; }

    public Location? Location { get; set; }
    public Manager? Manager { get; set; }
    public List<Lease> Leases { get; set; } = new();
    public List<Application> Applications { get; set; } = new();
    public List<Tenant> FavoritedBy { get; set; } = new();
    public List<Tenant> Tenants { get; set; } = new();
}
