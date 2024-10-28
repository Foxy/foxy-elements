import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

// TODO: simplify once SDK types are updated
export type Data = Resource<Rels.EmailTemplate> & { subject: string };
