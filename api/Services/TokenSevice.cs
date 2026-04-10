using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using api.Data;
using api.Entities;
using api.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace api.Services;

public class TokenService : ITokenService
{
    public AppTokens CreateTokens(User user)
    {
        DotNetEnv.Env.Load();
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET")!)
        );
        var credentials = new SigningCredentials(key,SecurityAlgorithms.HmacSha512);

        var descriptor = new JwtSecurityToken(
            issuer: Environment.GetEnvironmentVariable("JWT_ISSUER"),
            audience: Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: credentials
        );
        var tokenHandler = new JwtSecurityTokenHandler();
        var accessToken = tokenHandler.WriteToken(descriptor);
        var refreshToken =  Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        return new AppTokens
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken  
        };
    }
    
    public AppTokens? RefreshTokens(ConnectedUser connectedUser,AppDbContext db)
    {
        if (connectedUser.ExpiresAt <= DateTime.Now || connectedUser.IsRevoked) return null;
        var user = db.Users.FirstOrDefault(u => u.Id == connectedUser.UserId);
        if (user == null) return null;
        var t = CreateTokens(user);
        return t;
    }
}