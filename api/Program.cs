using System.Text;
using api.Data;
using api.Extensions;
using api.Interfaces;
using api.Services;
using Microsoft.EntityFrameworkCore;


DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);
var connectionString = new ConfigurationService().GetConnectionString();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Configuration.AddEnvironmentVariables();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IConfigurationService, ConfigurationService>();
builder.Services.AddJwtAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddSingleton<ITokenService, TokenService>();
builder.Services.AddSingleton<IEmailService, EmailService>();
// Auto-discover and register all endpoints
var endpointTypes = typeof(Program).Assembly.GetTypes()
    .Where(t => typeof(IEndpoint).IsAssignableFrom(t) && t is { IsInterface: false, IsAbstract: false });
foreach (var type in endpointTypes) { builder.Services.AddSingleton(typeof(IEndpoint), type); }

builder.Services.AddValidation();
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
// Map all endpoints
using (var scope = app.Services.CreateScope())
{
    var endpoints = scope.ServiceProvider.GetRequiredService<IEnumerable<IEndpoint>>();
    foreach (var endpoint in endpoints)
    {
        endpoint.Map(app);
    }
}
app.UseAuthentication();
app.UseAuthorization();
app.Run();