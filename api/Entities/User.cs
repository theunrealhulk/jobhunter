using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace api.Entities;
public enum UserRole
{
    User = 0,
    Admin = 1,
    Moderator = 2
}
public class User
{
    public Guid Id { get; set; }
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; }=string.Empty;
    [MaxLength(100)]
    public string FirstName { get; set; }= string.Empty;
    [MaxLength(100)]
    public string LastName { get; set; }= string.Empty;
    [MaxLength(50)]
    public string? Phone { get; set; }= string.Empty;
    [MaxLength(50)]
    public UserRole Role { get; set; } = UserRole.User;
    public string? TrustedDevices { get; set; }=string.Empty;
}