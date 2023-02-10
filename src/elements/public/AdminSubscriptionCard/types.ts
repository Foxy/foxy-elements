import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data =
  | Resource<Rels.Subscription>
  | Resource<Rels.Subscription, { zoom: 'transaction_template' }>
  | Resource<Rels.Subscription, { zoom: { transaction_template: 'items' } }>;
