export interface QuickOrderProduct {
  name: string;
  price: number;
  image?: string;
  url?: string;
  code?: string;
  parent_code?: string;
  quantity?: number;
  quantity_max?: number;
  quantity_min?: number;
  category?: string;
  expires?: string;
  weight?: string;
  length?: number;
  width?: number;
  height?: number;
  shipto?: string;
  id?: string;
  alt?: string;
  [propName: string]: string | number | null | undefined;
}

export interface ProductGroup {
  products: QuickOrderProduct[];
  sub_frequency?: string;
  'data-sub-frequency'?: string;
  sub_startdate?: string;
  'data-sub-startdate'?: string;
  sub_enddate?: string;
  'data-sub-enddate'?: string;
  sub_token?: string;
  'data-sub-token'?: string;
  sub_cancel?: string;
  'data-sub-cancel'?: string;
  sub_restart?: string;
  'data-sub-restart'?: string;
  sub_modify?: string;
  'data-sub-modify'?: string;
}
