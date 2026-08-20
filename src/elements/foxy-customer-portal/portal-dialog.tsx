import type { ReactNode } from "react";
import { Dialog } from "@foxy.io/design-system/dialog";
import { usePortalContainer } from "./portal-container";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
};

/**
 * Every dialog in this element, with the two things that are easy to get wrong.
 *
 * `Dialog.Popup` does not render outside `Portal`/`Viewport` — omit them and
 * the dialog is silently absent. And Base UI reads an explicit `container` of
 * `null` as "the container ref has not resolved yet" and waits forever, rather
 * than falling back to `<body>`; `undefined` is what means "use the default".
 * The container itself matters because this element renders inside a shadow
 * root, and a dialog portalled to `<body>` lands outside the tree
 * `StyleSheetManager` injected the styles into, so it renders unstyled.
 */
export function PortalDialog({ open, onOpenChange, title, children }: Props) {
  const portalContainer = usePortalContainer();

  return (
    <Dialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Dialog.Portal container={portalContainer ?? undefined}>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>
            <Dialog.Title>{title}</Dialog.Title>
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
