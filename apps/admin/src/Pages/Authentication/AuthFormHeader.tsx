import { Landmark } from "lucide-react";

type AuthFormHeaderProps = {
    title: string;
    subtitle?: string;
    showLogo?: boolean;
};

/**
 * AuthFormHeader
 * Shared logo + title + subtitle block used at the top of every right-side form
 * (login, OTP, forgot password, reset password), so copy stays consistent.
 */
export function AuthFormHeader({
    title,
    subtitle,
    showLogo = true,
}: AuthFormHeaderProps) {
    return (
        <div className= "mb-8 space-y-4" >
        { showLogo && (
            <div className="flex items-center gap-2" >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-white" >
                    <Landmark className="h-4 w-4" />
                        </div>

                        < span className = "text-sm font-semibold text-blue-900" >
                            QoFund
                            </span>
                            </div>
            )
}

<div>
    <h2 className="text-xl font-semibold text-slate-900" >
    { title }
        </h2>

{
    subtitle && (
        <p className="mt-1 text-sm text-slate-500" >
        { subtitle }
            </p>
                )
}
</div>
    </div>
    );
}