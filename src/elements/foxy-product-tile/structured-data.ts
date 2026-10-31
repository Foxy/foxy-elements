import { priceRange, productPrice } from "@/lib/products/price";
import type { CatalogProduct } from "@/lib/products/types";

const IN_STOCK = "https://schema.org/InStock";
const OUT_OF_STOCK = "https://schema.org/OutOfStock";

/**
 * schema.org `Product` for one tile. Search engines want a currency with a
 * price, so the offer is left out when the currency isn't known. A parent
 * gets an `AggregateOffer` over its variants' prices.
 */
export function productJsonLd(
  product: CatalogProduct,
  name: string,
  currency: string | null,
  url: string | null,
): Record<string, unknown> {
  const { definition } = product;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: product.sku,
  };
  if (definition.images?.length) data.image = definition.images.map((image) => image.src);
  if (definition.brand) data.brand = { "@type": "Brand", name: definition.brand };
  if (definition.gtin) data.gtin = definition.gtin;
  if (definition.mpn) data.mpn = definition.mpn;
  if (url) data.url = url;

  if (currency) {
    const availability = product.is_in_stock ? IN_STOCK : OUT_OF_STOCK;
    const variants = product._embedded?.variants ?? [];
    const range = priceRange(product, currency);
    if (product.product_type === "parent" && variants.length && range) {
      data.offers = {
        "@type": "AggregateOffer",
        priceCurrency: currency,
        lowPrice: range.min.toFixed(2),
        highPrice: range.max.toFixed(2),
        offerCount: variants.length,
        availability,
      };
    } else {
      const { price } = productPrice(product, currency);
      if (price !== null) {
        data.offers = {
          "@type": "Offer",
          priceCurrency: currency,
          price: price.toFixed(2),
          availability,
          ...(url ? { url } : {}),
        };
      }
    }
  }

  return data;
}
