import type { Graph, Resource } from '@foxy.io/sdk/core';

import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

interface CollectionResourceItem extends Graph {
  curie: string;
  props: Record<string, unknown>;
  links: { self: CollectionResourceItem; [key: string]: any };
}

interface CollectionResource extends Graph {
  curie: string;
  props: CollectionGraphProps;
  links: CollectionGraphLinks<CollectionResource>;
  child: CollectionResourceItem;
}

export type Collection = Resource<CollectionResource>;
