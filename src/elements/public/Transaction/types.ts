import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.Transaction, { zoom: ['applied_taxes', 'shipments'] }> & {
  _links?: {
    'fx:subscription'?: { href: string };
  };
  _embedded?: {
    'fx:discounts'?: Resource<Rels.Discount>[];
    'fx:applied_gift_card_codes': Resource<Rels.GiftCardCodeLogs['child'], { zoom: 'gift_card' }>[];
  };
  user_agent: string;
  display_id: string | number;
  source: string;
};
