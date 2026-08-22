import type { ReactNode } from "react";
import { useIntl } from "react-intl";
import { Button } from "@foxy.io/design-system/button";
import { messages } from "./messages";

type Props = {
  title?: ReactNode;
  onBack: () => void;
  children: ReactNode;
};

/**
 * Replaces `PortalDialog` for the five account sub-pages: a Back button
 * instead of dialog chrome, since these render as the account screen's main
 * content rather than an overlay. `title` is optional -- a page whose
 * underlying resource is still loading (Task 3 onward) has nothing to put
 * here yet, and an empty `<h2>` would be worse than none.
 */
export function AccountPageLayout({ title, onBack, children }: Props) {
  const intl = useIntl();

  return (
    <div>
      <Button type="button" $variant="link" onClick={onBack}>
        {intl.formatMessage(messages.back)}
      </Button>

      {title ? <h2>{title}</h2> : null}

      {children}
    </div>
  );
}
