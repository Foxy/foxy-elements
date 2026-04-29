import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import type { Product } from '../ProductForm/types';

// =============================================================================
// ProductTag graph
// =============================================================================
//
// Each tag is its own API sub-resource (POST to create, DELETE to remove).
// Not a string array on the product definition — see ProductForm/InternalAsyncListControl
// usage. Chip visual is the responsibility of ProductTagCard.

export interface ProductTags extends Graph {
  curie: 'fx:product_tags';
  links: CollectionGraphLinks<ProductTags>;
  props: CollectionGraphProps;
  child: ProductTag;
}

export interface ProductTag extends Graph {
  curie: 'fx:product_tag';
  links: {
    'self': ProductTag;
    'fx:store': Rels.Store;
    'fx:product': Product;
  };
  props: {
    product_id: number;
    tag: string;
    date_created: string | null;
  };
}

export type Data = Resource<ProductTag>;
