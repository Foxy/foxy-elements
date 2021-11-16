import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';
import { TransactionCard } from './TransactionCard';

export type Data = Resource<Rels.Transaction, { zoom: 'items' }>;

export type Templates = Partial<{
  'total:before': Renderer<TransactionCard>;
  'total:after': Renderer<TransactionCard>;
  'status:before': Renderer<TransactionCard>;
  'status:after': Renderer<TransactionCard>;
  'description:before': Renderer<TransactionCard>;
  'description:after': Renderer<TransactionCard>;
  'customer:before': Renderer<TransactionCard>;
  'customer:after': Renderer<TransactionCard>;
}>;
