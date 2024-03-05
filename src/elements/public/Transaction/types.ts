import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

// TODO: simplify once SDK types are fixed

export type Data = Omit<
  Resource<Rels.Transaction, { zoom: ['applied_taxes', 'shipments'] }>,
  'type'
> & {
  _embedded?: {
    'fx:applied_gift_card_codes': Resource<Rels.GiftCardCodeLogs['child'], { zoom: 'gift_card' }>[];
    'fx:discounts'?: Resource<Rels.Discount>[];
  };
  _links?: {
    'fx:subscription'?: { href: string };
  };
  user_agent: string;
  display_id: string | number;
  source: string;
  type: Rels.Transaction['props']['type'] | '';
};
