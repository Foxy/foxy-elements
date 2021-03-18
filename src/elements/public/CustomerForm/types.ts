import * as FoxySDK from '@foxy.io/sdk';

export type Rel = FoxySDK.Integration.Rels.Customer;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;

export type TextFieldParams = {
  field: Exclude<keyof Data, '_links' | '_embedded'>;
  required?: boolean;
};
