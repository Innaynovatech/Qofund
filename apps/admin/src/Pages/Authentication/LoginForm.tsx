import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormHeader } from "./AuthFormHeader";

/**
 * LoginForm
 * Renders inside <AuthLayout>. Calls onSubmit with { email, password }.
 * onForgotPassword / onSignUp let the parent page switch which form is
 * mounted on the right side (see AuthPage.jsx for an example).
 */
export function LoginForm({ onSubmit, onForgotPassword, onSignUp, isLoading = false, error }: { onSubmit?: (values: { email: string; password: string }) => void; onForgotPassword?: () => void; onSignUp?: () => void; isLoading?: boolean; error?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: any) {
    e.preventDefault();
    onSubmit?.({ email, password });
  }

  return (
    <div className="w-full max-w-sm">
      <AuthFormHeader title="Welcome back" subtitle="Sign in to manage your QoFund workspace." />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-9"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-[var(--brand-blue)] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full " disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSignUp} className="font-medium text-[var(--brand-blue)] hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
}