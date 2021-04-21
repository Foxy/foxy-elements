import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';

export type Rel = Rels.Subscription;
export type Data = Resource<Rel, { zoom: ['last_transaction', { transaction_template: 'items' }] }>;
