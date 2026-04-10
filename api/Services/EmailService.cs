using api.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;

namespace api.Services;

public class EmailService(IConfiguration config) : IEmailService
{
    public async Task SendEmailOtpAsync(string to, string otp,string subject,string from="Job Hunter")
    {
        DotNetEnv.Env.Load();
        var smtpEmail = Environment.GetEnvironmentVariable("SMTP_EMAIL");
        var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD");
        var message = new MimeMessage();
        if (smtpEmail != null)
        {
            message.From.Add(new MailboxAddress(from, smtpEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;
            message.Body = new TextPart("html")
            {
                Text = $@"
                <div style=""font-family: Arial, sans-serif; padding: 20px;"">
                    <h2>Your OTP Code</h2>
                    <p>Your verification code is:</p>
                    <h1 style=""background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px;"">{otp}</h1>
                    <p>This code expires in 5 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            "
            };
            using var client = new SmtpClient();
            await client.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpEmail, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
    
}


