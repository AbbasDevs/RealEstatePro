using Microsoft.EntityFrameworkCore;
using RealEstatePro.Models;

namespace RealEstatePro.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Manager> Managers => Set<Manager>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Lease> Leases => Set<Lease>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Property configuration ────────────────────────────────────────────
        modelBuilder.Entity<Property>()
            .Property(p => p.PropertyType)
            .HasConversion<string>();

        modelBuilder.Entity<Property>()
            .Property(p => p.PhotoUrls)
            .HasColumnType("text[]");

        // Property -> Manager (FK)
        modelBuilder.Entity<Property>()
            .HasOne(p => p.Manager)
            .WithMany(m => m.ManagedProperties)
            .HasForeignKey("ManagerId")
            .IsRequired(true);

        // ── AppUser configuration ─────────────────────────────────────────────
        modelBuilder.Entity<AppUser>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<AppUser>()
            .Property(u => u.OwnerRequestStatus)
            .HasConversion<string>();

        // ── Application configuration ─────────────────────────────────────────
        modelBuilder.Entity<Application>()
            .Property(a => a.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Application>()
            .HasOne(a => a.Property)
            .WithMany(p => p.Applications)
            .HasForeignKey(a => a.PropertyId);

        modelBuilder.Entity<Application>()
            .HasOne(a => a.Tenant)
            .WithMany(t => t.Applications)
            .HasForeignKey(a => a.TenantId);

        // ── Payment configuration ─────────────────────────────────────────────
        modelBuilder.Entity<Payment>()
            .Property(p => p.PaymentStatus)
            .HasConversion<string>();

        // ── Many-to-many: Tenant <-> Property (favorites) ───────────────────
        modelBuilder.Entity<Tenant>()
            .HasMany(t => t.Favorites)
            .WithMany(p => p.FavoritedBy)
            .UsingEntity("TenantFavorites");

        // ── Many-to-many: Tenant <-> Property (residences) ──────────────────
        modelBuilder.Entity<Tenant>()
            .HasMany(t => t.Properties)
            .WithMany(p => p.Tenants)
            .UsingEntity("TenantProperties");

        // ── Lease -> Application (one-to-one optional) ────────────────────────
        modelBuilder.Entity<Lease>()
            .HasOne(l => l.Application)
            .WithOne(a => a.Lease)
            .HasForeignKey<Lease>(l => l.ApplicationId)
            .IsRequired(false);

        // ── Indexes ───────────────────────────────────────────────────────────
        modelBuilder.Entity<AppUser>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}
