import { Translatable } from '../../../../mixins/translatable';
import { html, TemplateResult, PropertyDeclarations } from 'lit-element';

/**
 * Displays a price
 *
 * The price is sum of the price of all parts and the unit price times the
 * quantity.
 */
export class Price extends Translatable {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      price: { attribute: false },
      prices: { attribute: false },
      currency: { attribute: false },
      quantity: { attribute: false },
      total: {},
    };
  }

  /** The price of a single unity */
  public price: number | null = null;

  /** Other prices that should be considered as part of this price */
  public prices: number[] | null = null;

  public currency: string | null = null;

  public quantity: number | null = null;

  public constructor() {
    super('quick-order');
  }

  public render(): TemplateResult {
    if (this.quantity === null || (!this.price && !this.prices) || this.currency === null) {
      return html``;
    }
    return html`
      <div class="price max-w-xxs ${this.quantity == 0 ? 'text-disabled' : 'text-header '}">
        <span class="price total font-medium"> ${this.__translateAmount(this.total)} </span>
      </div>
    `;
  }

  public get total(): number {
    if (this.quantity) {
      return this.quantity * ((this.price ? this.price : 0) + this.__totalParts);
    } else {
      return 0;
    }
  }

  private get __totalParts(): number {
    if (this.prices) {
      return this.prices.reduce((a, b) => a + b, 0);
    } else {
      return 0;
    }
  }

  private __translateAmount(amount: number) {
    return amount.toLocaleString(this.lang, {
      minimumFractionDigits: 2,
      currency: this.currency!,
      style: 'currency',
    });
  }
}
