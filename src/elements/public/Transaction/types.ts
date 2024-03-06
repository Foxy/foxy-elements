import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<
  Rels.Transaction,
  { zoom: [{ applied_gift_card_codes: ['gift_card'] }, 'applied_taxes', 'shipments', 'discounts'] }
>;
