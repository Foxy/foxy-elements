import * as FoxySDK from '@foxy.io/sdk';

export type Rel = FoxySDK.Backend.Rels.Subscription;
export type Data = FoxySDK.Core.Resource<Rel, { zoom: 'last_transaction' }>;
