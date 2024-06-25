import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

type NonBoolean<T> = T extends boolean ? never : T;
type Entry = Rels.CustomerPortalSettings['props']['subscriptions']['allowNextDateModification'];

interface NextDateModificationRule {
  links: { self: NextDateModificationRule };
  props: NonBoolean<Entry>[number];
}

export type Data = Resource<NextDateModificationRule>;
