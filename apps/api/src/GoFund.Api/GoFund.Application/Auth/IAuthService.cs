using GoFund.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace GoFund.Application.Auth
{
    public interface IAuthService
    {
        Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);

        Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

        Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);

        Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default);

        Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);

        Task SendEmailVerificationAsync(Guid userId, CancellationToken cancellationToken = default);

        Task VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default);

        Task ResendEmailVerificationAsync(string email, CancellationToken cancellationToken = default);


        Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);



        Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);

        Task<AuthResponse> GoogleLoginAsync(ExternalLoginRequest request, CancellationToken cancellationToken = default);

        Task<AuthResponse> MicrosoftLoginAsync(ExternalLoginRequest request, CancellationToken cancellationToken = default);

        Task<TwoFactorSetupResponse> SetupTwoFactorAsync(Guid userId, CancellationToken cancellationToken = default);
        Task EnableTwoFactorAsync(Guid userId, string code, CancellationToken cancellationToken = default);
        Task DisableTwoFactorAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<bool> VerifyTwoFactorCodeAsync(Guid userId, string code, CancellationToken cancellationToken = default);

        Task<AuthResponse> LoginTwoFactorAsync(VerifyTwoFactorLoginRequest request, CancellationToken cancellationToken = default);

        Task<TwoFactorRecoveryCodesResponse> GenerateTwoFactorRecoveryCodesAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<AuthResponse> LoginTwoFactorRecoveryCodeAsync(VerifyTwoFactorRecoveryCodeRequest request, CancellationToken cancellationToken = default);

        Task<TwoFactorStatusResponse> GetTwoFactorStatusAsync(Guid userId, CancellationToken cancellationToken = default);





    }
}
