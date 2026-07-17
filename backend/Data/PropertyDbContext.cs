using Microsoft.EntityFrameworkCore;
using RealEstatePro.Models;

namespace RealEstatePro.Data;

public class PropertyDbContext : DbContext
{
    public PropertyDbContext(DbContextOptions<PropertyDbContext> options) : base(options) { }

    public DbSet<Property> Properties => Set<Property>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Lease> Leases => Set<Lease>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<TenantFavorite> TenantFavorites => Set<TenantFavorite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Property>()
            .Property(p => p.PropertyType)
            .HasConversion<string>();

        modelBuilder.Entity<Property>()
            .Property(p => p.PhotoUrls)
            .HasColumnType("text[]");

        modelBuilder.Entity<Application>()
            .Property(a => a.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Payment>()
            .Property(p => p.PaymentStatus)
            .HasConversion<string>();

        // Ignore cross-database navigations to MSSQL entities.
        modelBuilder.Entity<Property>().Ignore(p => p.Manager);
        modelBuilder.Entity<Property>().Ignore(p => p.FavoritedBy);
        modelBuilder.Entity<Property>().Ignore(p => p.Tenants);
        modelBuilder.Entity<Application>().Ignore(a => a.Tenant);
        modelBuilder.Entity<Lease>().Ignore(l => l.Tenant);

        modelBuilder.Entity<Application>()
            .HasOne(a => a.Property)
            .WithMany(p => p.Applications)
            .HasForeignKey(a => a.PropertyId);

        modelBuilder.Entity<Lease>()
            .HasOne(l => l.Property)
            .WithMany(p => p.Leases)
            .HasForeignKey(l => l.PropertyId);

        modelBuilder.Entity<Lease>()
            .HasOne(l => l.Application)
            .WithOne(a => a.Lease)
            .HasForeignKey<Lease>(l => l.ApplicationId)
            .IsRequired(false);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Lease)
            .WithMany(l => l.Payments)
            .HasForeignKey(p => p.LeaseId);

        modelBuilder.Entity<TenantFavorite>()
            .HasKey(tf => new { tf.TenantId, tf.PropertyId });

        modelBuilder.Entity<TenantFavorite>()
            .HasOne(tf => tf.Property)
            .WithMany()
            .HasForeignKey(tf => tf.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TenantFavorite>()
            .HasIndex(tf => tf.TenantId);
    }
}
