import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

// This form edits the `data_retention` field of a store, so it binds to the
// store resource itself.
export type Data = Resource<Rels.Store>;

export type ParsedDataRetention = {
  auto_anonymize: boolean;
  auto_anonymize_days: number | null;
};
