import { createContext, useContext, useState, type ReactNode } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerOptions {
  /** Text shown in the top chrome bar (not the same as your own in-body header) */
  title?: ReactNode;
  /** Tailwind width override, e.g. "sm:max-w-xl" */
  widthClassName?: string;
  /** Custom footer content. Omit to get a default "Close" button. */
  footer?: ReactNode;
}

interface DrawerContextValue {
  openDrawer: (content: ReactNode, options?: DrawerOptions) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

/**
 * Mount this once near the root of your app (see AppProviders.tsx).
 * Anywhere below it, call useDrawer().openDrawer(<YourContent />) —
 * no need to lift open/close state into whichever page triggers it.
 */
export function CustomDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<DrawerOptions>({});

  function openDrawer(node: ReactNode, opts: DrawerOptions = {}) {
    setContent(node);
    setOptions(opts);
    setOpen(true);
  }

  function closeDrawer() {
    setOpen(false);
  }

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      {children}

      <Sheet open={open} onOpenChange={(next) => !next && closeDrawer()}>
        <SheetContent
          side="right"
          className={cn("flex w-full flex-col gap-0 p-0 sm:max-w-md", options.widthClassName)}
        >
          {/* Chrome bar: title + close. If your generated ui/sheet.tsx already
              renders its own close X, remove this button to avoid a duplicate. */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <span className="text-base font-semibold text-slate-900">{options.title}</span>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">{content}</div>

          <div className="border-t border-slate-200 px-5 py-4">
            {options.footer ?? (
              <Button type="button" variant="outline" className="w-full" onClick={closeDrawer}>
                Close
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within a DrawerProvider");
  return ctx;
}
