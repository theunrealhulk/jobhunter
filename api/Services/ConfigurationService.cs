using api.Interfaces;

namespace api.Services;

public class ConfigurationService:IConfigurationService
{
    public string GetConnectionString()
    {
        DotNetEnv.Env.Load();
        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST");
        var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ;
        var db = Environment.GetEnvironmentVariable("POSTGRES_DB") ;
        var user = Environment.GetEnvironmentVariable("POSTGRES_USER");
        var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
        if (host == null || port == null || db == null || user == null || password == null)
        {
            throw new Exception("Missing db configuration");
        }
        return $"Host={host};Port={port};Database={db};Username={user};Password={password}";
    }
}