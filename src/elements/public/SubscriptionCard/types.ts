import type { Rels as CustomerRels } from '@foxy.io/sdk/customer';
import type { Rels as BackendRels } from '@foxy.io/sdk/backend';
import type { Resource } from '@foxy.io/sdk/core';

export type Settings = Resource<CustomerRels.CustomerPortalSettings>;
export type Data = Resource<Rel, { zoom: { transaction_template: 'items' } }>;
export type Rel = BackendRels.Subscription;
