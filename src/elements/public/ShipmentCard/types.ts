import type { Rels } from '@foxy.io/sdk/backend';
import type { Resource } from '@foxy.io/sdk/core';

// TODO update when SDK types are corrected
export type Rel = Rels.Shipment & {
  links: {
    'fx:custom_fields': Rels.CustomFields;
    'fx:attributes': Rels.Attributes;
  };

  zooms: {
    custom_fields?: Rels.CustomFields;
    attributes?: Rels.Attributes;
    items?: Rels.Items;
  };
};

export type Data = Resource<Rel, { zoom: { items: 'item_options' } }>;
