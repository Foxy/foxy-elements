import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import type { Products } from '../ProductForm/types';

// =============================================================================
// ProductCollection graph
// =============================================================================
//
// Foxy Products taxonomy collections — separate from Foxy's billing/shipping
// `item_categories`. Tree shape via `parent_id` (adjacency list) plus a
// materialized `path` for fast subtree queries (max depth 5).

export interface ProductCollections extends Graph {
  curie: 'fx:product_collections';
  links: CollectionGraphLinks<ProductCollections>;
  props: CollectionGraphProps;
  child: ProductCollection;
}

export interface ProductCollection extends Graph {
  curie: 'fx:product_collection';
  links: {
    'self': ProductCollection;
    'fx:store': Rels.Store;
    'fx:products': Products;
    'fx:parent_collection': ProductCollection;
    /** Present only when the collection has an item category. */
    'fx:item_category': Rels.ItemCategory;
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
    /** Item category for products in this collection that have none of their own or inherited. */
    item_category_uri: string | null;
    date_created: string | null;
    date_modified: string | null;
  };
}

export type Data = Resource<ProductCollection>;
