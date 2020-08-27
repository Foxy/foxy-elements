import { Product } from '../elements/public/QuickOrder/types';

export class MockProduct extends HTMLElement implements Product {
  [k: string]: any;
  public name = 'Mock Product';
  public total = 10;
  public price = 10;
  public quantity = 1;
  public pid = 0;

  constructor() {
    super();
    this.pid = Math.random();
    this.setAttribute('product', 'true');
    const attrPrice = this.getAttribute('price');
    if (attrPrice !== null) {
      this.price = Number(attrPrice);
      this.total = this.price;
    }
    const attrQty = this.getAttribute('quantity');
    if (attrQty !== null) this.quantity = Number(attrQty);
  }
}
