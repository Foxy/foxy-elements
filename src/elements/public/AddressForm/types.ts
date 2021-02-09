import * as FoxySDK from '@foxy.io/sdk';

export type Rel = FoxySDK.Integration.Rels.CustomerAddress;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;

export type ComboBoxParams = {
  source: string[];
  field: Exclude<keyof Data, '_links' | '_embedded'>;
  custom?: boolean;
};

export type TextFieldParams = {
  field: Exclude<keyof Data, '_links' | '_embedded'>;
  wide?: boolean;
  required?: boolean;
  readonly?: boolean;
};
