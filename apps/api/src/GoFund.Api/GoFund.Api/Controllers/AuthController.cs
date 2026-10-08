using GoFund.Application.Auth;
using GoFund.Application.Auth.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace GoFund.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Registers a new GoFund user.
    /// </summary>
    /// <param name="request">
    /// User registration details.
    /// </param>
    /// <param name="cancellationToken">
    /// Cancellation token.
    /// </param>
    /// <returns>
    /// Authentication response containing access and refresh tokens.
    /// </returns>
    /// <response code="200">
    /// User registered successfully.
    /// </response>
    /// <response code="400">
    /// Registration failed because the supplied data is invalid.
    /// </response>
    /// [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RegisterAsync(request, cancellationToken);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Authenticates a GoFund user using email and password.
    /// </summary>
    /// <param name="request">
    /// User login credentials.
    /// </param>
    /// <param name="cancellationToken">
    /// Cancellation token.
    /// </param>
    /// <returns>
    /// Access and refresh tokens for the authenticated user.
    /// </returns>
    /// <response code="200">
    /// Login successful.
    /// </response>
    /// <response code="401">
    /// Invalid credentials or inactive/unverified account.
    /// </response>
    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType(
      typeof(LoginResponse),
      StatusCodes.Status200OK)]
    [ProducesResponseType(
      StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.LoginAsync(request, cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response =
                await _authService.RefreshTokenAsync(
                    request,
                    cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request, CancellationToken cancellationToken)
    {
           await _authService.LogoutAsync(request, cancellationToken);

        return Ok(new
        {
            message = "Logged out successfully."
        });
    }

    /// <summary>
    /// Returns the currently authenticated GoFund user.
    /// </summary>
    /// <response code="200">
    /// Current user returned successfully.
    /// </response>
    /// <response code="401">
    /// Access token is missing or invalid.
    /// </response>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser(
    CancellationToken cancellationToken)
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        try
        {
            var response =
                await _authService.GetCurrentUserAsync(
                    userId,
                    cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

    [AllowAnonymous]
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail(
    [FromQuery] VerifyEmailRequest request,
    CancellationToken cancellationToken)
    {
        try
        {
            await _authService.VerifyEmailAsync(
                request,
                cancellationToken);

            return Ok(new
            {
                message = "Email verified successfully."
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

    [AllowAnonymous]
    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification(
    [FromBody] ResendVerificationRequest request,
    CancellationToken cancellationToken)
    {
        await _authService.ResendEmailVerificationAsync(
            request.Email,
            cancellationToken);

        return Ok(new
        {
            message =
                "If the account exists and requires verification, " +
                "a verification email has been sent."
        });
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
    [FromBody] ForgotPasswordRequest request,
    CancellationToken cancellationToken)
    {
        await _authService.ForgotPasswordAsync(
            request,
            cancellationToken);

        return Ok(new
        {
            message =
                "If the email address is associated with an account, " +
                "a password reset link has been sent."
        });
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
    [FromBody] ResetPasswordRequest request,
    CancellationToken cancellationToken)
    {
        try
        {
            await _authService.ResetPasswordAsync(
                request,
                cancellationToken);

            return Ok(new
            {
                message = "Password reset successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Authenticates a user using a Google ID token.
    /// </summary>
    /// <remarks>
    /// The ID token must be obtained by the frontend
    /// using Google Sign-In. Do not send a Google access
    /// token or GoFund JWT to this endpoint.
    /// </remarks>
    /// <response code="200">
    /// Google authentication successful.
    /// </response>
    /// <response code="401">
    /// Invalid Google ID token.
    /// </response>
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin(
    [FromBody] ExternalLoginRequest request,
    CancellationToken cancellationToken)
    {
        try
        {
            var response =
                await _authService.GoogleLoginAsync(
                    request,
                    cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Authenticates a user using a Microsoft ID token.
    /// </summary>
    /// <remarks>
    /// The ID token must be obtained by the frontend
    /// using Microsoft Authentication Library (MSAL).
    /// </remarks>
    /// <response code="200">
    /// Microsoft authentication successful.
    /// </response>
    /// <response code="401">
    /// Invalid Microsoft ID token.
    /// </response>
    [AllowAnonymous]
    [HttpPost("microsoft")]
    public async Task<IActionResult> MicrosoftLogin(
    [FromBody] ExternalLoginRequest request,
    CancellationToken cancellationToken)
    {
        try
        {
            var response =
                await _authService.MicrosoftLoginAsync(
                    request,
                    cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [Authorize]
    [HttpPost("2fa/setup")]
    [ProducesResponseType(
    typeof(TwoFactorSetupResponse),
    StatusCodes.Status200OK)]
    public async Task<IActionResult> SetupTwoFactor(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var response = await _authService.SetupTwoFactorAsync(userId, cancellationToken);

        return Ok(response);
    }

    [Authorize]
    [HttpPost("2fa/enable")]
    public async Task<IActionResult> EnableTwoFactor([FromBody] EnableTwoFactorRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        await _authService.EnableTwoFactorAsync(userId, request.Code, cancellationToken);

        return Ok(new
        {
            message = "Two-factor authentication enabled successfully."
        });
    }

    [Authorize]
    [HttpPost("2fa/disable")]
    public async Task<IActionResult> DisableTwoFactor(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        await _authService.DisableTwoFactorAsync(userId, cancellationToken);
        return Ok(new
        {
            message = "Two-factor authentication disabled successfully."
        });
    }
    [Authorize]
    [HttpPost("2fa/verify")]
    public async Task<IActionResult> VerifyTwoFactor([FromBody] EnableTwoFactorRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var valid = await _authService.VerifyTwoFactorCodeAsync(userId, request.Code, cancellationToken);
        if (!valid)
        {
            return Unauthorized(new
            {
                message = "Invalid authenticator code."
            });
        }

        return Ok(new
        {
            message = "Two-factor authentication verified."
        });
    }

    private Guid GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var id))
        {
            throw new UnauthorizedAccessException("Invalid user identity.");

        }

        return id;
    }

    /// <summary>
    /// Completes authentication for a user who has
    /// two-factor authentication enabled.
    /// </summary>
    /// <remarks>
    /// The user must first successfully authenticate
    /// using email/password. The returned userId and
    /// six-digit authenticator code are then submitted
    /// to this endpoint.
    /// </remarks>
    /// <response code="200">
    /// Two-factor authentication successful.
    /// </response>
    /// <response code="401">
    /// Invalid authenticator code.
    /// </response>
    //[AllowAnonymous]
    //[HttpPost("2fa/login")]
    //[ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    //[ProducesResponseType(StatusCodes.Status401Unauthorized)]

    //public async Task<IActionResult> LoginTwoFactor([FromBody] VerifyTwoFactorLoginRequest request, CancellationToken cancellationToken)
    //{

    //    try
    //    {
    //        var response =
    //            await _authService.LoginTwoFactorAsync(
    //                request,
    //                cancellationToken);

    //        return Ok(response);
    //    }
    //    catch (UnauthorizedAccessException ex)
    //    {
    //        return Unauthorized(new
    //        {
    //            message = ex.Message
    //        });
    //    }
    //    catch (InvalidOperationException ex)
    //    {
    //        return BadRequest(new
    //        {
    //            message = ex.Message
    //        });
    //    }
    //}

    /// <summary>
    /// Completes login for a user who has
    /// two-factor authentication enabled.
    /// </summary>
    /// <remarks>
    /// The challengeId is returned by POST /api/auth/login
    /// when two-factor authentication is required.
    /// The code is the six-digit code generated by the
    /// user's authenticator application.
    /// </remarks>
    /// <response code="200">
    /// Authentication successful.
    /// </response>
    /// <response code="401">
    /// Invalid, expired, or exhausted challenge/code.
    /// </response>
    [AllowAnonymous]
    [EnableRateLimiting("twoFactorLogin")]
    [HttpPost("2fa/login")]
    [ProducesResponseType(
        typeof(AuthResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LoginTwoFactor(
        [FromBody] VerifyTwoFactorLoginRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response =
                await _authService.LoginTwoFactorAsync(
                    request,
                    cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }


    }

    [Authorize]
    [HttpPost("2fa/recovery-codes")]
    [ProducesResponseType(
    typeof(TwoFactorRecoveryCodesResponse),
    StatusCodes.Status200OK)]
    [ProducesResponseType(
    StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GenerateRecoveryCodes(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();

            var response =
                await _authService
                    .GenerateTwoFactorRecoveryCodesAsync(
                        userId,
                        cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [Authorize]
    [HttpGet("2fa/status")]
    [ProducesResponseType(
    typeof(TwoFactorStatusResponse),
    StatusCodes.Status200OK)]
    [ProducesResponseType(
    StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTwoFactorStatus(
    CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();

            var response =
                await _authService.GetTwoFactorStatusAsync(
                    userId,
                    cancellationToken);

            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }
}