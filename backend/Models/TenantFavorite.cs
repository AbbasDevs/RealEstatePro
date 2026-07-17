namespace RealEstatePro.Models;

public class TenantFavorite
{
    public int TenantId { get; set; }
    public int PropertyId { get; set; }

    public Property? Property { get; set; }
}
