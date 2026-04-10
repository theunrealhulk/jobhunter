using api.Entities;
using api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace api.Data;

public class AppDbContext:DbContext
{
    private readonly string _connectionString;

    public AppDbContext(DbContextOptions<AppDbContext> options, IConfigurationService config):base(options)
    {
        _connectionString = config.GetConnectionString();
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ConnectedUser> ConnectedUsers => Set<ConnectedUser>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
        
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
        });
        
        modelBuilder.Entity<ConnectedUser>(entity =>
        {
            entity.HasKey(e => e.Id);
        
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.RefreshToken).IsUnique();
            entity.HasIndex(e => new { e.IsRevoked, e.ExpiresAt });  // For cleanup query
        
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_connectionString);
    }
}