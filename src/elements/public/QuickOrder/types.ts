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
  signature: '',
  open: [],
  products: [],
  children: [],
};

export type QuickOrderProduct = Partial<typeof EmptyProduct>;
