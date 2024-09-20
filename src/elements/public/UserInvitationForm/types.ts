import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

// TODO: replace with SDK import when SDK has the types
export interface UserInvitation extends Graph {
  curie: 'fx:user_invitation';
  links: {
    'self': UserInvitation;
    'fx:user': Rels.User;
    'fx:store': Rels.Store;
    'fx:resend': { curie: 'fx:resend' };
  };
  props: {
    store_url: string;
    store_name: string;
    store_email: string;
    store_domain: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    status: 'sent' | 'accepted' | 'rejected' | 'revoked';
    date_created: string;
    date_modified: string;
  };
}

// TODO: replace with SDK import when SDK has the types
export interface UserInvitations extends Graph {
  curie: 'fx:user_invitations';
  links: CollectionGraphLinks<UserInvitations>;
  props: CollectionGraphProps;
  child: UserInvitation;
}

export type Data = Resource<UserInvitation>;
