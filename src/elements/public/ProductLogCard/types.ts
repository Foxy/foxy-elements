import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import type { Product } from '../ProductForm/types';

export type ProductLogType = 'created' | 'updated' | 'deleted' | 'stock_adjustment' | 'stock_reset';

/** Who or what made the change, such as `mit_admin`, `mit_api`, `mit_system` or `cit_customer_portal`. */
export type ProductLogSource = string;

/** A field's value before and after the change. */
export interface ProductLogChange {
  before: unknown;
  after: unknown;
}

export interface ProductLogs extends Graph {
  curie: 'fx:product_logs';
  links: CollectionGraphLinks<ProductLogs>;
  props: CollectionGraphProps;
  child: ProductLog;
}

export interface ProductLog extends Graph {
  curie: 'fx:product_log';
  links: {
    'self': ProductLog;
    'fx:store': Rels.Store;
    'fx:product': Product;
    'fx:transaction': Rels.Transaction;
  };
  props: {
    id: number;
    transaction_id: number | null;
    type: ProductLogType;
    source: ProductLogSource | null;
    /** Structured diff: `{ field: { before: val, after: val } }`. */
    changes: Record<string, ProductLogChange> | null;
    error_message: string | null;
    /** Anything else the entry says, such as the reason for a stock change. */
    details: Record<string, unknown> | null;
    date_created: string | null;
  };
}

export type Data = Resource<ProductLog>;
