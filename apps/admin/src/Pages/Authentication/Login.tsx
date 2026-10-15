import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OtpForm } from "./OtpForm";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showOtp, setShowOtp] = useState(false);
  const [challengeId, setChallengeId] = useState("");

  const navigate = useNavigate();

  // Email + Password Login
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "https://localhost:7062/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
            data?.error ||
            "Invalid email or password."
        );
        return;
      }

      console.log("Login response:", data);

      // --------------------------------
      // 2FA required
      // --------------------------------
      if (data.requiresTwoFactor) {
        if (!data.challengeId) {
          setError(
            "Unable to start two-factor authentication."
          );
          return;
        }

        setChallengeId(data.challengeId);
        setShowOtp(true);

        return;
      }

      // --------------------------------
      // Normal login
      // --------------------------------
      if (data.auth) {
        localStorage.setItem(
          "accessToken",
          data.auth.accessToken
        );

        localStorage.setItem(
          "refreshToken",
          data.auth.refreshToken
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: data.auth.userId,
            firstName: data.auth.firstName,
            lastName: data.auth.lastName,
            email: data.auth.email,
          })
        );

        navigate("/dashboard");

        return;
      }

      setError(
        "Unexpected login response from the server."
      );
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2FA Login
  const handleOtpSubmit = async (code: string) => {
    setError("");

    if (!challengeId) {
      setError(
        "Your authentication session has expired. Please log in again."
      );
      setShowOtp(false);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "https://localhost:7062/api/auth/2fa/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            challengeId,
            code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
            data?.error ||
            "Invalid verification code."
        );
        return;
      }

      console.log("2FA response:", data);

      // /api/auth/2fa/login returns AuthResponse directly
      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      localStorage.setItem(
        "refreshToken",
        data.refreshToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        })
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("2FA login error:", error);
      setError(
        "Unable to verify the authentication code."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Return from OTP screen to Login screen
  const handleOtpBack = () => {
    setShowOtp(false);
    setChallengeId("");
    setError("");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Login Section */}
      <div className="relative flex w-full flex-col justify-center overflow-hidden bg-white md:w-1/2">
        {/* Logo */}
        <div className="absolute left-4 top-4 flex w-full items-center justify-between pr-4 md:pr-8">
          <img
            src="/assets/logo-clear.png"
            alt="GoFund Logo"
            className="h-auto w-48"
          />
        </div>

        {/* Login Form Container */}
        <div className="relative flex w-full max-w-md items-center justify-center self-center px-8 -mt-12 md:mt-8">
          <div className="w-full space-y-1">
            {/* Header */}
            <div className="space-y-2 pb-4 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900">
                {showOtp ? "Two-Factor Authentication" : "Portal Login"}
              </h2>

              <p className="text-sm text-gray-600">
                {showOtp
                  ? "Enter the verification code from your authenticator app"
                  : "Hi, Welcome back"}
              </p>
            </div>

            {/* Error Message */}
            {error && !showOtp && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* Login / OTP */}
            {showOtp ? (
              <OtpForm
                destination={email}
                onSubmit={handleOtpSubmit}
                onBack={handleOtpBack}
                isLoading={isSubmitting}
                error={error}
              />
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                    className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#007D53] focus:ring-1 focus:ring-[#007D53] disabled:bg-gray-100"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-[#007D53] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      className="w-full rounded-md border border-gray-300 px-4 py-3 pr-20 text-sm outline-none transition focus:border-[#007D53] focus:ring-1 focus:ring-[#007D53] disabled:bg-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#007D53] hover:underline disabled:opacity-50"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(
                          event.target.checked
                        )
                      }
                      disabled={isSubmitting}
                      className="h-4 w-4 rounded border-gray-300 accent-[#007D53]"
                    />

                    Remember me
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md bg-[#007D53] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#006b47] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Signing in..."
                    : "Login"}
                </button>
              </form>
            )}

            {/* Register Link */}
            {!showOtp && (
              <div className="pt-5">
                <p className="text-center text-sm text-gray-600">
                  Not registered yet?

                  <Link
                    to="/register"
                    className="ml-2 font-semibold text-[#007D53] hover:underline"
                  >
                    Register Now
                  </Link>
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} GoFund. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="hidden md:block md:w-1/2">
        <img
          src="/assets/bkgrdPix.png"
          alt="Login Visual"
          className="h-full w-full object-cover object-top"
        />
      </div>
    </div>
  );
};

export default Login;