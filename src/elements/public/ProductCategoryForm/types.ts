import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import type { Products } from '../ProductForm/types';

// =============================================================================
// ProductCategory graph
// =============================================================================
//
// Foxy Products taxonomy categories — separate from Foxy's billing/shipping
// `item_categories`. Tree shape via `parent_id` (adjacency list) plus a
// materialized `path` for fast subtree queries (max depth 5).

export interface ProductCategories extends Graph {
  curie: 'fx:product_categories';
  links: CollectionGraphLinks<ProductCategories>;
  props: CollectionGraphProps;
  child: ProductCategory;
}

export interface ProductCategory extends Graph {
  curie: 'fx:product_category';
  links: {
    'self': ProductCategory;
    'fx:store': Rels.Store;
    'fx:products': Products;
    'fx:parent_category': ProductCategory;
    /** Present only when accessed via the admin Lambda. */
    'fx:create_upload_url'?: any;
  };
  props: {
    id: number;
    parent_id: number | null;
    name: string;
    /** Lowercase kebab-case URL slug, unique per parent within a store. */
    slug: string;
    /** Auto-computed materialized path, e.g. `/clothing/mens/shirts`. */
    path: string;
    /** Public CDN URL (uploaded via `fx:create_upload_url`). */
    image: string | null;
    sort_order: number;
    date_created: string | null;
    date_modified: string | null;
  };
}

export type Data = Resource<ProductCategory>;
