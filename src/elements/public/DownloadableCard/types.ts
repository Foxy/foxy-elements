import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Downloadable = Rels.Downloadable & { links: { 'fx:create_upload_url': any } };
export type Data = Resource<Downloadable>;
