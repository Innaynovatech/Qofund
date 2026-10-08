using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace GoFund.Application.Auth.DTOs
{
    public class ExternalLoginRequest
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }
}
