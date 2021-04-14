import * as FoxySDK from '@foxy.io/sdk';

import { DBC } from '../../../utils/parse-dbc';

export type Rel = FoxySDK.Backend.Rels.Attribute;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;

export type Field = 'name' | 'value' | 'visibility';
export type Control = Field | 'delete' | 'create';
export type ReadonlyValue = boolean | DBC<Field>;
export type DisabledValue = boolean | DBC<Control>;
export type ExcludedValue = boolean | DBC<Control>;
