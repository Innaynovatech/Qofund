using GoFund.Application.Auth;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Infrastructure.Email
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(
            IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendEmailVerificationAsync(
      string email,
      string firstName,
      string verificationLink,
      CancellationToken cancellationToken = default)
        {
            var message = new MimeMessage();

            message.From.Add(
                new MailboxAddress(
                    _settings.FromName,
                    _settings.FromAddress));

            message.To.Add(
                MailboxAddress.Parse(email));

            message.Subject = "Verify your GoFund account";

            var body = $"""
        <html>
        <body>
            <h2>Welcome to GoFund, {firstName}!</h2>

            <p>
                Thank you for creating your account.
            </p>

            <p>
                Please verify your email address by clicking
                the button below:
            </p>

            <p>
                <a href="{verificationLink}"
                   style="
                   display:inline-block;
                   padding:12px 20px;
                   background:#0066cc;
                   color:white;
                   text-decoration:none;
                   border-radius:5px;">
                    Verify Email Address
                </a>
            </p>

            <p>
                If you did not create this account,
                you can safely ignore this email.
            </p>

            <p>
                Regards,<br/>
                GoFund Team
            </p>
        </body>
        </html>
        """;

            message.Body = new BodyBuilder
            {
                HtmlBody = body
            }.ToMessageBody();

            using var smtp = new SmtpClient();

            // Give SMTP its own timeout.
            using var smtpTimeout =
                new CancellationTokenSource(
                    TimeSpan.FromSeconds(30));

            using var linkedCts =
                CancellationTokenSource.CreateLinkedTokenSource(
                    cancellationToken,
                    smtpTimeout.Token);

            try
            {
                await smtp.ConnectAsync(
                    _settings.SmtpHost,
                    _settings.SmtpPort,
                    SecureSocketOptions.StartTls,
                    linkedCts.Token);

                await smtp.AuthenticateAsync(
                    _settings.Username,
                    _settings.Password,
                    linkedCts.Token);

                await smtp.SendAsync(
                    message,
                    linkedCts.Token);
            }
            finally
            {
                if (smtp.IsConnected)
                {
                    await smtp.DisconnectAsync(
                        true,
                        CancellationToken.None);
                }
            }
        }
        //    public async Task SendPasswordResetAsync(
        //string email,
        //string firstName,
        //string resetLink,
        //CancellationToken cancellationToken = default)
        //    {
        //        var message = new MimeMessage();

        //        message.From.Add(
        //            new MailboxAddress(
        //                _settings.FromName,
        //                _settings.FromAddress));

        //        message.To.Add(
        //            MailboxAddress.Parse(email));

        //        message.Subject = "Reset your GoFund password";

        //        var body = $"""
        //    <html>
        //    <body>
        //        <h2>Password Reset</h2>

        //        <p>Hello {firstName},</p>

        //        <p>
        //            We received a request to reset your GoFund password.
        //        </p>

        //        <p>
        //            Click the button below to create a new password:
        //        </p>

        //        <p>
        //            <a href="{resetLink}"
        //               style="
        //               display:inline-block;
        //               padding:12px 20px;
        //               background:#0066cc;
        //               color:white;
        //               text-decoration:none;
        //               border-radius:5px;">
        //                Reset Password
        //            </a>
        //        </p>

        //        <p>
        //            If you did not request a password reset,
        //            you can safely ignore this email.
        //        </p>

        //        <p>
        //            Regards,<br/>
        //            GoFund Team
        //        </p>
        //    </body>
        //    </html>
        //    """;

        //        message.Body = new BodyBuilder
        //        {
        //            HtmlBody = body
        //        }.ToMessageBody();

        //        using var smtp = new SmtpClient();

        //        await smtp.ConnectAsync(
        //            _settings.SmtpHost,
        //            _settings.SmtpPort,
        //            SecureSocketOptions.StartTls,
        //            cancellationToken);

        //        await smtp.AuthenticateAsync(
        //            _settings.Username,
        //            _settings.Password,
        //            cancellationToken);

        //        await smtp.SendAsync(
        //            message,
        //            cancellationToken);

        //        await smtp.DisconnectAsync(
        //            true,
        //            cancellationToken);
        //    }

        public async Task SendPasswordResetAsync(
    string email,
    string firstName,
    string resetLink,
    CancellationToken cancellationToken = default)
        {
            var message = new MimeMessage();

            message.From.Add(
                new MailboxAddress(
                    _settings.FromName,
                    _settings.FromAddress));

            message.To.Add(
                MailboxAddress.Parse(email));

            message.Subject = "Reset your GoFund password";

            var body = $"""
        <html>
        <body>
            <h2>Password Reset</h2>

            <p>Hello {firstName},</p>

            <p>
                We received a request to reset your GoFund password.
            </p>

            <p>
                Click the button below to create a new password:
            </p>

            <p>
                <a href="{resetLink}"
                   style="
                   display:inline-block;
                   padding:12px 20px;
                   background:#0066cc;
                   color:white;
                   text-decoration:none;
                   border-radius:5px;">
                    Reset Password
                </a>
            </p>

            <p>
                If you did not request a password reset,
                you can safely ignore this email.
            </p>

            <p>
                Regards,<br/>
                GoFund Team
            </p>
        </body>
        </html>
        """;

            message.Body = new BodyBuilder
            {
                HtmlBody = body
            }.ToMessageBody();

            using var smtp = new SmtpClient();

            // SMTP gets its own 30-second timeout
            using var smtpTimeout =
                new CancellationTokenSource(
                    TimeSpan.FromSeconds(30));

            using var linkedCts =
                CancellationTokenSource.CreateLinkedTokenSource(
                    cancellationToken,
                    smtpTimeout.Token);

            try
            {
                await smtp.ConnectAsync(
                    _settings.SmtpHost,
                    _settings.SmtpPort,
                    SecureSocketOptions.StartTls,
                    linkedCts.Token);

                await smtp.AuthenticateAsync(
                    _settings.Username,
                    _settings.Password,
                    linkedCts.Token);

                await smtp.SendAsync(
                    message,
                    linkedCts.Token);
            }
            finally
            {
                if (smtp.IsConnected)
                {
                    await smtp.DisconnectAsync(
                        true,
                        CancellationToken.None);
                }
            }
        }
    }
}
