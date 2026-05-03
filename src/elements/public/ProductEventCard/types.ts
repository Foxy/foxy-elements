import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import type { Product } from '../ProductForm/types';

// =============================================================================
// ProductEvent graph
// =============================================================================
//
// Mirrors the `subscription_events` pattern. Event log is read-only via the
// API; rows are written by the system as side effects of CRUD on products.

export type ProductEventType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'stock_adjustment'
  | 'stock_reset';

/**
 * MIT/CIT (merchant-initiated / customer-initiated) source convention,
 * shared with subscription_events. Examples: `mit_admin`, `mit_api`,
 * `mit_system`, `cit_customer_portal`.
 */
export type ProductEventSource = string;

/** `{ field: { before: any, after: any } }` shape for the `changes` JSON column. */
export interface ProductEventChange {
  before: unknown;
  after: unknown;
}

export interface ProductEvents extends Graph {
  curie: 'fx:product_events';
  links: CollectionGraphLinks<ProductEvents>;
  props: CollectionGraphProps;
  child: ProductEvent;
}

export interface ProductEvent extends Graph {
  curie: 'fx:product_event';
  links: {
    'self': ProductEvent;
    'fx:store': Rels.Store;
    'fx:product': Product;
  };
  props: {
    id: number;
    event_type: ProductEventType;
    event_source: ProductEventSource | null;
    /** Structured diff: `{ field: { before: val, after: val } }`. */
    changes: Record<string, ProductEventChange> | null;
    error_message: string | null;
    /** Free-form context: stock adjustment amount, transaction_id, etc. */
    details: Record<string, unknown> | null;
    date_created: string | null;
  };
}

export type Data = Resource<ProductEvent>;
