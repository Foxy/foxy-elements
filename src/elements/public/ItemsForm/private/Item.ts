import '@vaadin/vaadin-text-field/vaadin-integer-field';

import { CSSResultArray, PropertyDeclarations, TemplateResult, css, html } from 'lit-element';
import { ErrorScreen, I18N } from '../../../private/index';
import { ImageDescription, ItemInterface } from '../types';

import { Preview } from './Preview';
import { SignableFields } from './SignableFields';

/**
 * This component allows a user to configure an item.
 *
 * The item may be configured using HTML properties or a JS object.
 *
 * @csspart picture - Image of the product in preview stack (for single products) or grid (for bundles).
 * @csspart item - The root element inside of the shadow dom.
 */
export class Item extends SignableFields {
  // A list of item properties as defined in Foxy Cart Documentation

  /** @readonly */
  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          --quantity-width: 6.5rem;
          --preview-size: 5.5rem;
          --threshold: 20rem;
        }

        .min-w-description::before {
          content: '';
          width: var(--threshold);
          display: block;
          overflow: hidden;
        }

        .ml-description {
          --min-width: calc(var(--threshold) + var(--preview-size) + var(--lumo-space-l));
          --free-space: calc(100% - var(--min-width));
          --max-margin-left: calc(var(--preview-size) + var(--lumo-space-l));
          --final-margin-left: clamp(0rem, var(--free-space) * 999999999, var(--max-margin-left));
          margin-left: var(--final-margin-left);
        }

        .mr-quantity {
          --min-width: var(--threshold);
          --free-space: calc(100% - var(--min-width));
          --max-margin-right: calc(var(--quantity-width) + var(--lumo-space-l));
          --final-margin-right: clamp(0rem, var(--free-space) * 999999999, var(--max-margin-right));
          margin-right: var(--final-margin-right);
        }

        :host([data-bundled]:not(:last-of-type)) .separator::after {
          content: ' ';
          display: block;
          position: absolute;
          width: 100vw;
          border-bottom: solid thin var(--lumo-shade-10pct);
          left: 0;
          bottom: 0;
        }

        .w-quantity {
          width: var(--quantity-width);
        }

        .w-preview {
          width: var(--preview-size);
        }

        .h-preview {
          height: var(--preview-size);
        }
      `,
    ];
  }

  /** @readonly */
  public static get scopedElements(): Record<string, unknown> {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'x-error-screen': ErrorScreen,
      'x-preview': Preview,
      'x-i18n': I18N,
    };
  }

  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __modified: {},
      readonly: { type: Boolean, reflect: true },
      currency: { type: String },
      category: { type: String },
      code: { type: String, reflect: true },
      expires: { type: String },
      height: { type: Number },
      image: { type: String },
      length: { type: Number },
      name: { type: String },
      parent_code: { type: String },
      price: { type: Number },
      quantity: { type: Number, reflect: true },
      quantity_max: { type: Number },
      quantity_min: { type: String },
      shipto: { type: String },
      total: { type: Number, reflect: true, attribute: 'total' },
      url: { type: String },
      value: { type: Object },
      weight: { type: Number },
      width: { type: Number },
      __childPrices: {},
      __childrenCount: {},
      __images: {},
      alt: { type: String },
      isChildItem: { type: Boolean, reflect: true, attribute: 'data-bundled' },
      isItem: { type: Boolean, reflect: true, attribute: 'data-item' },
      open: { type: Object },
      pid: { type: Number, reflect: true },
      items: { type: Array },
    };
  }

  public readonly rel = 'product_item';

  /**
   * **Required** the name of the item.
   *
   * **Example:** `"Dog food"`
   */
  public name?: string;

  /**
   * **Required** the price of a unit of this item
   *
   * **Example:** `10`
   */
  public price?: number;

  /**
   * Makes quantity input readonly.
   */
  public readonly = false;

  /**
   * Optional an image url to be displayed in the form.
   */
  public image?: string;

  /**
   * Optional the alt text for the image
   */
  public alt?: string;

  /**
   * Optional an image url to be displayed in the foxy cart once the customer reaches the cart.
   */
  public url?: string;

  /**
   * Optional item code. This property affects cart UI only.
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `"ISBN 978-0-12-345678-9"`
   */
  public code?: string | number;

  /**
   * Optional parent code. This property affects cart UI only.
   * It causes Foxy Cart to recognize the parent-child relationship between two items.
   *
   * Nested items set this property automatically.
   *
   * **Example:** `"ISBN 978-0-12-345678-9"`
   */
  public parent_code?: string | number;

  /**
   * **Required** The quantity of this item in the cart.
   */
  public quantity = 0;

  /**
   * Optional quantity max. The maximum number of items of these to be added.
   */
  public quantity_max?: number;

  /**
   * Optional quantity min. The minimum number of items of these to be added.
   */
  public quantity_min?: number;

  /**
   * Optional category. Sets the category this item is in.
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `"heavy"`
   */
  public category?: string;

  /**
   * Optional expires. Sets the expiration time of this item.
   *
   * Advanced usage only: This property affects cart UI only.
   * This web component will not react to this property.
   *
   * The item cannot be purchased after expiration, but if it is part of a
   * subscription, it remains in the subscription as long as it stands.
   *
   * See [Products](https://wiki.foxycart.com/v/2.0/products) wiki for more details.
   *
   * **Example:** `15`
   */
  public expires?: string;

  /**
   * Optional per item weight. This property affects cart UI only.
   */
  public weight?: number;

  /**
   * Optional. Specify a ship-to address for a specific item.
   *
   * Advanced usage only: This property affects cart UI only.
   * This element does not provide any means for the user to specify this property.
   */
  public shipto?: string;

  /**
   * Optional length.  This property affects cart UI only.
   */
  public length?: number;

  /**
   * Optional width.  This property affects cart UI only.
   */
  public width?: number;

  /**
   * Optional height.  This property affects cart UI only.
   */
  public height?: number;

  /**
   * The total price of this item.
   *
   * It takes into account child items and the quantity.
   */
  public total?: number = this.__computeTotalPrice();

  /**
   * 3-letter lowercase currency code.
   * It is provided by the form if not set.
   *
   * **Example:** `"usd"`
   */
  public currency = '';

  /** A boolean indicating that this element is a item **/
  protected isItem = true;

  /** Boolean indicating that this item is a child item */
  protected isChildItem = false;

  /**
   * A unique id set to the item. Advanced usage only.
   */
  public readonly pid: number = Item.__newId();

  // A list of all existing ids to guarantee uniqueness
  private static __existingIds: number[] = [];

  private __childItemsObserver?: MutationObserver;

  private __modified = false;

  private __childPrices: number[] = [];

  private __images: ImageDescription[] = [];

  private __childrenCount = 0;

  private __itemDescription = '';

  private __handleQuantity = {
    handleEvent: (ev: Event) => {
      const newValue = Number((ev.target as HTMLInputElement).value);
      this.quantity = newValue;
      this.__modified = true;
      this.__images = ([this.getImageDescription()] as ImageDescription[]).concat(
        this.__images.slice(1, this.__images.length)
      );
    },
  };

  public constructor() {
    super('items-form');
    this.__childItemsObserver = new MutationObserver(this.__observeItems.bind(this));
    this.__childItemsObserver.observe(this, {
      childList: true,
      attributes: false,
      subtree: true,
    });
    this.updateComplete.then(() => {
      this.__setCode();
      this.__acknowledgeChildItems();
      this.__changedChildItem();
      if (!this.__isValid()) {
        console.error('Invalid item', this.value);
      }
    });
  }

  /**
   * Each child item is an object that can have any of the public properties of this element.
   * Child elements will be created accordingly.
   */
  public get items(): ItemInterface[] {
    const items: ItemInterface[] = [];
    this.__onEachChildItem([i => items.push(i.value)]);
    return items;
  }

  /**
   * Creates child elements from ItemInterface[]
   */
  public set items(value: ItemInterface[]) {
    this.__createItems(value);
  }

  public get value(): ItemInterface {
    const r: Partial<Record<keyof ItemInterface, unknown>> = {};
    for (let i = 0; i < this.attributes.length; i++) {
      r[this.attributes[i].name] = this.attributes[i].value;
    }
    r.items = this.items;
    return r as ItemInterface;
  }

  public set value(v: ItemInterface) {
    this.__itemDescription = '';
    for (const k in v) {
      let attrValue = '';
      if (k == 'description') {
        this.__itemDescription = v[k] as string;
        continue;
      }
      if (typeof v[k as keyof ItemInterface] == 'object') {
        attrValue = JSON.stringify(v[k as keyof ItemInterface]);
      } else {
        const key = k as keyof ItemInterface;
        if ((v[key] && v[key] !== 'undefined') || v[key] === 0) {
          attrValue = v[k as keyof ItemInterface]!.toString();
        }
      }
      this.setAttribute(k, v[k as keyof ItemInterface] ? attrValue : '');
    }
  }

  public updated(changedProperties: Map<string, string>): void {
    changedProperties.forEach((oldValue, prop) => {
      if (prop == '__itemDescription' || prop == 'isChildItem') {
        this.__updateDescriptionEl();
      }
    });
    this.__setTotalPrice();
    this.dispatchEvent(new Event('change'));
  }

  public render(): TemplateResult {
    if (!this.__isValid()) {
      return html`<x-error-screen type="setup_needed" class="relative"></x-error-screen>`;
    }

    const removedStyle = this.quantity ? '' : 'removed opacity-50';
    const sharedStyle = `font-lumo text-body text-s leading-m transition duration-100 ${removedStyle}`;

    if (this.isChildItem) {
      return html`
        <article
          part="item"
          class="py-s w-full relative separator item-summary flex justify-between ${sharedStyle}"
        >
          <div class="description flex-1">
            <h1 class="text-header font-medium">${this.name}</h1>
            <section class="description text-secondary">
              <slot></slot>
            </section>
          </div>

          ${this.quantity < 2
            ? ''
            : html`
                <section class="quantity font-medium text-tertiary whitespace-nowrap">
                  ${this._t('item.items', { quantity: this.quantity })}
                </section>
              `}
        </article>
      `;
    } else {
      const numericItemPrice = (this.price ?? 0) + this.__childPrices.reduce((p, c) => p + c, 0);
      const totalPrice = this.__translateAmount(numericItemPrice * this.quantity);
      const itemPrice = this.__translateAmount(numericItemPrice);

      return html`
        <article
          part="item"
          class="p-l relative item ${sharedStyle} ${this.__modified ? 'modified' : ''}"
        >
          <x-preview
            class="preview float-left w-preview h-preview mr-l mb-l"
            exportparts="picture"
            .image=${this.image}
            .quantity=${this.quantity}
            .items=${[...this.querySelectorAll('[data-bundled]')].map(child => ({
              quantity: (child as Item).quantity,
              image: (child as Item).image ?? '',
            }))}
          >
          </x-preview>

          <section class="description min-w-description ml-description">
            <h1 class="text-header font-medium text-l leading-none mr-quantity mb-s">
              ${this.name}
            </h1>

            <div class="item-description text-secondary mr-quantity mb-s">
              <slot></slot>
            </div>

            <div class="child-items mb-s">
              <slot name="items"></slot>
            </div>

            ${itemPrice ? html`<div class="font-medium price text-l">${itemPrice}</div>` : ''}
          </section>

          <section class="quantity w-quantity absolute top-0 right-0 m-l">
            <vaadin-integer-field
              class="w-full p-0"
              name="quantity"
              @change=${this.__handleQuantity}
              value="${this.quantity}"
              min="0"
              has-controls
              ?readonly=${this.readonly}
            >
            </vaadin-integer-field>

            ${this.quantity > 1
              ? html`
                  <x-i18n
                    .ns=${this.ns}
                    .lang=${this.lang}
                    .opts=${{ amount: totalPrice }}
                    class="price-total text-secondary text-xs text-center block mt-xs"
                    key="price.total"
                  >
                  </x-i18n>
                `
              : ''}
          </section>
        </article>
      `;
    }
  }

  public getImageDescription(): ImageDescription {
    return {
      alt: this.alt,
      quantity: this.quantity,
      src: this.image,
    };
  }

  /**
   * Items have their signed names prefixed with their id.
   *
   * @param fieldName the name of the field to get the signed version.
   * @returns signed version of the name, prefixed with the item id.
   */
  public signedName(fieldName: string): string {
    const signed = super.signedName(fieldName);
    return `${this.pid.toString()}:${signed}`;
  }

  /**
   * Creates a new unique id to be used in the form
   *
   * Ids are used to distinguish different items in a single form.
   * Ids are prepended to fields names to allow Foxy Cart to know to what
   * item a particular field relates.
   *
   * @returns number the newly created id
   */
  private static __newId(): number {
    // Get the maximum value
    const newId = Item.__existingIds.reduce((accum, curr) => (curr > accum ? curr : accum), 0) + 1;
    Item.__existingIds.push(newId);
    return newId;
  }

  private __updateDescriptionEl() {
    if (this.__itemDescription) {
      let descEl: HTMLElement | null = this.shadowRoot!.querySelector('data-item-description');
      if (!descEl) {
        descEl = document.createElement('p') as HTMLElement;
        descEl.dataset.itemDescription = 'true';
        this.__addSlottedEl(descEl);
      }
      descEl.innerText = this.__itemDescription;
    } else {
      const descEl: HTMLElement | null = this.shadowRoot!.querySelector('data-item-description');
      if (descEl) descEl.remove();
    }
  }

  /**
   * Add an element to the default slot
   *
   * @param el
   */
  private __addSlottedEl(el: HTMLElement) {
    const slot = this.shadowRoot!.querySelector('article');
    if (slot) {
      slot!.appendChild(el);
    }
  }

  /**
   * Creates a code if none is provided by the user
   */
  private __setCode(): void {
    if (!this.code) {
      this.code = `RAND${Math.random()}`;
    }
  }

  /**
   * Create child items from items field.
   *
   * @param valuesArray
   */
  private __createItems(valuesArray: ItemInterface[]): void {
    valuesArray.forEach(p => {
      // Use a reference to the constructor of the instance in order to avoid issues in tests
      const item = document.createElement(this.tagName) as Item;
      item.value = p;
      item.currency = this.currency;
      item.__computeTotalPrice();
      this.__acknowledgeItem(item);
      this.appendChild(item);
    });
  }

  private __setTotalPrice(): void {
    this.total = this.__computeTotalPrice();
  }

  /**
   * The price of the total qty of each of the child items
   */
  private __computeTotalPrice(): number {
    if (!this.__childPrices) {
      if (!this.price) return 0;
      return this.price * this.quantity;
    }
    let myPrice = 0;
    this.__childPrices.forEach(p => {
      myPrice += p;
    });
    myPrice += this.price!;
    myPrice *= this.quantity;
    return myPrice;
  }

  /**
   * Constraints Items must eventually adhere to.
   **/
  private __isValid(): boolean {
    const error = [];
    if (!this.name || !this.name.length) {
      error.push('The name attribute of an item is required.');
    }
    if (!this.price && this.price !== 0) {
      error.push('The price attribute of an item is required.');
    }
    if (this.price && this.price! < 0) {
      error.push('Item added with negative price.');
    }
    if (this.quantity_min && this.quantity && this.quantity < this.quantity_min) {
      error.push('Quantity amount is less than minimum quantity.');
    }
    if (this.quantity_max && this.quantity && this.quantity > this.quantity_max) {
      error.push('Quantity amount is more than maximum quantity.');
    }
    console.error(...error);
    return !error.length;
  }

  private __translateAmount(amount: number) {
    if (!this.currency) {
      return '';
    }
    return amount.toLocaleString(this.lang, {
      minimumFractionDigits: 2,
      currency: this.currency,
      style: 'currency',
    });
  }

  private __observeItems(mutationList: MutationRecord[]): void {
    mutationList.forEach(m => {
      if (m.type == 'childList') {
        m.addedNodes.forEach(n => {
          if (n.nodeType === Node.DOCUMENT_NODE) {
            this.__acknowledgeItem(n as Item);
          }
        });
      }
    });
    this.__setTotalPrice();
  }

  private __acknowledgeChildItems() {
    this.shadowRoot
      ?.querySelectorAll('[data-item]')
      .forEach(e => this.__acknowledgeItem(e as Item));
    this.querySelectorAll('[data-item]').forEach(e => this.__acknowledgeItem(e as Item));
  }

  private __acknowledgeItem(e: Item): void {
    e.addEventListener('change', this.__changedChildItem.bind(this));
    e.currency = this.currency;
    e.isItem = false;
    e.isChildItem = true;
    if (this.code) {
      e.parent_code = this.code;
    }
  }

  /** React to changes in child items */
  private __changedChildItem() {
    // Reset child attributes lists
    const newItemPrices: number[] = [];
    const newItemImages: ImageDescription[] = [];
    let newChildrenCount = 0;

    // Create collection functions
    const collectPrices = (p: Item) => {
      if (p.total !== undefined) {
        newItemPrices.push(p.total);
      }
    };
    const collectImages = (p: Item) => {
      newItemImages.push(p.getImageDescription());
    };
    const countChildren = () => (newChildrenCount += 1);
    // Collect information of every child
    this.__onEachChildItem([collectPrices, collectImages, countChildren]);

    if (this.image && newItemImages.length === 0) {
      newItemImages.push(this.getImageDescription());
    }

    // Update atributes regarding child items
    this.__childPrices = newItemPrices;
    this.__images = newItemImages;
    this.__childrenCount = newChildrenCount;
    this.__setTotalPrice();
  }

  /**
   * Execute a list of actions against all child items
   *
   * @param actions
   */
  private __onEachChildItem(actions: ((c: Item) => void)[]) {
    const myChildItems = this.querySelectorAll('[data-bundled]');
    for (const c of myChildItems) {
      for (const actOn of actions) {
        actOn(c as Item);
      }
    }
  }
}
