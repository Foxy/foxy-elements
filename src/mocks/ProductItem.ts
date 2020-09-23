import { Product } from '../elements/public/QuickOrder/types';

export class MockProduct extends HTMLElement {
  static pidSource = 1;

  public name = 'Mock Product';

  public price = 10;

  public quantity = 1;

  public pid = 0;

  public currency = '';

  public code: string | number = '';

  public parent_code: string | number = '';

  public open?: Record<string, boolean>;

  public signatures?: Record<string, string>;

  public color?: unknown;

  constructor(p?: Product) {
    super();
    this.pid = MockProduct.pidSource++;
    if (p) {
      if (p.name) this.name = p.name;
      if (p.price) this.price = p.price;
      if (p.quantity) this.quantity = p.quantity;
    } else {
      this.__fromAttr('name');
      this.__fromAttr('price');
      this.__fromAttr('quantity');
      this.__fromAttr('code');
    }
  }

  connectedCallback(): void {
    this.setAttribute('product', 'true');
  }

  get value(): Product {
    const result = {
      pid: this.pid,
      price: this.price,
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
    this.price = +p.price!;
    this.quantity = +p.quantity!;
    this.signatures = p.signatures;
    this.code = p.code!;
    this.parent_code = p.parent_code!;
    this.color = p.color;
  }

  get total(): number {
    return this.price * this.quantity;
  }

  private __fromAttr(key: string) {
    const value = this.getAttribute(key);
    if (value !== null) (this as any)[key] = value; // eslint-disable-line no-use-before-define
  }
}
