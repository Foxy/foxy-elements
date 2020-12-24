import { ItemInterface } from '../elements/public/ItemsForm/types';

export const item = {
  _links: {
    curies: [
      {
        name: 'fx',
        href: 'https://api.foxy.test/rels/{rel}',
        templated: true,
      },
    ],
    self: {
      href: 'https://api.foxy.test/items/5616394',
      title: 'This Item',
    },
    'fx:store': {
      href: 'https://api.foxy.test/stores/66',
      title: 'This Store',
    },
    'fx:transaction': {
      href: 'https://api.foxy.test/transactions/3844264',
      title: 'This Transaction',
    },
    'fx:item_category': {
      href: 'https://api.foxy.test/item_categories/60',
      title: 'This Item Category',
    },
    'fx:item_options': {
      href: 'https://api.foxy.test/items/5616394/item_options',
      title: 'Item Options for This Item',
    },
    'fx:shipment': {
      href: 'https://api.foxy.test/shipments/3978',
      title: 'Shipment for this Item',
    },
    'fx:attributes': {
      href: 'https://api.foxy.test/items/5616394/attributes',
      title: 'Attributes for This Item',
    },
    'fx:discount_details': {
      href: 'https://api.foxy.test/items/5616394/discount_details',
      title: 'The Discounts for this Item',
    },
    'fx:coupon_details': {
      href: 'https://api.foxy.test/items/5616394/coupon_details',
      title: 'The Coupons for this Item',
    },
  },
  item_category_uri: 'https://api.foxy.test/item_categories/60',
  name: 'Basic Product',
  price: 10,
  quantity: 1,
  quantity_min: 0,
  quantity_max: 0,
  weight: 5,
  code: '',
  parent_code: '',
  discount_name: '',
  discount_type: '',
  discount_details: '',
  subscription_frequency: '',
  subscription_start_date: null,
  subscription_next_transaction_date: null,
  subscription_end_date: null,
  is_future_line_item: false,
  shipto: 'Me',
  url: '',
  image: 'https://picsum.photos/320',
  length: 0,
  width: 0,
  height: 0,
  expires: 0,
  date_created: null,
  date_modified: '2015-04-15T08:45:49-0700',
};

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
    return result;
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

  private __fromAttr(key: string) {
    const value = this.getAttribute(key);
    if (value !== null) (this as any)[key] = value; // eslint-disable-line no-use-before-define
  }
}
