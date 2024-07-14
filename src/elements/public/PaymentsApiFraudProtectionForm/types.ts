import type { FraudProtection } from '../PaymentsApi/api/types';

export type Data = FraudProtection;
export type Block = NonNullable<Data['helper']['json']>['blocks'][number];
