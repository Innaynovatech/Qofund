using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class TwoFactorRecoveryCodesResponse
    {
        public List<string> RecoveryCodes { get; set; } = new();

    }
}
