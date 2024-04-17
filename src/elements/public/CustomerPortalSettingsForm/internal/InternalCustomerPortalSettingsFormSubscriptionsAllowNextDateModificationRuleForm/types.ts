import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

type NonBoolean<T> = T extends boolean ? never : T;
type Nullable<T> = { [K in keyof T]: T[K] | null };

interface NextDateModificationRule {
  links: { self: NextDateModificationRule };
  props: Nullable<
    Exclude<
      Rels.CustomerPortalSettings['props']['subscriptions']['allowNextDateModification'],
      boolean | undefined
    >[number]
  >;
}

export type Data = Resource<NextDateModificationRule>;
