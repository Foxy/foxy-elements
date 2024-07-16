import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Rel = Rels.DefaultPaymentMethod;
export type Data = Resource<Rel, undefined>;
