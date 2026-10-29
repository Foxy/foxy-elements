import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

// TODO: drop this augmentation once @foxy.io/sdk ships `scope` on fx:user_invitation
// (added on the SDK's feat/user-invitation-scope-type branch) and this package's
// dependency is bumped past ^1.16.2. `scope` is optional so an API predating the field
// leaves the control empty rather than submitting `undefined`.
export type Data = Resource<Rels.UserInvitation> & { scope?: string };
