using Microsoft.EntityFrameworkCore;
using RealEstatePro.Models;

namespace RealEstatePro.Data;

public class PeopleDbContext : DbContext
{
    public PeopleDbContext(DbContextOptions<PeopleDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Manager> Managers => Set<Manager>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<AppUser>()
            .Property(u => u.OwnerRequestStatus)
            .HasConversion<string>();

        modelBuilder.Entity<AppUser>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // These navigation properties point to property-side entities in PostgreSQL.
        modelBuilder.Entity<Manager>().Ignore(m => m.ManagedProperties);
        modelBuilder.Entity<Tenant>().Ignore(t => t.Properties);
        modelBuilder.Entity<Tenant>().Ignore(t => t.Favorites);
        modelBuilder.Entity<Tenant>().Ignore(t => t.Applications);
        modelBuilder.Entity<Tenant>().Ignore(t => t.Leases);
    }
}
