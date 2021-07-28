import * as FoxySDK from '@foxy.io/sdk';

import { Templates as TableTemplates } from '../Table/types';

export type Rel = FoxySDK.Backend.Rels.Transactions;
export type Data = FoxySDK.Core.Resource<Rel, { zoom: 'items' }>;
export type Templates = TableTemplates<Data>;
