import * as FoxySDK from '@foxy.io/sdk';

export type Address = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.CustomerAddress, undefined>;

export type ComboBoxParams = {
  source: string[];
  field: Exclude<keyof Address, '_links' | '_embedded'>;
  custom?: boolean;
};

export type TextFieldParams = {
  field: Exclude<keyof Address, '_links' | '_embedded'>;
  wide?: boolean;
  required?: boolean;
};
