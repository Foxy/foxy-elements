import { ProductItem } from './ProductItem';

export const EmptyProduct = {
  name: '',
  price: 0,
  image: '',
  url: '',
  code: '',
  parent_code: '',
  quantity: 0,
  quantity_max: 0,
  quantity_min: 0,
  description: '',
  category: '',
  expires: '',
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  shipto: '',
  id: 0,
  alt: '',
  products: [],
  children: [],
};

export type QuickOrderProduct = Partial<typeof EmptyProduct>;

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
