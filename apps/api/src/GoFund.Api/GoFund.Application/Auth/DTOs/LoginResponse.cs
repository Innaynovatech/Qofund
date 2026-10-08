using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class LoginResponse
    {
        public bool RequiresTwoFactor { get; set; }

        public Guid? UserId { get; set; }

        public string? ChallengeId { get; set; }

        public DateTime? ChallengeExpiresAt { get; set; }

        public AuthResponse? Auth { get; set; }
    }
}
