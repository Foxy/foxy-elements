import { Translatable } from '../../../../mixins/translatable';
import { html, TemplateResult, PropertyDeclarations } from 'lit-element';
import { I18N } from '../../../private/index';

/**
 * Displays a price
 *
 * The price is sum of the price of all parts and the unit price times the
 * quantity.
 */
export class Price extends Translatable {
  /**
   * Custom elements used in the component
   */
  public static get scopedElements(): Record<string, unknown> {
    return {
      'x-i18n': I18N,
    };
  }

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

  public prices: number[] | null = null;

  public currency: string | null = null;

  public quantity: number | null = null;

  private get __totalParts(): number {
    if (this.prices) {
      return this.prices.reduce((a, b) => a + b, 0);
    } else {
      return 0;
    }
  }

  public get total(): number {
    if (this.quantity) {
      return this.quantity * ((this.price ? this.price : 0) + this.__totalParts);
    } else {
      return 0;
    }
  }

  public constructor() {
    super('quick-order');
  }

  public render(): TemplateResult {
    if (
      this.quantity === null ||
      this.price === null ||
      this.prices === null ||
      this.currency === null
    ) {
      return html``;
    }
    return html`
      <div class="price max-w-xxs ${this.quantity == 0 ? 'text-disabled' : 'text-header '}">
        <span class="price total font-bold">
          ${this.__translateAmount(this.total)}
        </span>
      </div>
    `;
  }

  private __translateAmount(amount: number) {
    if (this.currency) {
      return amount.toLocaleString(this.lang, {
        minimumFractionDigits: 2,
        currency: this.currency!,
        style: 'currency',
      });
    } else {
      return 'No currency available';
    }
  }
}
