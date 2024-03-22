import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data =
  | Resource<Rels.Subscription>
  | Resource<Rels.Subscription, { zoom: ['customer'] }>
  | Resource<Rels.Subscription, { zoom: ['transaction_template', 'customer'] }>
  | Resource<Rels.Subscription, { zoom: [{ transaction_template: 'items' }, 'customer'] }>;
