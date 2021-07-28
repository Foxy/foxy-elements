import type * as FoxySDK from '@foxy.io/sdk';

import { Templates as TableTemplates } from '../Table/types';

export type Rel = FoxySDK.Backend.Rels.Subscriptions;
export type Data = FoxySDK.Core.Resource<
  Rel,
  { zoom: [{ transaction_template: 'items' }, 'last_transaction'] }
>;

export type Templates = TableTemplates<Data>;
