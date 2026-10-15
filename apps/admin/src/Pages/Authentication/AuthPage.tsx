import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { OtpForm } from "./OtpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

type LoginCredentials = {
email: string;
password: string;
};

type ResetPasswordData = {
password: string;
};

type AuthResponse = {
accessToken: string;
refreshToken: string;
userId: string;
firstName: string;
lastName: string;
email: string;
};

type LoginResponse = {
message?: string;
error?: string;
requiresTwoFactor?: boolean;
challengeId?: string;
auth?: AuthResponse;
};

const API_BASE_URL = "https://localhost:7062/api/auth";

export default function AuthPage() {
const navigate = useNavigate();

const [step, setStep] = useState("login");
const [email, setEmail] = useState("");
const [challengeId, setChallengeId] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

function saveAuth(auth: AuthResponse) {
localStorage.setItem("accessToken", auth.accessToken);
localStorage.setItem("refreshToken", auth.refreshToken);

localStorage.setItem(
  "user",
  JSON.stringify({
    userId: auth.userId,
    firstName: auth.firstName,
    lastName: auth.lastName,
    email: auth.email,
  })
);

}

async function handleLogin({
email,
password,
}: LoginCredentials) {
setIsLoading(true);
setError(null);


try {
  const normalizedEmail = email.trim();

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: normalizedEmail,
      password,
    }),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok) {
    setError(
      data.message ||
        data.error ||
        "Invalid email or password."
    );
    return;
  }

  setEmail(normalizedEmail);

  if (data.requiresTwoFactor) {
    if (!data.challengeId) {
      setError(
        "Unable to start two-factor authentication."
      );
      return;
    }

    setChallengeId(data.challengeId);
    setStep("otp");
    return;
  }

  if (data.auth?.accessToken && data.auth?.refreshToken) {
    saveAuth(data.auth);
    navigate("/dashboard");
    return;
  }

  setError("Unexpected login response from the server.");
} catch (err) {
  console.error("Login error:", err);
  setError("Unable to connect to the server.");
} finally {
  setIsLoading(false);
}


}

async function handleVerifyOtp(code: string) {
setIsLoading(true);
setError(null);


if (!challengeId) {
  setError(
    "Your authentication session has expired. Please log in again."
  );
  setStep("login");
  setIsLoading(false);
  return;
}

try {
  const response = await fetch(
    `${API_BASE_URL}/2fa/login`,
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

  const data: AuthResponse & {
    message?: string;
    error?: string;
  } = await response.json();

  if (!response.ok) {
    setError(
      data.message ||
        data.error ||
        "Invalid verification code."
    );
    return;
  }

  if (!data.accessToken || !data.refreshToken) {
    setError(
      "Unexpected two-factor authentication response."
    );
    return;
  }

  saveAuth(data);
  setChallengeId("");
  navigate("/dashboard");
} catch (err) {
  console.error("2FA login error:", err);
  setError("Unable to verify the authentication code.");
} finally {
  setIsLoading(false);
}


}

function handleOtpBack() {
setStep("login");
setChallengeId("");
setError(null);
}

async function handleForgotPassword(submittedEmail: string) {
setEmail(submittedEmail);
setError(null);


// Password-reset API integration can be added separately.
// Keep the existing form flow until its API contract is confirmed.


}

async function handleResetPassword({
password,
}: ResetPasswordData) {
setIsLoading(true);
setError(null);


try {
  // Connect the reset-password endpoint here once its
  // required request fields and response are confirmed.
  console.log("Password reset requested for:", email);
  console.log("New password submitted:", Boolean(password));

  setStep("login");
} catch (err) {
  console.error("Password reset error:", err);
  setError("Couldn't reset password. Try again.");
} finally {
  setIsLoading(false);
}


}

return ( <AuthLayout>
{step === "login" && (
<LoginForm
onSubmit={handleLogin}
onForgotPassword={() => {
setError(null);
setStep("forgot-password");
}}
onSignUp={() => {}}
isLoading={isLoading}
error={error ?? undefined}
/>
)}


  {step === "otp" && (
    <OtpForm
      destination={email}
      onSubmit={handleVerifyOtp}
      onResend={() => {}}
      onBack={handleOtpBack}
      isLoading={isLoading}
      error={error ?? undefined}
    />
  )}

  {step === "forgot-password" && (
    <ForgotPasswordForm
      onSubmit={handleForgotPassword}
      onBack={() => {
        setError(null);
        setStep("login");
      }}
    />
  )}

  {step === "reset-password" && (
    <ResetPasswordForm
      onSubmit={handleResetPassword}
      isLoading={isLoading}
      error={error ?? undefined}
    />
  )}
</AuthLayout>


);
}
