import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.Cart, { zoom: ['discounts', 'gift_card_code_logs'] }>;
