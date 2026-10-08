using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class VerifyTwoFactorRecoveryCodeRequest
    {
        public string ChallengeId { get; set; } = string.Empty;

        public string RecoveryCode { get; set; } = string.Empty;
    }
}
