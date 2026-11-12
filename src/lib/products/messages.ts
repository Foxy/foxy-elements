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
  increase: {
    id: "product_quantity_increase",
    defaultMessage: "Increase quantity",
  },
  decrease: {
    id: "product_quantity_decrease",
    defaultMessage: "Decrease quantity",
  },
  optionalHint: {
    id: "product_optional_hint",
    defaultMessage: "(optional)",
  },
  optionalHintPrice: {
    id: "product_optional_hint_price",
    defaultMessage: "(optional, +{price})",
  },
  requiredHint: {
    id: "product_required_hint",
    defaultMessage: "(required)",
  },
  requiredHintPrice: {
    id: "product_required_hint_price",
    defaultMessage: "(required, +{price})",
  },
  modifierPrice: {
    id: "product_modifier_price",
    defaultMessage: "+{price}",
  },
  valuePrice: {
    id: "product_value_price",
    defaultMessage: "{label} · {price}",
  },
  choose: {
    id: "product_choose",
    defaultMessage: "Choose…",
  },
  chooseA: {
    id: "product_choose_a",
    defaultMessage: "Choose a {option}",
  },
  chooseAn: {
    id: "product_choose_an",
    defaultMessage: "Choose an {option}",
  },
  chooseTwo: {
    id: "product_choose_two",
    defaultMessage: "Choose {first} and {second}",
  },
  addWithPrice: {
    id: "product_add_with_price",
    defaultMessage: "{label} · {price}",
  },
  onlyLeft: {
    id: "product_only_left",
    defaultMessage: "Only {count} left",
  },
  inStock: {
    id: "product_in_stock",
    defaultMessage: "In stock",
  },
  upTo: {
    id: "product_up_to",
    defaultMessage: "Up to {max} characters",
  },
  counter: {
    id: "product_counter",
    defaultMessage: "{count} / {max}",
  },
  showPhoto: {
    id: "product_show_photo",
    defaultMessage: "Show photo {number}",
  },
  details: {
    id: "product_details",
    defaultMessage: "Details",
  },
  brand: {
    id: "product_brand",
    defaultMessage: "Brand",
  },
  sku: {
    id: "product_sku",
    defaultMessage: "SKU",
  },
  gtin: {
    id: "product_gtin",
    defaultMessage: "GTIN",
  },
  mpn: {
    id: "product_mpn",
    defaultMessage: "MPN",
  },
  count: {
    id: "product_count",
    defaultMessage: "{count, plural, one {# product} other {# products}}",
  },
  showing: {
    id: "product_showing",
    defaultMessage: "Showing {shown} of {total}",
  },
  sortBy: {
    id: "product_sort_by",
    defaultMessage: "Sort by",
  },
  sortName: {
    id: "product_sort_name",
    defaultMessage: "Name",
  },
  sortPriceAscending: {
    id: "product_sort_price_ascending",
    defaultMessage: "Price, low to high",
  },
  sortPriceDescending: {
    id: "product_sort_price_descending",
    defaultMessage: "Price, high to low",
  },
  sortNewest: {
    id: "product_sort_newest",
    defaultMessage: "Newest",
  },
  required: {
    id: "product_required",
    defaultMessage: "Fill this in to add it to the cart.",
  },
  tooLong: {
    id: "product_too_long",
    defaultMessage: "Must be {max} characters or fewer.",
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
