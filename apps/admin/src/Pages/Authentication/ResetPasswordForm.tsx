import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormHeader } from "./AuthFormHeader";

/**
 * ResetPasswordForm
 * Final step of password recovery, shown after email/OTP verification.
 * Calls onSubmit({ password }) once the two fields match.
 */
type ResetPasswordFormProps = {
  onSubmit?: (values: { password: string }) => void;
  isLoading?: boolean;
  error?: string;
};

export function ResetPasswordForm({ onSubmit, isLoading = false, error }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  function handleSubmit(e: any) {
    e.preventDefault();
    if (mismatch) return;
    onSubmit?.({ password });
  }

  return (
    <div className="w-full max-w-sm">
      <AuthFormHeader title="Set a new password" subtitle="Choose a strong password you haven't used before." />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              required
              minLength={8}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9"
              required
            />
          </div>
          {mismatch && <p className="text-sm text-red-600">Passwords don&apos;t match.</p>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-blue-900 hover:bg-blue-800"
          disabled={isLoading || mismatch || !password}
        >
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </div>
  );
}
