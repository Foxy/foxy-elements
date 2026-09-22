// src/elements/foxy-side-cart-trigger/view.tsx
import { useIntl } from "react-intl";
import { Badge } from "@foxy.io/design-system/badge";
import { Button } from "@foxy.io/design-system/button";
import styled from "styled-components";
import { messages } from "./messages";

// `@foxy.io/design-system` ships no visually-hidden / screen-reader-only
// helper (checked its full export list). This repo already has the pattern
// once, as `VisuallyHiddenLegend` in
// `foxy-payment-method-selector/view.tsx` -- same clip-rect technique,
// duplicated here rather than imported because it wraps a `Field.Legend`
// there and a plain `span` here. `display: none` / `visibility: hidden`
// would both pull the element out of the accessibility tree along with the
// viewport; this keeps it announceable while occupying no visible space.
const VisuallyHiddenLiveRegion = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

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
      <VisuallyHiddenLiveRegion aria-live="polite">
        {announcement}
      </VisuallyHiddenLiveRegion>
    </>
  );
}
