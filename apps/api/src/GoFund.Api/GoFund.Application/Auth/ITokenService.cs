using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth
{
    public interface ITokenService
    {
        string GenerateAccessToken(Guid userId, string email, string firstName, string lastName);
        string GenerateRefreshToken();

        string HashRefreshToken(string refreshToken);

        DateTime GetAccessTokenExpiration();

        DateTime GetRefreshTokenExpiration();
    }
}
