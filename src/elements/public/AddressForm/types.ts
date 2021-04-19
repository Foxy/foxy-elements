import * as FoxySDK from '@foxy.io/sdk';

export type Rel = FoxySDK.Backend.Rels.CustomerAddress;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;

export type ComboBoxParams = {
  source: string[];
  field: keyof Data;
  custom?: boolean;
};

export type TextFieldParams = {
  field: keyof Data;
  wide?: boolean;
  required?: boolean;
  readonly?: boolean;
};
