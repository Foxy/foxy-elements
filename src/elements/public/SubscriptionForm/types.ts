import * as FoxySDK from '@foxy.io/sdk';

import { DBC } from '../../../utils/parse-dbc';

export type Rel = FoxySDK.Backend.Rels.Subscription;
export type Data = FoxySDK.Core.Resource<Rel, { zoom: 'last_transaction' }>;
export type Field = 'frequency' | 'next_transaction_date' | 'end_date';

export type ReadonlyValue = boolean | DBC<Field>;
export type DisabledValue = boolean | DBC<Field>;
export type ExcludedValue = boolean | DBC<Field>;
