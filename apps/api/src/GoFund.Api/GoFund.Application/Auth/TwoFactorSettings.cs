using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth
{
    public class TwoFactorSettings
    {
        public int ChallengeLifetimeMinutes { get; set; } = 5;

        public int MaximumAttempts { get; set; } = 5;
    }
}
