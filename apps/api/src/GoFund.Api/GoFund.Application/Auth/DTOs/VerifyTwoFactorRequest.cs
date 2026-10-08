using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class VerifyTwoFactorRequest
    {
        public Guid UserId { get; set; }

        public string Code { get; set; } = string.Empty;

    }
}