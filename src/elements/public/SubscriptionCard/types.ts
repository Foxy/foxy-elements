import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';
import { SubscriptionCard } from './SubscriptionCard';

export type Rel = Rels.Subscription;
export type Data = Resource<Rel, { zoom: ['last_transaction', { transaction_template: 'items' }] }>;
export type Templates = { default?: Renderer<SubscriptionCard> };
