import { Rels as BackendRels } from '@foxy.io/sdk/backend';
import { Rels } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';

export type Settings = Resource<Rels.CustomerPortalSettings>;
export type Item = Resource<Rels.Item>;
export type Data = Resource<
  BackendRels.Subscription,
  { zoom: ['last_transaction', { transaction_template: 'items' }] }
>;
