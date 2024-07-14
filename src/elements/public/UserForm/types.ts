import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Rel = Rels.User;
export type Data = Resource<Rel>;
