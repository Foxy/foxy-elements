import * as FoxySDK from '@foxy.io/sdk';

import { DBC } from '../../../utils/parse-dbc';

export type Rel = FoxySDK.Backend.Rels.Customer;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;

export type Field = 'first_name' | 'last_name' | 'email' | 'tax_id';
export type Control = Field | 'delete' | 'create';

export type ReadonlyValue = boolean | DBC<Field>;
export type DisabledValue = boolean | DBC<Control>;
export type ExcludedValue = boolean | DBC<Control>;

export type TextFieldParams = {
  field: Field;
  required?: boolean;
};
