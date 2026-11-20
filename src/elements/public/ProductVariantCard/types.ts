// Variants are products. Re-export the Product Data type so card consumers
// don't need to know the underlying resource is `fx:product` rather than
// a distinct `fx:product_variant`.
export type { Data } from '../ProductForm/types';
