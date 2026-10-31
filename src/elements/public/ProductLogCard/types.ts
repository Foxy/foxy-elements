import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import type { Product } from '../ProductForm/types';

// =============================================================================
// ProductLog graph
// =============================================================================
//
// Mirrors the `subscription_logs` pattern. The log is read-only via the
// API; rows are written by the system as side effects of CRUD on products.

export type ProductLogType = 'created' | 'updated' | 'deleted' | 'stock_adjustment' | 'stock_reset';

/**
 * MIT/CIT (merchant-initiated / customer-initiated) source convention,
 * shared with subscription_logs. Examples: `mit_admin`, `mit_api`,
 * `mit_system`, `cit_customer_portal`.
 */
export type ProductLogSource = string;

/** `{ field: { before: any, after: any } }` shape for the `changes` JSON column. */
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
    /** Free-form context: stock adjustment amount, transaction_id, etc. */
    details: Record<string, unknown> | null;
    date_created: string | null;
  };
}

export type Data = Resource<ProductLog>;
