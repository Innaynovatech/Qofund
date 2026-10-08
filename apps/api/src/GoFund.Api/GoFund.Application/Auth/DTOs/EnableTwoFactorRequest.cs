using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class EnableTwoFactorRequest
    {
        public string Code { get; set; } = string.Empty;
    }
}
