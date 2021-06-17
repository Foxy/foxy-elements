import { ItemInterface } from '../elements/public/ItemsForm/types';

export class MockItem extends HTMLElement {
  static pidSource = 1;

  public name = 'Mock Item';

  public price = 10;

  public quantity = 1;

  public pid = 0;

  public currency = '';

  public code: string | number = '';

  public parent_code: string | number = '';

  public open?: Record<string, boolean>;

  public signatures?: Record<string, string>;

  public color?: unknown;

  constructor(p?: ItemInterface) {
    super();
    this.pid = MockItem.pidSource++;
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
    this.setAttribute('data-item', 'true');
    this.setAttribute('pid', this.pid.toString());
  }

  get value(): ItemInterface {
    const result = {
      name: this.name,
      pid: this.pid,
      price: this.price,
      quantity: this.quantity,
    };
    if (this.signatures) (result as any).signatures = this.signatures;
    if (this.code) (result as any).code = this.code;
    if (this.color) (result as any).color = this.color;
    if (this.open) (result as any).open = this.open;
    return { ...result };
  }

  set value(p: ItemInterface) {
    this.name = p.name!;
    this.price = +p.price!;
    this.quantity = p.quantity! > 0 || p.quantity === 0 ? +p.quantity! : 1;
    this.signatures = p.signatures;
    this.code = p.code!;
    this.parent_code = p.parent_code!;
    this.color = p.color;
  }

  get total(): number {
    return this.price * this.quantity;
  }

  public signedName(fieldName: string): string {
    if (this.pid) {
      return `${this.pid}:${fieldName}||signed`;
    } else {
      return `${fieldName}||signed`;
    }
  }

  private __fromAttr(key: string) {
    const value = this.getAttribute(key);
    if (value !== null) (this as any)[key] = value; // eslint-disable-line no-use-before-define
  }
}
