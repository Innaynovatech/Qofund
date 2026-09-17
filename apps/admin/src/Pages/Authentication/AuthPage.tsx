import { useState, type SetStateAction } from "react";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { OtpForm } from "./OtpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";


export default function AuthPage() {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin({ email, password }: { email: string; password: string }) {
    setIsLoading(true);
    setError(null);
    try {
      setEmail(email);
      // await api.login({ email, password })
      setStep("otp");
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp(code: any) {
    setIsLoading(true);
    setError(null);
    try {
      // await api.verifyOtp({ email, code })
      window.location.assign("/dashboard");
    } catch (err) {
      setError("That code didn't work. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(submittedEmail: SetStateAction<string>) {
    setEmail(submittedEmail);
    // await api.requestPasswordReset({ email: submittedEmail })
  }

  async function handleResetPassword({ password }) {
    setIsLoading(true);
    setError(null);
    try {
      // await api.resetPassword({ email, password })
      setStep("login");
    } catch (err) {
      setError("Couldn't reset password. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      {step === "login" && (
        <LoginForm
          onSubmit={handleLogin}
          onForgotPassword={() => setStep("forgot-password")}
          onSignUp={() => {}}
          isLoading={isLoading}
          error={error}
        />
      )}

      {step === "otp" && (
        <OtpForm
          destination={email}
          onSubmit={handleVerifyOtp}
          onResend={() => {}}
          onBack={() => setStep("login")}
          isLoading={isLoading}
          error={error}
        />
      )}

      {step === "forgot-password" && (
        <ForgotPasswordForm
          onSubmit={handleForgotPassword}
          onBack={() => setStep("login")} error={undefined}        />
      )}

      {step === "reset-password" && (
        <ResetPasswordForm
          onSubmit={handleResetPassword}
          isLoading={isLoading}
          error={error}
        />
      )}
    </AuthLayout>
  );
}
