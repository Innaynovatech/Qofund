using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class RegisterResponse
    {
        public Guid UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public bool EmailVerificationRequired { get; set; }

        public bool VerificationEmailSent { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}
