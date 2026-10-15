import { useState, type FormEvent } from "react";
import { Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormHeader } from "./AuthFormHeader";

type ForgotPasswordFormProps = {
    onSubmit?: (email: string) => void | Promise<void>;
    onBack?: () => void;
    isLoading?: boolean;
    error?: string;
};

/**
 * ForgotPasswordForm
 *
 * Step 1 of password recovery:
 * - Collects the user's email address.
 * - Calls the parent onSubmit handler.
 * - Shows a confirmation state after submission.
 *
 * Pair with OtpForm if verification happens via a code rather than
 * an email reset link.
 */
export function ForgotPasswordForm({
    onSubmit,
    onBack,
    isLoading = false,
    error,
}: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        await onSubmit?.(email);
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <div className= "w-full max-w-sm text-center" >
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-900" >
                <MailCheck className="h-6 w-6" />
                    </div>

                    < h2 className = "text-xl font-semibold text-slate-900" >
                        Check your email
                            </h2>

                            < p className = "mt-2 text-sm text-slate-500" >
                                If an account exists for { email }, we & apos; ve sent
                    instructions to reset your password.
                </p>

            < Button
        type = "button"
        variant = "outline"
        className = "mt-6 w-full"
        onClick = { onBack }
            >
            Back to sign in
                </Button>
                </div>
        );
    }

    return (
        <div className= "w-full max-w-sm" >
        <AuthFormHeader
                title="Forgot your password?"
    subtitle = "Enter the email linked to your account and we'll send you a reset link."
        />

        <form
                onSubmit={ handleSubmit }
    className = "space-y-4"
    noValidate
        >
        <div className="space-y-2" >
            <Label htmlFor="reset-email" > Email </Label>

                < div className = "relative" >
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <Input
                            id="reset-email"
    type = "email"
    autoComplete = "email"
    placeholder = "Enter your email"
    value = { email }
    onChange = {(e) => setEmail(e.target.value)
}
className = "pl-9"
required
    />
    </div>
    </div>

{
    error && (
        <p className="text-sm text-red-600" >
        { error }
            </p>
                )
}

<Button
                    type="submit"
className = "w-full bg-blue-900 hover:bg-blue-800"
disabled = { isLoading }
    >
{ isLoading? "Sending link...": "Send reset link" }
    </Button>
    </form>

    < button
type = "button"
onClick = { onBack }
className = "mt-6 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700"
    >
    Back to sign in
        </button>
        </div>
    );
}