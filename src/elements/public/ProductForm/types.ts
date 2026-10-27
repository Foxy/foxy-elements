import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

// =============================================================================
// definition.* shape
// =============================================================================

export interface ProductDefinitionImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ProductDefinitionOption {
  name: string;
  value: string;
  /** Override price for this option (additive to definition.price). */
  price_mod?: number;
  /** Override weight for this option (additive to definition.weight). */
  weight_mod?: number;
}

/**
 * Free-form `definition` JSON blob on a Product resource. Every field is
 * optional from the API's perspective — products are created lazily and
 * inherit from parents/templates. Field meanings come from
 * `views/resources/product.twig` in hypermedia-api.
 */
export interface ProductDefinition {
  name?: string;
  /** Price in the store's currency. The API stores what it's sent: a string or a number. */
  price?: number | string;
  /** Strikethrough/compare-at price for "$25 ~~$30~~" presentation. */
  list_price?: number;
  /** Per-currency price overrides keyed by ISO 4217 code. */
  prices?: Record<string, string>;
  description?: string;
  images?: ProductDefinitionImage[];
  brand?: string;
  gtin?: string;
  mpn?: string;
  attributes?: Record<string, string | number | boolean>;
  options?: ProductDefinitionOption[];
  meta_title?: string;
  meta_description?: string;
  weight?: number;
  /** Foxy billing/shipping category code (separate from Foxy Products taxonomy). */
  category_code?: string;
  subscription_frequency?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  /** Phase 2: per-locale overrides for description, alt text, etc. */
  translations?: Record<string, Partial<ProductDefinition>>;
}

// =============================================================================
// Product graph
// =============================================================================

export type ProductType = 'standalone' | 'parent' | 'variant' | 'template';

export interface Products extends Graph {
  curie: 'fx:products';
  links: CollectionGraphLinks<Products>;
  props: CollectionGraphProps;
  child: Product;
}

export interface Product extends Graph {
  curie: 'fx:product';

  links: {
    'self': Product;
    'fx:store': Rels.Store;
    'fx:product_variants': Products;
    'fx:product_stock_rules': ProductStockRules;
    'fx:product_tags': ProductTags;
    'fx:product_events': ProductEvents;
    'fx:product_category': import('../ProductCategoryForm/types').ProductCategory;
    'fx:parent_product': Product;
    /** Present only when accessed via the admin Lambda. */
    'fx:create_upload_url'?: any;
  };

  props: {
    id: number;
    sku: string;
    product_type: ProductType;
    /** ID of the parent product when this is a variant, or the inherited template. */
    inherit_from_id: number | null;
    definition: ProductDefinition;
    /** `definition` with inheritance applied, maintained by the API. */
    compiled_definition: ProductDefinition;
    /** `null` means the product is not stock-tracked (always available). */
    stock_level: number | null;
    /** Starting stock level for "duplicate and reset" recurring-event workflows. */
    stock_level_initial: number | null;
    /** Number of active variants under this product (denormalized, read-only). */
    variant_count: number;
    /** ID into `product_categories` (this is the Foxy Products taxonomy, NOT item_categories). */
    category_id: number | null;
    /** Soft-delete timestamp. `null` means active. */
    deleted_at: string | null;
    date_created: string | null;
    date_modified: string | null;
  };
}

// =============================================================================
// ProductStockRule graph
// =============================================================================

export interface ProductStockRules extends Graph {
  curie: 'fx:product_stock_rules';
  links: CollectionGraphLinks<ProductStockRules>;
  props: CollectionGraphProps;
  child: ProductStockRule;
}

export interface ProductStockRule extends Graph {
  curie: 'fx:product_stock_rule';
  links: {
    'self': ProductStockRule;
    'fx:store': Rels.Store;
    'fx:source_product': Product;
    'fx:target_product': Product;
  };
  props: {
    id: number;
    /** When this product is purchased… */
    source_product_id: number;
    /** …decrement the stock of this product. */
    target_product_id: number;
    /** Units to decrement per unit purchased (default 1). */
    multiplier: number;
    date_created: string | null;
    date_modified: string | null;
  };
}

// =============================================================================
// Imports forward-declared above
// =============================================================================
//
// We import ProductCategory only as a type reference inside the Product `_links`
// to avoid pulling the runtime definition. Same for ProductEvents and ProductTags
// — they live in their own siblings' types.ts.

import type { ProductTags } from '../ProductTagForm/types';
import type { ProductEvents } from '../ProductEventCard/types';

export type Data = Resource<Product>;
