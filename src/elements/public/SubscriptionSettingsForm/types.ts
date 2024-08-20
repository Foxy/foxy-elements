import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Omit<Resource<Rels.SubscriptionSettings>, 'reattempt_bypass_logic'> & {
  // TODO remove once SDK is updated
  reattempt_bypass_logic: 'skip_if_exists' | 'reattempt_if_exists' | '';
};
