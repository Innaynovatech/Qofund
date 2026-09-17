import { createContext, useContext, useState, type ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalOptions {
  title?: ReactNode;
  widthClassName?: string; // e.g. "sm:max-w-lg"
  footer?: ReactNode; // omit for a default "Close" button
}

interface ModalContextValue {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * Same shape as DrawerProvider — mount once near the app root, then call
 * useModal().openModal(<YourContent />) from anywhere.
 */
export function CustomModal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<ModalOptions>({});

  function openModal(node: ReactNode, opts: ModalOptions = {}) {
    setContent(node);
    setOptions(opts);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <Dialog open={open} onOpenChange={(next) => !next && closeModal()}>
        <DialogContent className={cn("flex flex-col gap-0 p-0 sm:max-w-md", options.widthClassName)}>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <span className="text-base font-semibold text-slate-900">{options.title}</span>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{content}</div>

          <div className="border-t border-slate-200 px-5 py-4">
            {options.footer ?? (
              <Button type="button" variant="outline" className="w-full" onClick={closeModal}>
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
}
