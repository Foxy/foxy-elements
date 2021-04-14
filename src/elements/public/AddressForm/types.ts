import * as FoxySDK from '@foxy.io/sdk';

import { DBC } from '../../../utils/parse-dbc';

export type Rel = FoxySDK.Backend.Rels.CustomerAddress;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;
export type Field =
  | 'address_name'
  | 'first_name'
  | 'last_name'
  | 'company'
  | 'phone'
  | 'address1'
  | 'address2'
  | 'country'
  | 'region'
  | 'city'
  | 'postal_code';

export type Control = Field | 'delete' | 'create';

export type ComboBoxParams = {
  source: string[];
  field: Field;
  custom?: boolean;
};

export type TextFieldParams = {
  field: Field;
  wide?: boolean;
  required?: boolean;
  readonly?: boolean;
};

export type ReadonlyValue = boolean | DBC<Field>;
export type DisabledValue = boolean | DBC<Control>;
export type ExcludedValue = boolean | DBC<Control>;
