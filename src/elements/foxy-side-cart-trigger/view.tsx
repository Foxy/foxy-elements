// src/elements/foxy-side-cart-trigger/view.tsx
import { useIntl } from "react-intl";
import { Badge } from "@foxy.io/design-system/badge";
import { Button } from "@foxy.io/design-system/button";
import { messages } from "./messages";

export type SideCartTriggerViewProps = {
  /** `null` means the count is not known yet — render no badge. */
  itemCount: number | null;
  /** The count to announce, or `null` for nothing to announce. Set only for
   *  a change the shopper caused — see the element's `#onCountChange`. */
  announcedCount: number | null;
  onClick: () => void;
};

export function SideCartTriggerView({
  itemCount,
  announcedCount,
  onClick,
}: SideCartTriggerViewProps) {
  const intl = useIntl();
  const label =
    itemCount === null
      ? intl.formatMessage(messages.triggerLabel)
      : intl.formatMessage(messages.triggerLabelWithCount, {
          count: itemCount,
        });
  const announcement =
    announcedCount === null
      ? ""
      : intl.formatMessage(messages.triggerLabelWithCount, {
          count: announcedCount,
        });

  return (
    <>
      <Button aria-label={label} onClick={onClick}>
        {intl.formatMessage(messages.triggerLabel)}
        {itemCount !== null && <Badge>{itemCount}</Badge>}
      </Button>
      {/* `role="status"` already implies `aria-live="polite"`; only one is
      needed, and `aria-live` is what the element's own test queries for. */}
      <span aria-live="polite">{announcement}</span>
    </>
  );
}
