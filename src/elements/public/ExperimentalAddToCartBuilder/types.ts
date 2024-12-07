import type { Graph, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

/** WARNING: this API doesn't exist. Fields and data types may change without notice. */
export interface ExperimentalAddToCartSnippet extends Graph {
  curie: 'fx:experimental_add_to_cart_snippet';
  links: {
    'self': ExperimentalAddToCartSnippet;
    'fx:store': Rels.Store;
  };
  props: {
    template_set_uri: string | null;
    empty: 'false' | 'true' | 'reset';
    cart: 'add' | 'checkout';
    items: {
      name: string;
      item_category_uri?: string | null;
      price: number;
      price_configurable?: boolean;
      code?: string | null;
      parent_code?: string | null;
      image?: string | null;
      url?: string | null;
      sub_enabled?: boolean;
      sub_frequency?: string | null;
      sub_startdate_format?: 'none' | 'yyyymmdd' | 'dd' | 'duration';
      sub_startdate?: string | number | null;
      sub_enddate_format?: 'none' | 'yyyymmdd' | 'duration';
      sub_enddate?: string | null;
      discount_details?: string | null;
      discount_type?: string | null;
      discount_name?: string | null;
      expires_format?: 'minutes' | 'timestamp' | 'none';
      expires_value?: number | null;
      quantity?: number | null;
      quantity_max?: number | null;
      quantity_min?: number | null;
      weight?: number | null;
      length?: number | null;
      width?: number | null;
      height?: number | null;
      custom_options: {
        name: string;
        value?: string;
        value_configurable?: boolean;
        price?: number | null;
        replace_price?: boolean;
        weight?: number | null;
        replace_weight?: boolean;
        code?: string | null;
        replace_code?: boolean;
        item_category_uri?: string | null;
      }[];
    }[];
  };
}

export type Data = Resource<ExperimentalAddToCartSnippet>;
