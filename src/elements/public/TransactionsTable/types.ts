import * as FoxySDK from '@foxy.io/sdk';

export type Rel = FoxySDK.Backend.Rels.Transactions;
export type Data = FoxySDK.Core.Resource<Rel, { zoom: 'items' }>;
