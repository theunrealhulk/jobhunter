using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using api.Data;
using api.Entities;
using api.Interfaces;
using api.Requests;
using Microsoft.AspNetCore.Http.HttpResults;
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
    
    private  static async Task<IResult> Login(UserLoginRequest request,AppDbContext db)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Username == request.Username);

        if (user == null|| new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password) ==
            PasswordVerificationResult.Failed)
        {
            return Results.BadRequest("username or password is incorrect");
        }
        return Results.Ok(CreateToken(user));
    }
    private static async Task<IResult> Logout(HttpContext context)
    {
        return await Task.FromResult<IResult>(Results.Ok(new { message = "success" }));
    }
    private static Task RefreshToken(HttpContext context)
    {
        throw new NotImplementedException();
    }

    private static string CreateToken(User user)
    {
        DotNetEnv.Env.Load();
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
        };
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET")!)
            );
        var credentials = new SigningCredentials(key,SecurityAlgorithms.HmacSha512);

        var descriptor = new JwtSecurityToken(
            issuer: Environment.GetEnvironmentVariable("JWT_ISSUER"),
            audience: Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
            claims: claims,
            expires: DateTime.Now.AddHours(12),
            signingCredentials: credentials
            );
        return new JwtSecurityTokenHandler().WriteToken(descriptor);
    }
}