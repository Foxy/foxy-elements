import type { Rels as CustomerRels } from '@foxy.io/sdk/customer';
import type { Rels as BackendRels } from '@foxy.io/sdk/backend';
import type { Resource } from '@foxy.io/sdk/core';

export type Rel = BackendRels.DefaultPaymentMethod | CustomerRels.DefaultPaymentMethod;
export type Data = Resource<Rel>;
