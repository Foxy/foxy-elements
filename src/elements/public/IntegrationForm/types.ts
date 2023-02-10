import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

interface PostResponseRel {
  curie: 'fx:integration';

  links: {
    'self': PostResponseRel;
    'fx:client': Rels.Client;
    'fx:store': Rels.Store;
    'fx:user': Rels.User;
  };

  props: {
    client_id: string;
    client_secret: string;
    refresh_token: string;
    access_token: string;
    message: string;
  };
}

export type Data = Resource<Rels.Integration>;
export type PostResponseData = Resource<PostResponseRel>;
