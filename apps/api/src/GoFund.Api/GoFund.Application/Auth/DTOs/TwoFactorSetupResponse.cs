using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class TwoFactorSetupResponse
    {
        public string SharedKey { get; set; } = string.Empty;

        public string AuthenticatorUri { get; set; } = string.Empty;
    }
}
