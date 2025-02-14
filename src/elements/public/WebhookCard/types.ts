import type { Rels } from '@foxy.io/sdk/backend';
import type { Resource } from '@foxy.io/sdk/core';

// TODO: simplify once SDK has types for `is_active`
export type Data = Resource<Rels.Webhook> & { is_active: boolean };
