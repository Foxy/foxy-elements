import { Product } from '../elements/public/QuickOrder/types';

export class MockProduct extends HTMLElement implements Product {
  static pidSource = 1;
  [k: string]: any;
  public name = 'Mock Product';
  public total = 10;
  public price = 10;
  public quantity = 1;
  public pid = 0;
  public currency = '';
  public code: string | number = '';
  public parent_code: string | number = '';
  public open?: Record<string, boolean>;
  public signatures?: Record<string, string>;

  constructor(p?: Product) {
    super();
    this.pid = MockProduct.pidSource++;
    if (p) {
      if (p.name) this.name = p.name;
      if (p.price) this.price = p.price;
      if (p.quantity) this.quantity = p.quantity;
      if (p.currency) this.currency = p.currency;
    } else {
      this.__fromAttr('name');
      this.__fromAttr('price');
      this.__fromAttr('quantity');
      this.__fromAttr('code');
    }
    this.total = this.price * this.quantity;
  }

  connectedCallback() {
    this.setAttribute('product', 'true');
  }

  get value() {
    const result = {
      pid: this.pid,
      price: this.price,
      currency: this.currency,
      quantity: this.quantity,
    };
    if (this.signatures) (result as any).signatures = this.signatures;
    if (this.code) (result as any).code = this.code;
    if (this.color) (result as any).color = this.color;
    if (this.open) (result as any).open = this.open;
    return result;
  }

  set value(p: Product) {
    this.name = p.name!;
    this.price = p.price!;
    this.quantity = p.quantity!;
    this.currency = p.currency!;
    this.signatures = p.signatures;
    this.code = p.code!;
    this.parent_code = p.parent_code!;
    this.color = p.color;
  }

  private __fromAttr(key: string) {
    const value = this.getAttribute(key);
    if (value !== null) this[key] = value;
  }
}
