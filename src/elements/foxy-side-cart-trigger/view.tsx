// src/elements/foxy-side-cart-trigger/view.tsx
import { Badge } from "@foxy.io/design-system/badge";
import { Button } from "@foxy.io/design-system/button";

export type SideCartTriggerViewProps = {
  /** `null` means the count is not known yet — render no badge. */
  itemCount: number | null;
  /** Non-empty only for a change the shopper caused. */
  announcement: string;
  onClick: () => void;
};

export function SideCartTriggerView({
  itemCount,
  announcement,
  onClick,
}: SideCartTriggerViewProps) {
  const label = itemCount === null ? "Cart" : `Cart, ${itemCount} items`;

  return (
    <>
      <Button aria-label={label} onClick={onClick}>
        Cart
        {itemCount !== null && <Badge>{itemCount}</Badge>}
      </Button>
      <span aria-live="polite" role="status">
        {announcement}
      </span>
    </>
  );
}
