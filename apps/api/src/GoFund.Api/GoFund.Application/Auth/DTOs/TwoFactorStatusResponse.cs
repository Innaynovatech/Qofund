using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class TwoFactorStatusResponse
    {
        public bool Enabled { get; set; }

        public bool HasAuthenticator { get; set; }

        public bool IsEmailConfirmed { get; set; }
    }
}
