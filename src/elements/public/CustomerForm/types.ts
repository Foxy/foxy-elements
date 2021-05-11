import * as FoxySDK from '@foxy.io/sdk';

export type Rel = FoxySDK.Customer.Graph;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;
export type TextFieldParams = { field: keyof Data };
