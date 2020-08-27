import { Product } from '../elements/public/QuickOrder/types';

export class MockProduct extends HTMLElement implements Product {
  [k: string]: any;
  public name = 'Mock Product';
  public total = 10;
  public price = 10;
  public quantity = 1;
  public pid = 0;

  constructor(p?: Product) {
    super();
    this.setAttribute('product', 'true');
    this.pid = Math.random();
    if (p) {
      if (p.name) this.name = p.name;
      if (p.price) this.price = p.price!;
      if (p.quantity) this.quantity = p.quantity!;
    } else {
      this.__fromAttr('name');
      this.__fromAttr('price');
      this.__fromAttr('quantity');
    }
    this.total = this.price * this.quantity;
  }

  get value () {
    return {
      pid: this.pid,
      price: this.price,
      quantity: this.quantity
    }
  }

  private __fromAttr(key: string) {
    const value = this.getAttribute(key);
    if (value !== null) this[key] = value;
  }
}
