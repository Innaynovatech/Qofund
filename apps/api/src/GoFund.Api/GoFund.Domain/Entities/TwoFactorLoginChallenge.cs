using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Domain.Entities
{
    public class TwoFactorLoginChallenge
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public DateTime CreatedAtUtc { get; set; }

        public DateTime ExpiresAtUtc { get; set; }

        public int FailedAttempts { get; set; }

        public bool IsUsed { get; set; }

        public DateTime? UsedAtUtc { get; set; }

        public string? OtpHash { get; set; }
        public DateTime? OtpExpiresAtUtc { get; set; }
        public DateTime? LastOtpSentAtUtc { get; set; }
    }
}
