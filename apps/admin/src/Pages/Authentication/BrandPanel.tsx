import { Landmark } from "lucide-react";

/**
 * BrandPanel
 * Static left-hand side of the auth layout. Kept as its own component so it's
 * easy to reuse or swap the illustration/copy later without touching AuthLayout.
 */
export function BrandPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 bg-slate-100 px-10 py-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-900 text-white">
          <Landmark className="h-5 w-5" />
        </div>
        <h1 className="max-w-[220px] text-base font-semibold leading-snug text-blue-900">
          QoFund Administrative Console
        </h1>
      </div>

      <img
        src="/brand image.png"
        alt=""
        aria-hidden="true"
        className="h-48 w-48 object-contain"
      />

      <div className="max-w-xs space-y-2">
        <p className="text-xl font-semibold text-slate-900">
          Manage Wallets, Savings and International Transfers securely
        </p>
        <p className="text-sm text-slate-500">
          Review applications, approve disbursements, and keep funds moving
          to the right accounts.
        </p>
      </div>
    </div>
  );
}
