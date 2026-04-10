using System.ComponentModel.DataAnnotations;

namespace api.Requests;

public record UserRegisterRequest(
    [Required][RegularExpression(@"[a-z0-9]{5,50}",
        ErrorMessage = "lowercase letters and digits only")] string Username,
    [Required][MinLength(8)][RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$", 
        ErrorMessage = "Password must contain uppercase, lowercase, digit, and symbol")] string Password,
    [Required][StringLength(50, MinimumLength = 3)] string FirstName,
    [Required][StringLength(50, MinimumLength = 3)] string LastName,
    [Required][EmailAddress]
    string Email,
    string Phone
);

public record UserLoginRequest(
    [Required][EmailAddress]string Email,
    [Required]string Password
);