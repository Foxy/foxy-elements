// A local identity, not react-intl's `defineMessages`: importing react-intl
// would pull React into this element's bundle. `formatjs extract` matches the
// call by name, so the strings still reach `src/locales/en-US.json`.
const defineMessages = <
  T extends Record<string, { id: string; defaultMessage: string }>,
>(
  descriptors: T,
): T => descriptors;

export const messages = defineMessages({
  triggerLabel: {
    id: "side_cart_trigger_label",
    defaultMessage: "Cart",
  },
  triggerLabelUnavailable: {
    id: "side_cart_trigger_label_unavailable",
    defaultMessage: "Cart, item count unavailable",
  },
  triggerLabelWithCount: {
    id: "side_cart_trigger_label_with_count",
    defaultMessage: "Cart, {count, plural, one {# item} other {# items}}",
  },
});
