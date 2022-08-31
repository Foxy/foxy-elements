import type { PaymentMethod } from '../PaymentsApi/api/types';

export type Data = PaymentMethod;
export type Block = NonNullable<Data['helper']['additional_fields']>['blocks'][number];
