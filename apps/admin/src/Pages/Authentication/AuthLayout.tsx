import type { ReactNode } from "react";
import { BrandPanel } from "./BrandPanel";


export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden  w-full items-center justify-center p-4 ">
      <div className="grid w-full grid-cols-1 gap-x-4  bg-white md:grid-cols-2">
        {/* Left: static brand panel, hidden on small screens */}
        <div className="hidden border border-gray-50 rounded-xl md:block">
          <BrandPanel />
        </div>

        {/* Right: dynamic form slot */}
        <div className="flex flex-col justify-center rounded-xl border bg-[#F6F6F680] border-gray-100 px-6 py-10 sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}