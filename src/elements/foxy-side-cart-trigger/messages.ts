import { defineMessages } from "react-intl";

export const messages = defineMessages({
  triggerLabel: {
    id: "side_cart_trigger_label",
    defaultMessage: "Cart",
  },
  triggerLabelWithCount: {
    id: "side_cart_trigger_label_with_count",
    defaultMessage: "Cart, {count, plural, one {# item} other {# items}}",
  },
});
