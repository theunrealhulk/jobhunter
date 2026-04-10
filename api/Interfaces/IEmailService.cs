namespace api.Interfaces;

public interface IEmailService
{
    Task SendEmailOtpAsync(string to, string otp,string subject,string from);
}