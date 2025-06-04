import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<
  Rels.Transaction,
  { zoom: ['gift_card_code_logs', 'applied_taxes', 'shipments', 'discounts', 'folder'] }
>;
