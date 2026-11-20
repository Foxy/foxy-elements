import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import type { Product } from '../ProductForm/types';

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

export type Data = Resource<ProductStockRule>;
