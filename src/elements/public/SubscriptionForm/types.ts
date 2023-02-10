import { Rels as BackendRels } from '@foxy.io/sdk/backend';
import { Rels } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';
import { Renderer } from '../../../mixins/configurable';
import { SubscriptionForm } from '.';
import { CancellationForm } from '../CancellationForm/CancellationForm';

export type TransactionPageGetter = (
  href: string,
  data: Resource<Rels.Transaction> | Resource<BackendRels.Transaction> | null
) => string;

export type Settings = Resource<Rels.CustomerPortalSettings>;
export type Item = Resource<Rels.Item>;
export type Data = Resource<BackendRels.Subscription>;

export type Templates = {
  'header:before'?: Renderer<SubscriptionForm>;
  'header:after'?: Renderer<SubscriptionForm>;
  'items:before'?: Renderer<SubscriptionForm>;
  'items:after'?: Renderer<SubscriptionForm>;
  'items:actions:before'?: Renderer<SubscriptionForm>;
  'items:actions:after'?: Renderer<SubscriptionForm>;
  'end-date:before'?: Renderer<SubscriptionForm>;
  'end-date:after'?: Renderer<SubscriptionForm>;
  'end-date:form:warning:before'?: Renderer<CancellationForm>;
  'end-date:form:warning:after'?: Renderer<CancellationForm>;
  'end-date:form:end-date:before'?: Renderer<CancellationForm>;
  'end-date:form:end-date:after'?: Renderer<CancellationForm>;
  'end-date:form:submit:before'?: Renderer<CancellationForm>;
  'end-date:form:submit:after'?: Renderer<CancellationForm>;
  'next-transaction-date:before'?: Renderer<SubscriptionForm>;
  'next-transaction-date:after'?: Renderer<SubscriptionForm>;
  'frequency:before'?: Renderer<SubscriptionForm>;
  'frequency:after'?: Renderer<SubscriptionForm>;
  'transactions:before'?: Renderer<SubscriptionForm>;
  'transactions:after'?: Renderer<SubscriptionForm>;
};
