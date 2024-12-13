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
    template_set_uri?: string;
    redirect?: string;
    coupon?: string;
    empty?: 'false' | 'true' | 'reset';
    cart?: 'add' | 'checkout';
    items?: {
      name: string;
      item_category_uri?: string;
      price: number;
      price_configurable?: boolean;
      code?: string;
      parent_code?: string;
      image?: string;
      url?: string;
      sub_enabled?: boolean;
      sub_frequency?: string;
      sub_startdate_format?: 'none' | 'yyyymmdd' | 'dd' | 'duration';
      sub_startdate?: string | number;
      sub_enddate_format?: 'none' | 'yyyymmdd' | 'duration';
      sub_enddate?: string;
      discount_details?: string;
      discount_type?: string;
      discount_name?: string;
      expires_format?: 'minutes' | 'timestamp' | 'none';
      expires_value?: number;
      quantity?: number;
      quantity_max?: number;
      quantity_min?: number;
      weight?: number;
      length?: number;
      width?: number;
      height?: number;
      custom_options: {
        name: string;
        value?: string;
        value_configurable?: boolean;
        price?: number;
        replace_price?: boolean;
        weight?: number;
        replace_weight?: boolean;
        code?: string;
        replace_code?: boolean;
        item_category_uri?: string;
      }[];
    }[];
  };
}

export type Data = Resource<ExperimentalAddToCartSnippet>;
