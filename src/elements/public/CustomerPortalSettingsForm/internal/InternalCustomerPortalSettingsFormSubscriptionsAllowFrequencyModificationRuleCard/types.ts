import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

interface FrequencyModificationRule {
  links: { self: FrequencyModificationRule };
  props: Rels.CustomerPortalSettings['props']['subscriptions']['allowFrequencyModification'][number];
}

export type Data = Resource<FrequencyModificationRule>;
