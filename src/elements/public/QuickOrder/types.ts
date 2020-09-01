export interface Product {
  name?: string;
  price?: number;
  image?: string;
  url?: string;
  code?: string | number;
  parent_code?: string | number;
  quantity?: number;
  quantity_max?: number;
  quantity_min?: number;
  description?: string;
  category?: string;
  expires?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  shipto?: string;
  currency?: string;
  pid?: number;
  alt?: string;
  open?: Record<string, string>;
  signatures?: Record<string, string>;
  products?: Product[];
  [key: string]: string | number | undefined | Product[] | Record<string, string> | null;
}
