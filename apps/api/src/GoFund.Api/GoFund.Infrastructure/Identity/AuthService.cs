using GoFund.Application.Auth;
using GoFund.Application.Auth.DTOs;
using GoFund.Domain.Entities;
using GoFund.Infrastructure.Persistence;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Asn1.Cmp;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace GoFund.Infrastructure.Identity
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly ApplicationDbContext _dbContext;
        private readonly IEmailService _emailService;
        private readonly EmailSettings _emailSettings;
        private readonly GoogleSettings _googleSettings;
        private readonly MicrosoftSettings _microsoftSettings;
        private readonly TwoFactorSettings _twoFactorSettings;

        public AuthService(UserManager<ApplicationUser> userManager,
            ITokenService tokenService, ApplicationDbContext dbContext,
            IEmailService emailService, IOptions<EmailSettings> emailSettings,
            IOptions<GoogleSettings> googleSettings, IOptions<MicrosoftSettings> microsoftSettings,
            IOptions<TwoFactorSettings> twoFactorSettings)
        {

            _userManager = userManager;
            _tokenService = tokenService;
            _dbContext = dbContext;
            _emailService = emailService;
            _emailSettings = emailSettings.Value;
            _googleSettings = googleSettings.Value;
            _microsoftSettings = microsoftSettings.Value;
            _twoFactorSettings = twoFactorSettings.Value;   
        }

        public async Task DisableTwoFactorAsync(Guid userId, CancellationToken cancellationToken = default)
        {
             var user = await _userManager.FindByIdAsync(userId.ToString());


            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");

            }

            var result = await _userManager.SetTwoFactorEnabledAsync(user, false);

            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }
        }

        public async Task EnableTwoFactorAsync(Guid userId, string code, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            if (string.IsNullOrWhiteSpace(code))
            {
                throw new ArgumentException("Authenticator code is required.");

            }

            var isValid = await _userManager.VerifyTwoFactorTokenAsync(user, _userManager.Options.Tokens.AuthenticatorTokenProvider, code);

            if (!isValid)
            {
                throw new UnauthorizedAccessException("Invalid authenticator code.");

            }

            var result = await _userManager.SetTwoFactorEnabledAsync(user, true);




            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException(errors);
            }
        }

        public async Task ForgotPasswordAsync(
     ForgotPasswordRequest request,
     CancellationToken cancellationToken = default)
        {
            var user =
                await _userManager.FindByEmailAsync(
                    request.Email);

            // Don't reveal whether the email exists.
            if (user == null)
            {
                return;
            }

            if (!user.IsActive)
            {
                return;
            }

            if (!user.EmailConfirmed)
            {
                return;
            }

            var token =
                await _userManager.GeneratePasswordResetTokenAsync(
                    user);

            var encodedToken =
                Uri.EscapeDataString(token);

            var resetLink =
                $"{_emailSettings.PasswordResetBaseUrl}" +
                $"?userId={user.Id}" +
                $"&token={encodedToken}";

            await _emailService.SendPasswordResetAsync(
                user.Email!,
                user.FirstName,
                resetLink,
                cancellationToken);
        }

        public async Task<CurrentUserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());


            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "User account was not found.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "User account is inactive.");
            }

            return new CurrentUserResponse
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!
            };
        }

        public async Task<AuthResponse> GoogleLoginAsync(
     ExternalLoginRequest request,
     CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_googleSettings.ClientId))
            {
                throw new InvalidOperationException(
                    "Google authentication is not configured.");
            }

            if (string.IsNullOrWhiteSpace(request.IdToken))
            {
                throw new UnauthorizedAccessException(
                    "Google ID token is required.");
            }

            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(
                    request.IdToken,
                    new GoogleJsonWebSignature.ValidationSettings
                    {
                        Audience = new[]
                        {
                    _googleSettings.ClientId
                        }
                    });
            }
            catch (InvalidJwtException)
            {
                throw new UnauthorizedAccessException(
                    "Invalid Google authentication token.");
            }

            if (string.IsNullOrWhiteSpace(payload.Subject))
            {
                throw new UnauthorizedAccessException(
                    "Google account does not contain a valid subject.");
            }

            if (string.IsNullOrWhiteSpace(payload.Email))
            {
                throw new UnauthorizedAccessException(
                    "Google account does not contain a valid email.");
            }

            // We only want to trust Google's email when Google
            // confirms that the email has been verified.
            if (!payload.EmailVerified)
            {
                throw new UnauthorizedAccessException(
                    "Google email address has not been verified.");
            }

            var email = payload.Email.Trim();

            var loginInfo = new UserLoginInfo("Google", payload.Subject, "Google");

            // ---------------------------------------------------------
            // 1. Try to find the user through the Google login
            // ---------------------------------------------------------

            var user = await _userManager.FindByLoginAsync(
                loginInfo.LoginProvider,
                loginInfo.ProviderKey);

            // ---------------------------------------------------------
            // 2. If Google login doesn't exist, look for email account
            // ---------------------------------------------------------

            if (user == null)
            {
                user = await _userManager.FindByEmailAsync(email);
            }

            // ---------------------------------------------------------
            // 3. Existing GoFund account
            // ---------------------------------------------------------

            if (user != null)
            {
                if (!user.IsActive)
                {
                    throw new UnauthorizedAccessException(
                        "User account is inactive.");
                }

                var existingLogins =
                    await _userManager.GetLoginsAsync(user);

                var googleLoginExists =
                    existingLogins.Any(x =>
                        x.LoginProvider == "Google" &&
                        x.ProviderKey == payload.Subject);

                if (!googleLoginExists)
                {
                    var addLoginResult =
                        await _userManager.AddLoginAsync(
                            user,
                            loginInfo);

                    if (!addLoginResult.Succeeded)
                    {
                        var errors = string.Join(
                            "; ",
                            addLoginResult.Errors.Select(
                                e => e.Description));

                        throw new InvalidOperationException(errors);
                    }
                }
            }
            else
            {
                // -----------------------------------------------------
                // 4. New GoFund account
                // -----------------------------------------------------

                user = new ApplicationUser
                {
                    Id = Guid.NewGuid(),

                    UserName = email,
                    Email = email,

                    FirstName =
                        payload.GivenName ?? string.Empty,

                    LastName =
                        payload.FamilyName ?? string.Empty,

                    EmailConfirmed = true,
                    IsActive = true
                };

                var createResult =
                    await _userManager.CreateAsync(user);

                if (!createResult.Succeeded)
                {
                    var errors = string.Join(
                        "; ",
                        createResult.Errors.Select(
                            e => e.Description));

                    throw new InvalidOperationException(errors);
                }

                var addLoginResult =
                    await _userManager.AddLoginAsync(
                        user,
                        loginInfo);

                if (!addLoginResult.Succeeded)
                {
                    await _userManager.DeleteAsync(user);

                    var errors = string.Join(
                        "; ",
                        addLoginResult.Errors.Select(
                            e => e.Description));

                    throw new InvalidOperationException(errors);
                }
            }

            // ---------------------------------------------------------
            // 5. Update last login
            // ---------------------------------------------------------

            user.LastLoginAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(user);

            // ---------------------------------------------------------
            // 6. Issue GoFund access + refresh tokens
            // ---------------------------------------------------------

            return await GenerateAuthResponseAsync(
                user,
                cancellationToken);
        }

        //public  async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        //{
        //    var normalizedEmail = request.Email.Trim().ToLowerInvariant();


        //    var user = await _userManager.FindByEmailAsync(normalizedEmail);


        //    if (user == null)
        //    {
        //        throw new UnauthorizedAccessException("Invalid email or password.");

        //    }

        //    if (!user.IsActive)
        //    {
        //        throw new UnauthorizedAccessException("This account is inactive.");

        //    }

        //    if (!user.EmailConfirmed)
        //    {
        //        throw new UnauthorizedAccessException(
        //            "Please verify your email address before logging in.");
        //    }

        //    var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        //    if (!passwordValid)
        //    {
        //        throw new UnauthorizedAccessException("Invalid email or password.");

        //    }

        //    var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email!, user.FirstName, user.LastName);


        //    var refreshToken = _tokenService.GenerateRefreshToken();


        //    var accessTokenExpires = _tokenService.GetAccessTokenExpiration();


        //    var refreshTokenExpires = _tokenService.GetRefreshTokenExpiration();


        //    var refreshTokenEntity = new RefreshToken
        //    {
        //        Id = Guid.NewGuid(),
        //        UserId = user.Id,
        //        TokenHash = _tokenService.HashRefreshToken(refreshToken),
        //        ExpiresAt = refreshTokenExpires,
        //        CreatedAt = DateTime.UtcNow
        //    };

        //    _dbContext.RefreshTokens.Add(refreshTokenEntity);

        //    user.LastLoginAt = DateTime.UtcNow;

        //    await _userManager.UpdateAsync(user);

        //    await _dbContext.SaveChangesAsync(cancellationToken);

        //    return new AuthResponse
        //    {
        //        UserId = user.Id,
        //        FirstName = user.FirstName,
        //        LastName = user.LastName,
        //        Email = user.Email!,

        //        AccessToken = accessToken,
        //        RefreshToken = refreshToken,

        //        AccessTokenExpiresAt = accessTokenExpires,
        //        RefreshTokenExpiresAt = refreshTokenExpires
        //    };
        //}

        public async Task<LoginResponse> LoginAsync(
    LoginRequest request,
    CancellationToken cancellationToken = default)
        {
            var user =
                await _userManager.FindByEmailAsync(
                    request.Email);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "User account is inactive.");
            }

            var passwordValid =
                await _userManager.CheckPasswordAsync(
                    user,
                    request.Password);

            if (!passwordValid)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password.");
            }

            // -----------------------------------------------------
            // 2FA
            // -----------------------------------------------------

            if (user.TwoFactorEnabled)
            {
                var challenge =
                    await CreateTwoFactorLoginChallengeAsync(
                        user.Id,
                        cancellationToken);

                return new LoginResponse
                {
                    RequiresTwoFactor = true,
                    UserId = user.Id,
                    ChallengeId =
                        challenge.Id.ToString(),
                    ChallengeExpiresAt =
                        challenge.ExpiresAtUtc,
                    Auth = null
                };
            }

            // -----------------------------------------------------
            // Normal login
            // -----------------------------------------------------

            user.LastLoginAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(user);

            var authResponse =
                await GenerateAuthResponseAsync(
                    user,
                    cancellationToken);

            return new LoginResponse
            {
                RequiresTwoFactor = false,
                UserId = user.Id,
                Auth = authResponse
            };
        }

        public async Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default)
        {


            var tokenHash =
                _tokenService.HashRefreshToken(
                    request.RefreshToken);

            var storedToken =
                await _dbContext.RefreshTokens
                    .FirstOrDefaultAsync(
                        x => x.TokenHash == tokenHash,
                        cancellationToken);

            if (storedToken == null)
            {
                // Don't reveal whether the token exists.
               // For security, logout should be idempotent.
                return;
            }

            if (!storedToken.IsRevoked)
            {
                storedToken.RevokedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync(
                    cancellationToken);
            }
        }

        public async Task<AuthResponse> MicrosoftLoginAsync(
    ExternalLoginRequest request,
    CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(
                    _microsoftSettings.ClientId))
            {
                throw new InvalidOperationException(
                    "Microsoft authentication is not configured.");
            }

            if (string.IsNullOrWhiteSpace(request.IdToken))
            {
                throw new UnauthorizedAccessException(
                    "Microsoft ID token is required.");
            }

            var configurationManager =
                new ConfigurationManager<OpenIdConnectConfiguration>(
                    "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
                    new OpenIdConnectConfigurationRetriever(),
                    new HttpDocumentRetriever());

            var configuration =
                await configurationManager.GetConfigurationAsync(
                    cancellationToken);

            var tokenHandler = new JwtSecurityTokenHandler();

            ClaimsPrincipal principal;

            try
            {
                principal = tokenHandler.ValidateToken(
                    request.IdToken,
                    new TokenValidationParameters
                    {
                        ValidateIssuer = true,

                        ValidIssuers = new[]
                        {
                    "https://login.microsoftonline.com/common/v2.0"
                        },

                        ValidateAudience = true,

                        ValidAudience =
                            _microsoftSettings.ClientId,

                        ValidateLifetime = true,

                        ValidateIssuerSigningKey = true,

                        IssuerSigningKeys =
                            configuration.SigningKeys,

                        ClockSkew =
                            TimeSpan.FromMinutes(2)
                    },
                    out _);
            }
            catch (Exception)
            {
                throw new UnauthorizedAccessException(
                    "Invalid Microsoft authentication token.");
            }

            var subject =
                principal.FindFirst(
                    "sub")?.Value;

            var email =
                principal.FindFirst(
                    "preferred_username")?.Value
                ??
                principal.FindFirst(
                    "email")?.Value;

            var firstName =
                principal.FindFirst(
                    "given_name")?.Value
                ?? string.Empty;

            var lastName =
                principal.FindFirst(
                    "family_name")?.Value
                ?? string.Empty;

            if (string.IsNullOrWhiteSpace(subject))
            {
                throw new UnauthorizedAccessException(
                    "Microsoft account does not contain a valid subject.");
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                throw new UnauthorizedAccessException(
                    "Microsoft account does not contain a valid email.");
            }

            var loginInfo = new UserLoginInfo(
                "Microsoft",
                subject,
                "Microsoft");

            // ---------------------------------------------------------
            // 1. Find existing Microsoft login
            // ---------------------------------------------------------

            var user =
                await _userManager.FindByLoginAsync(
                    loginInfo.LoginProvider,
                    loginInfo.ProviderKey);

            // ---------------------------------------------------------
            // 2. If not found, try email
            // ---------------------------------------------------------

            if (user == null)
            {
                user =
                    await _userManager.FindByEmailAsync(
                        email);
            }

            // ---------------------------------------------------------
            // 3. Existing user
            // ---------------------------------------------------------

            if (user != null)
            {
                if (!user.IsActive)
                {
                    throw new UnauthorizedAccessException(
                        "User account is inactive.");
                }

                var existingLogins =
                    await _userManager.GetLoginsAsync(user);

                var microsoftLoginExists =
                    existingLogins.Any(x =>
                        x.LoginProvider == "Microsoft" &&
                        x.ProviderKey == subject);

                if (!microsoftLoginExists)
                {
                    var addLoginResult =
                        await _userManager.AddLoginAsync(
                            user,
                            loginInfo);

                    if (!addLoginResult.Succeeded)
                    {
                        var errors = string.Join(
                            "; ",
                            addLoginResult.Errors.Select(
                                e => e.Description));

                        throw new InvalidOperationException(
                            errors);
                    }
                }
            }
            else
            {
                // -----------------------------------------------------
                // 4. New user
                // -----------------------------------------------------

                user = new ApplicationUser
                {
                    Id = Guid.NewGuid(),

                    UserName = email,
                    Email = email,

                    FirstName = firstName,
                    LastName = lastName,

                    EmailConfirmed = true,
                    IsActive = true
                };

                var createResult =
                    await _userManager.CreateAsync(user);

                if (!createResult.Succeeded)
                {
                    var errors = string.Join(
                        "; ",
                        createResult.Errors.Select(
                            e => e.Description));

                    throw new InvalidOperationException(
                        errors);
                }

                var addLoginResult =
                    await _userManager.AddLoginAsync(
                        user,
                        loginInfo);

                if (!addLoginResult.Succeeded)
                {
                    await _userManager.DeleteAsync(user);

                    var errors = string.Join(
                        "; ",
                        addLoginResult.Errors.Select(
                            e => e.Description));

                    throw new InvalidOperationException(
                        errors);
                }
            }

            user.LastLoginAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(user);

            return await GenerateAuthResponseAsync(
                user,
                cancellationToken);
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
        {

            var tokenHash =
                _tokenService.HashRefreshToken(
                    request.RefreshToken);

            var storedToken =
                await _dbContext.RefreshTokens
                    .FirstOrDefaultAsync(
                        x => x.TokenHash == tokenHash,
                        cancellationToken);

            if (storedToken == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid refresh token.");
            }

            if (!storedToken.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "Refresh token is expired or revoked.");
            }

            var user =
                await _userManager.FindByIdAsync(
                    storedToken.UserId.ToString());

            if (user == null || !user.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "User account is unavailable.");
            }

            var newAccessToken =
                _tokenService.GenerateAccessToken(
                    user.Id,
                    user.Email!,
                    user.FirstName,
                    user.LastName);

            var newRefreshToken =
                _tokenService.GenerateRefreshToken();

            var newAccessTokenExpires =
                _tokenService.GetAccessTokenExpiration();

            var newRefreshTokenExpires =
                _tokenService.GetRefreshTokenExpiration();

            var newRefreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash = _tokenService.HashRefreshToken(newRefreshToken),
                ExpiresAt = newRefreshTokenExpires,
                CreatedAt = DateTime.UtcNow
            };

            storedToken.RevokedAt = DateTime.UtcNow;

            storedToken.ReplacedByTokenHash =
                newRefreshTokenEntity.TokenHash;

            _dbContext.RefreshTokens.Add(
                newRefreshTokenEntity);

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            return new AuthResponse
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!,

                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,

                AccessTokenExpiresAt =
                    newAccessTokenExpires,

                RefreshTokenExpiresAt =
                    newRefreshTokenExpires
            };
        }

        public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            
            var existingUser = await _userManager.FindByEmailAsync(normalizedEmail);


            if (existingUser != null)
            {
                throw new InvalidOperationException(
                    "A user with this email already exists.");
            }

            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = normalizedEmail,
                Email = normalizedEmail,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                EmailConfirmed = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var result =
                await _userManager.CreateAsync(
                    user,
                    request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    "; ",
                    result.Errors.Select(e => e.Description));

                throw new InvalidOperationException(errors);
            }

            var verificationToken =
     await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var encodedToken =
                Uri.EscapeDataString(verificationToken);

            var verificationLink =
                $"{_emailSettings.VerificationBaseUrl}" +
                $"?userId={user.Id}" +
                $"&token={encodedToken}";

            

            await _emailService.SendEmailVerificationAsync(
                user.Email!,
                user.FirstName,
                verificationLink,
                cancellationToken);

            

            return new RegisterResponse
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!,
                EmailVerificationRequired = true,
                VerificationEmailSent = true,
                Message = "Registration successful. A verification email has been sent to your email address."

            };
        }

        public async Task ResendEmailVerificationAsync(
     string email,
     CancellationToken cancellationToken = default)
        {
            var normalizedEmail =
                email.Trim().ToLowerInvariant();

            var user =
                await _userManager.FindByEmailAsync(
                    normalizedEmail);

            if (user == null || user.EmailConfirmed)
            {
                return;
            }

            var token =
                await _userManager.GenerateEmailConfirmationTokenAsync(
                    user);

            var encodedToken =
                Uri.EscapeDataString(token);

            var verificationLink =
                $"{_emailSettings.VerificationBaseUrl}" +
                $"?userId={user.Id}" +
                $"&token={encodedToken}";

            await _emailService.SendEmailVerificationAsync(
                user.Email!,
                user.FirstName,
                verificationLink,
                cancellationToken);
        }

        public async Task ResetPasswordAsync(
     ResetPasswordRequest request,
     CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(request.UserId, out var userId))
            {
                throw new InvalidOperationException(
                    "Invalid password reset request.");
            }

            var user =
                await _userManager.FindByIdAsync(
                    userId.ToString());

            if (user == null)
            {
                throw new InvalidOperationException(
                    "Invalid password reset request.");
            }

            var decodedToken =
                Uri.UnescapeDataString(request.Token);

            var result =
                await _userManager.ResetPasswordAsync(
                    user,
                    decodedToken,
                    request.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(
                    "; ",
                    result.Errors.Select(
                        e => e.Description));

                throw new InvalidOperationException(errors);
            }

            if (result.Succeeded)
            {
                var refreshTokens =
                    await _dbContext.RefreshTokens
                        .Where(x =>
                            x.UserId == user.Id &&
                            x.RevokedAt == null)
                        .ToListAsync(cancellationToken);

                foreach (var refreshToken in refreshTokens)
                {
                    refreshToken.RevokedAt = DateTime.UtcNow;
                }

                await _dbContext.SaveChangesAsync(
                    cancellationToken);
            }
        }

        public async Task SendEmailVerificationAsync(
     Guid userId,
     CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(
                userId.ToString());

            if (user == null)
            {
                throw new InvalidOperationException(
                    "User account was not found.");
            }

            if (string.IsNullOrWhiteSpace(user.Email))
            {
                throw new InvalidOperationException(
                    "User does not have a valid email address.");
            }

            if (user.EmailConfirmed)
            {
                return;
            }

            // Generate ASP.NET Core Identity email confirmation token
            var verificationToken =
                await _userManager.GenerateEmailConfirmationTokenAsync(user);

            // Encode token so it can safely be placed in a URL
            var encodedToken =
                Uri.EscapeDataString(verificationToken);

            var verificationLink =
                $"{_emailSettings.VerificationBaseUrl}" +
                $"?userId={user.Id}" +
                $"&token={encodedToken}";

            await _emailService.SendEmailVerificationAsync(
                user.Email,
                user.FirstName,
                verificationLink,
                cancellationToken);
        }

        public async Task<TwoFactorSetupResponse> SetupTwoFactorAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");

            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("User account is inactive.");

            }

            var key = await _userManager.GetAuthenticatorKeyAsync(user);

            if (string.IsNullOrWhiteSpace(key))
            {
                await _userManager.ResetAuthenticatorKeyAsync(user);

                key = await _userManager.GetAuthenticatorKeyAsync(user);
            }

            if (string.IsNullOrWhiteSpace(key))
            {
                throw new InvalidOperationException(
                    "Unable to generate authenticator key.");
            }

            var email = user.Email ?? user.UserName ?? user.Id.ToString();

            var authenticatorUri =
                GenerateAuthenticatorUri(
                    email,
                    key);

            return new TwoFactorSetupResponse
            {
                SharedKey = FormatKey(key),
                AuthenticatorUri = authenticatorUri
            };
        }

        public async Task VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(request.UserId, out var userId))
            {
                throw new UnauthorizedAccessException(
                    "Invalid verification request.");
            }

            var user =
                await _userManager.FindByIdAsync(
                    userId.ToString());

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid verification request.");
            }

            if (user.EmailConfirmed)
            {
                return;
            }

            var decodedToken =
                Uri.UnescapeDataString(request.Token);

            var result =
                await _userManager.ConfirmEmailAsync(
                    user,
                    decodedToken);

            if (!result.Succeeded)
            {
                throw new UnauthorizedAccessException(
                    "Invalid or expired verification token.");
            }
        }

        public async Task<bool> VerifyTwoFactorCodeAsync(Guid userId, string code, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");

            }

            if (!user.TwoFactorEnabled)
            {
                throw new InvalidOperationException("Two-factor authentication is not enabled.");

            }

            return await _userManager.VerifyTwoFactorTokenAsync(user, _userManager.Options.Tokens.AuthenticatorTokenProvider, code);
        }

        private async Task<AuthResponse> GenerateAuthResponseAsync(ApplicationUser user, CancellationToken cancellationToken = default)
        {
           var accessToken = _tokenService.GenerateAccessToken(
                user.Id,
                user.Email!,
                user.FirstName,
                user.LastName);

            var refreshToken =
                _tokenService.GenerateRefreshToken();

            var accessTokenExpires =
                _tokenService.GetAccessTokenExpiration();

            var refreshTokenExpires =
                _tokenService.GetRefreshTokenExpiration();

            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TokenHash =
                    _tokenService.HashRefreshToken(refreshToken),
                ExpiresAt = refreshTokenExpires,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.RefreshTokens.Add(refreshTokenEntity);

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            return new AuthResponse
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!,

                AccessToken = accessToken,
                RefreshToken = refreshToken,

                AccessTokenExpiresAt =
                    accessTokenExpires,

                RefreshTokenExpiresAt =
                    refreshTokenExpires
            };
        }

        private static string FormatKey(string key)
        {
            var result = new StringBuilder();

            var normalizedKey =
                key.Replace(" ", string.Empty)
                   .ToUpperInvariant();

            for (var i = 0; i < normalizedKey.Length; i++)
            {
                if (i > 0 && i % 4 == 0)
                {
                    result.Append(' ');
                }

                result.Append(normalizedKey[i]);
            }

            return result.ToString();
        }

        private static string GenerateAuthenticatorUri(string email, string key)
        {
            var issuer = "GoFund";

            return
                $"otpauth://totp/{Uri.EscapeDataString(issuer)}:" +
                $"{Uri.EscapeDataString(email)}" +
                $"?secret={key}" +
                $"&issuer={Uri.EscapeDataString(issuer)}" +
                "&digits=6" +
                "&period=30";
        }

        public async Task<AuthResponse> LoginTwoFactorAsync(
     VerifyTwoFactorLoginRequest request,
     CancellationToken cancellationToken = default)
        {
            if (!Guid.TryParse(
                    request.ChallengeId,
                    out var challengeId))
            {
                throw new UnauthorizedAccessException(
                    "Invalid 2FA challenge.");
            }

            if (string.IsNullOrWhiteSpace(request.Code))
            {
                throw new UnauthorizedAccessException(
                    "Authenticator code is required.");
            }

            var challenge =
                await _dbContext.TwoFactorLoginChallenges
                    .FirstOrDefaultAsync(
                        x => x.Id == challengeId,
                        cancellationToken);

            if (challenge == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid 2FA challenge.");
            }

            var now = DateTime.UtcNow;

            if (challenge.IsUsed)
            {
                throw new UnauthorizedAccessException(
                    "This 2FA challenge has already been used.");
            }

            if (challenge.ExpiresAtUtc <= now)
            {
                challenge.IsUsed = true;
                challenge.UsedAtUtc = now;

                await _dbContext.SaveChangesAsync(
                    cancellationToken);

                throw new UnauthorizedAccessException(
                    "2FA challenge has expired.");
            }

            if (challenge.FailedAttempts >=
                _twoFactorSettings.MaximumAttempts)
            {
                challenge.IsUsed = true;
                challenge.UsedAtUtc = now;

                await _dbContext.SaveChangesAsync(
                    cancellationToken);

                throw new UnauthorizedAccessException(
                    "Maximum 2FA attempts exceeded.");
            }

            var user =
                await _userManager.FindByIdAsync(
                    challenge.UserId.ToString());

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid 2FA challenge.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "User account is inactive.");
            }

            if (!user.TwoFactorEnabled)
            {
                throw new InvalidOperationException(
                    "Two-factor authentication is not enabled.");
            }

            var valid =
                await _userManager.VerifyTwoFactorTokenAsync(
                    user,
                    _userManager.Options
                        .Tokens
                        .AuthenticatorTokenProvider,
                    request.Code);

            if (!valid)
            {
                challenge.FailedAttempts++;

                if (challenge.FailedAttempts >=
                    _twoFactorSettings.MaximumAttempts)
                {
                    challenge.IsUsed = true;
                    challenge.UsedAtUtc = now;
                }

                await _dbContext.SaveChangesAsync(
                    cancellationToken);

                throw new UnauthorizedAccessException(
                    "Invalid authenticator code.");
            }

            // -----------------------------------------------------
            // Successful 2FA
            // -----------------------------------------------------

            challenge.IsUsed = true;
            challenge.UsedAtUtc = now;

            user.LastLoginAt = now;

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            await _userManager.UpdateAsync(user);

            return await GenerateAuthResponseAsync(
                user,
                cancellationToken);
        }

        private async Task<TwoFactorLoginChallenge>
    CreateTwoFactorLoginChallengeAsync(
        Guid userId,
        CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            // Invalidate previous active challenges
            var existingChallenges =
                await _dbContext.TwoFactorLoginChallenges
                    .Where(x =>
                        x.UserId == userId &&
                        !x.IsUsed &&
                        x.ExpiresAtUtc > now)
                    .ToListAsync(cancellationToken);

            foreach (var challenge in existingChallenges)
            {
                challenge.IsUsed = true;
                challenge.UsedAtUtc = now;
            }

            var challengeEntity = new TwoFactorLoginChallenge
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAtUtc = now,
                ExpiresAtUtc = now.AddMinutes(
                    _twoFactorSettings.ChallengeLifetimeMinutes),

                FailedAttempts = 0,
                IsUsed = false
            };

            _dbContext.TwoFactorLoginChallenges.Add(
                challengeEntity);

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            return challengeEntity;
        }

        public async Task<TwoFactorRecoveryCodesResponse>
    GenerateTwoFactorRecoveryCodesAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
        {
            var user =
                await _userManager.FindByIdAsync(
                    userId.ToString());

            if (user == null)
            {
                throw new KeyNotFoundException(
                    "User not found.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "User account is inactive.");
            }

            if (!user.TwoFactorEnabled)
            {
                throw new InvalidOperationException(
                    "Two-factor authentication is not enabled.");
            }

            var codes =
                await _userManager.GenerateNewTwoFactorRecoveryCodesAsync(
                    user,
                    10);

            if (codes == null || !codes.Any())
            {
                throw new InvalidOperationException(
                    "Unable to generate recovery codes.");
            }

            return new TwoFactorRecoveryCodesResponse
            {
                RecoveryCodes = codes.ToList()
            };
        }

        public async Task<AuthResponse>
    LoginTwoFactorRecoveryCodeAsync(
        VerifyTwoFactorRecoveryCodeRequest request,
        CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.ChallengeId))
            {
                throw new UnauthorizedAccessException(
                    "2FA challenge is required.");
            }

            if (string.IsNullOrWhiteSpace(request.RecoveryCode))
            {
                throw new UnauthorizedAccessException(
                    "Recovery code is required.");
            }

            if (!Guid.TryParse(
                    request.ChallengeId,
                    out var challengeId))
            {
                throw new UnauthorizedAccessException(
                    "Invalid 2FA challenge.");
            }

            var challenge =
                await _dbContext.TwoFactorLoginChallenges
                    .FirstOrDefaultAsync(
                        x => x.Id == challengeId,
                        cancellationToken);

            if (challenge == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid 2FA challenge.");
            }

            var now = DateTime.UtcNow;

            if (challenge.IsUsed)
            {
                throw new UnauthorizedAccessException(
                    "This 2FA challenge has already been used.");
            }

            if (challenge.ExpiresAtUtc <= now)
            {
                challenge.IsUsed = true;
                challenge.UsedAtUtc = now;

                await _dbContext.SaveChangesAsync(
                    cancellationToken);

                throw new UnauthorizedAccessException(
                    "2FA challenge has expired.");
            }

            if (challenge.FailedAttempts >=
                _twoFactorSettings.MaximumAttempts)
            {
                challenge.IsUsed = true;
                challenge.UsedAtUtc = now;

                await _dbContext.SaveChangesAsync(
                    cancellationToken);

                throw new UnauthorizedAccessException(
                    "Maximum 2FA attempts exceeded.");
            }

            var user =
                await _userManager.FindByIdAsync(
                    challenge.UserId.ToString());

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid 2FA challenge.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "User account is inactive.");
            }

            if (!user.TwoFactorEnabled)
            {
                throw new InvalidOperationException(
                    "Two-factor authentication is not enabled.");
            }

            var normalizedCode =
                request.RecoveryCode
                    .Replace(" ", string.Empty)
                    .Trim();

            var result =
     await _userManager.RedeemTwoFactorRecoveryCodeAsync(
         user,
         normalizedCode);

            if (!result.Succeeded)
            {
                challenge.FailedAttempts++;

                if (challenge.FailedAttempts >=
                    _twoFactorSettings.MaximumAttempts)
                {
                    challenge.IsUsed = true;
                    challenge.UsedAtUtc = now;
                }

                await _dbContext.SaveChangesAsync(
                    cancellationToken);

                throw new UnauthorizedAccessException(
                    "Invalid recovery code.");
            }

            // Recovery code successfully consumed.
            // Make the challenge unusable.
            challenge.IsUsed = true;
            challenge.UsedAtUtc = now;

            user.LastLoginAt = now;

            await _dbContext.SaveChangesAsync(
                cancellationToken);

            await _userManager.UpdateAsync(user);

            return await GenerateAuthResponseAsync(
                user,
                cancellationToken);
        }

        public async Task<TwoFactorStatusResponse>
    GetTwoFactorStatusAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
        {
            var user =
                await _userManager.FindByIdAsync(
                    userId.ToString());

            if (user == null)
            {
                throw new KeyNotFoundException(
                    "User not found.");
            }

            var authenticatorKey =
                await _userManager.GetAuthenticatorKeyAsync(user);

            return new TwoFactorStatusResponse
            {
                Enabled = user.TwoFactorEnabled,

                HasAuthenticator =
                    !string.IsNullOrWhiteSpace(authenticatorKey),

                IsEmailConfirmed = user.EmailConfirmed
            };
        }
    }
}
