using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using api.Data;
using api.Entities;
using api.Interfaces;
using api.Requests;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace api.Endpoints;

public class AuthEndpoints :IEndpoint
{
    public void Map( IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Auth");
        group.MapPost("/login", Login);
        group.MapPost("/register", Register);
        group.MapPost("/refresh", RefreshToken).RequireAuthorization();
        group.MapPost("/logout", Logout).RequireAuthorization();
    }
    private static async Task<IResult> Register(UserRegisterRequest request,AppDbContext db)
    {
        if (await db.Users.AnyAsync(x => x.Username == request.Username 
                                         || x.Email == request.Email))
        {
            return Results.BadRequest("username or email already exists");
        }
        var user=new  User();
        var hashedPassword = new PasswordHasher<User>()
            .HashPassword(user, request.Password);
        user.Username =  request.Username;
        user.PasswordHash = hashedPassword;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.Phone = request.Phone;
        
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Results.Ok(user);
    }
    
    private  static async Task<IResult> Login(UserLoginRequest request,AppDbContext db,ITokenService tokenService,HttpContext context)
    {
        var user = await db.Users.FirstOrDefaultAsync(x =>  x.Email == request.Email);

        if (user == null|| new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password) ==
            PasswordVerificationResult.Failed)
        {
            return Results.BadRequest("username or password is incorrect");
        }
        var deviceInfo = context.Request.Headers.UserAgent.ToString();
        var ipAddress = context.Connection.RemoteIpAddress?.ToString();
        // Check if session from same device already exists
        var existingSession = await db.ConnectedUsers
            .Where(c => c.UserId == user.Id 
                        && !c.IsRevoked 
                        && c.ExpiresAt > DateTime.UtcNow
                        && c.DeviceInfo == deviceInfo 
                        && c.IpAddress == ipAddress)
            .FirstOrDefaultAsync();
        
        // Revoke old token for this device if exists
        existingSession?.IsRevoked = true;
        var t = tokenService.CreateTokens(user);
        db.ConnectedUsers.Add(new ConnectedUser
        {
            UserId = user.Id,
            RefreshToken = t.RefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            DeviceInfo = context.Request.Headers.UserAgent.ToString(),
            IpAddress =  context.Connection.RemoteIpAddress?.ToString()
        });
        await db.SaveChangesAsync();
        context.Response.Cookies.Append("refreshToken", t.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/api/auth"
        });
        return Results.Ok(t.AccessToken);
    }
    private static async Task<IResult> Logout(HttpContext context, AppDbContext db)
    {
        var refreshToken = context.Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Results.Ok(new { message = "Already logged out" });
        }
        var session = await db.ConnectedUsers
            .FirstOrDefaultAsync(c => c.RefreshToken == refreshToken);
        if (session != null)
        {
            db.ConnectedUsers.Remove(session);
            await db.SaveChangesAsync();
        }
        // Clear cookie
        context.Response.Cookies.Delete("refreshToken");
        return Results.Ok(new { message = "Logged out" });
    }
    private static async Task<IResult>  RefreshToken(HttpContext context,ITokenService tokenService, AppDbContext db)
    {
        var refreshToken = context.Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))  return Results.Unauthorized(); 
        var connectedUser = await db.ConnectedUsers.FirstOrDefaultAsync(
                c => c.RefreshToken == refreshToken && c.IsRevoked == false
            );
        if (connectedUser == null) return Results.Unauthorized();
        var t = tokenService.RefreshTokens(connectedUser, db);
        if (t == null) return Results.Unauthorized();
        connectedUser.RefreshToken = t.Value.RefreshToken;
        connectedUser.ExpiresAt = DateTime.UtcNow.AddDays(7);
        await db.SaveChangesAsync();
        context.Response.Cookies.Delete("refreshToken");
        context.Response.Cookies.Append("refreshToken", t.Value.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/api/auth"
        });
        return Results.Ok(t.Value.AccessToken);
    }
}