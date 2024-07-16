import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.GenerateCodes> & {
  /** Present only in the response. */
  _links: { self: { href: string } };
  /** Present only in the response. */
  message: string;
};
