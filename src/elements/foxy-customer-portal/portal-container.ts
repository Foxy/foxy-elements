import { createContext, useContext } from "react";

/**
 * The node dialogs should portal into.
 *
 * Base UI's `Dialog.Portal` appends to `<body>` by default. This element
 * renders inside a shadow root, and `StyleSheetManager` injects its styles
 * there — so a dialog portalled to `<body>` lands outside the tree those
 * styles reach and renders unstyled. `element.tsx` provides its shadow
 * container here; dialogs pass it to `Dialog.Portal`'s `container` prop.
 *
 * Defaults to `null`, which means "portal to `<body>`" — correct for tests
 * that render a dialog on its own, outside any shadow root.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export function usePortalContainer(): HTMLElement | null {
  return useContext(PortalContainerContext);
}
