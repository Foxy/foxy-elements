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
