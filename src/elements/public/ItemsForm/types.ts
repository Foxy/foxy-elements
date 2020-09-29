export interface ItemInterface {
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
  open?: Record<string, boolean>;
  signatures?: Record<string, string>;
  items?: ItemInterface[];
  [key: string]:
    | string
    | number
    | undefined
    | ItemInterface[]
    | Record<string, string>
    | Record<string, boolean>
    | null;
}

export interface ImageDescription {
  src?: string;
  alt?: string;
  quantity?: number;
}
