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
    this.price = Number(this.getAttribute('price'));
    this.total = this.price;
    this.quantity = Number(this.getAttribute('quantity'));
  }
}
