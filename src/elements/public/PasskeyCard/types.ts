import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { PasskeyCard } from './PasskeyCard';
import type { Renderer } from '../../../mixins/configurable';
import type { Rels } from '@foxy.io/sdk/backend';

export interface Passkeys extends Graph {
  curie: 'fx:passkeys';
  links: CollectionGraphLinks<Passkeys>;
  props: CollectionGraphProps;
  child: Passkey;
}

export interface Passkey extends Graph {
  curie: 'fx:passkey';
  links: {
    'self': Passkey;
    'fx:user': Rels.User;
    'fx:passkeys': Passkeys;
  };
  props: {
    last_login_date: string | null;
    last_login_ua: string | null;
    credential_id: string;
    date_created: string | null;
    date_modified: string | null;
  };
}

export type Data = Resource<Passkey>;

export type Templates = {
  'title:before'?: Renderer<PasskeyCard>;
  'title:after'?: Renderer<PasskeyCard>;
  'subtitle:before'?: Renderer<PasskeyCard>;
  'subtitle:after'?: Renderer<PasskeyCard>;
};
