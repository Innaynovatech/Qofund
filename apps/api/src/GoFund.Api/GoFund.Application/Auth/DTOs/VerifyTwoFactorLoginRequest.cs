using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class VerifyTwoFactorLoginRequest
    {
        public string ChallengeId { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;
    }
}
