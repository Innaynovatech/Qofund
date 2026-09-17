import type { ReactNode } from "react";
import { CustomDrawer } from "./CustomDrawer";
import { CustomModal } from "./CustomModal";


/**
 * Wrap your app (e.g. in main.tsx, above your router) with this once.
 * Any component below it can then call useDrawer() / useModal() directly.
 *
 *   <AppProviders>
 *     <RouterProvider router={router} />
 *   </AppProviders>
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CustomDrawer>
      <CustomModal>{children}</CustomModal>
    </CustomDrawer>
  );
}
