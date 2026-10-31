import { IntlMessageFormat } from "intl-messageformat";
import enUsMessages from "@/locales/en-US.json";

// A local identity, not react-intl's `defineMessages`, so the elements that
// don't use React don't bundle it. `formatjs extract` matches the call by
// name, so the strings still reach `src/locales/en-US.json`.
const defineMessages = <
  T extends Record<string, { id: string; defaultMessage: string }>,
>(
  descriptors: T,
): T => descriptors;

export const messages = defineMessages({
  addToCart: {
    id: "product_add_to_cart",
    defaultMessage: "Add to cart",
  },
  soldOut: {
    id: "product_sold_out",
    defaultMessage: "Sold out",
  },
  unavailable: {
    id: "product_unavailable",
    defaultMessage: "Unavailable",
  },
  priceRange: {
    id: "product_price_range",
    defaultMessage: "{min} – {max}",
  },
  priceWas: {
    id: "product_price_was",
    defaultMessage: "Was {price}",
  },
  chooseOptions: {
    id: "product_choose_options",
    defaultMessage: "Choose options",
  },
  viewProduct: {
    id: "product_view",
    defaultMessage: "View product",
  },
  variant: {
    id: "product_variant",
    defaultMessage: "Choose one",
  },
  valueSoldOut: {
    id: "product_value_sold_out",
    defaultMessage: "{label} (sold out)",
  },
  quantity: {
    id: "product_quantity",
    defaultMessage: "Quantity",
  },
  optional: {
    id: "product_optional",
    defaultMessage: "{label} (optional)",
  },
  modifierPrice: {
    id: "product_modifier_price",
    defaultMessage: "+{price}",
  },
  noChoice: {
    id: "product_no_choice",
    defaultMessage: "None",
  },
  loadMore: {
    id: "product_load_more",
    defaultMessage: "Load more",
  },
  empty: {
    id: "product_collection_empty",
    defaultMessage: "No products here yet.",
  },
  loadFailed: {
    id: "product_load_failed",
    defaultMessage: "Products couldn't load. Try again later.",
  },
});

export type MessageDescriptor = { id: string; defaultMessage: string };

const MESSAGES_BY_LOCALE: Record<string, Record<string, string>> = {
  "en-US": enUsMessages as Record<string, string>,
  en: enUsMessages as Record<string, string>,
};

export function format(
  locale: string,
  descriptor: MessageDescriptor,
  values?: Record<string, string | number>,
): string {
  const catalog =
    MESSAGES_BY_LOCALE[locale] ??
    MESSAGES_BY_LOCALE[locale.split("-")[0]] ??
    MESSAGES_BY_LOCALE["en-US"];
  const message = catalog[descriptor.id] ?? descriptor.defaultMessage;

  try {
    return String(new IntlMessageFormat(message, locale).format(values));
  } catch {
    return String(
      new IntlMessageFormat(descriptor.defaultMessage, "en-US").format(values),
    );
  }
}
