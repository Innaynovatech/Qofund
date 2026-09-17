import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthFormHeader } from "./AuthFormHeader";

type OtpFormProps = {
  destination?: string;
  length?: number;
  onSubmit?: (code: string) => void;
  onResend?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  error?: string;
  resendSeconds?: number;
};

/**
 * OtpForm
 * Reusable across any flow that needs a code (login 2FA, forgot-password
 * verification, sign-up verification). Pass `destination` for the copy
 * ("we sent a code to ...") and `onSubmit(code)` / `onResend()` handlers.
 */
export function OtpForm({
  destination,
  length = 6,
  onSubmit,
  onResend,
  onBack,
  isLoading = false,
  error,
  resendSeconds = 30,
}: OtpFormProps) {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(resendSeconds);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  function handleChange(index, value) {
    const char = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    setDigits(Array.from({ length }, (_, i) => pasted[i] ?? ""));
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.(digits.join(""));
  }

  function handleResend() {
    setSecondsLeft(resendSeconds);
    onResend?.();
  }

  const isComplete = digits.every((d) => d !== "");

  return (
    <div className="w-full max-w-sm">
      <AuthFormHeader
        title="Enter verification code"
        subtitle={destination ? `We sent a 6-digit code to ${destination}.` : "Enter the 6-digit code we sent you."}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-12 w-11 rounded-md border border-[#E7E7E7] text-center text-lg font-semibold text-accent-foreground focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full " disabled={!isComplete || isLoading}>
          {isLoading ? "Verifying..." : "Verify code"}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="font-medium text-slate-500 hover:text-slate-700">
          Back
        </button>
        {secondsLeft > 0 ? (
          <span className="text-slate-400">Resend code in {secondsLeft}s</span>
        ) : (
          <button type="button" onClick={handleResend} className="font-medium text-primary hover:underline">
            Resend code
          </button>
        )}
      </div>
    </div>
  );
}


