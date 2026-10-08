using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth
{
    public interface IEmailService
    {
        Task SendEmailVerificationAsync(string email, string firstName, string verificationLink, CancellationToken cancellationToken = default);
        Task SendPasswordResetAsync(
        string email,
        string firstName,
        string resetLink,
        CancellationToken cancellationToken = default);



    }
}
