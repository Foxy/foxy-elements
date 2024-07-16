import { Rels as BackendRels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/customer';

export type TransactionPageGetter = (
  href: string,
  data: Resource<Rels.Transaction> | Resource<BackendRels.Transaction> | null
) => string;

export type CustomerPageGetter = (href: string) => string;

export type Settings = Resource<Rels.CustomerPortalSettings>;
export type Item = Resource<Rels.Item>;
export type Data = Resource<BackendRels.Subscription>;
