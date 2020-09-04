import { Translatable } from '../../../../mixins/translatable';
import { html, TemplateResult, internalProperty, property } from 'lit-element';
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

  /** The price of a single unity */
  @property({ attribute: false })
  public price: number | null = null;

  @property({ attribute: false })
  public prices: number[] | null = null;

  @property({ attribute: false })
  public currency: string | null = null;

  @property({ attribute: false })
  public quantity: number | null = null;

  private get __totalParts(): number {
    if (this.prices) {
      return this.prices.reduce((a, b) => a + b, 0);
    } else {
      return 0;
    }
  }

  @internalProperty()
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
      <div class="price max-w-xxs p-s ${this.quantity == 0 ? 'text-disabled' : 'text-header '}">
        ${this.__pricesLen() > 0
          ? html` <span class="price parts">
              ${this.__pricesLen() > 3
                ? this.__translateAmount(this.__totalParts)
                : this.prices.map(this.__translateAmount.bind(this)).join(' + ')}
              ${this.price !== 0 ? ' + ' : ''}
            </span>`
          : ''}
        ${this.price && (this.__pricesLen() > 0 || this.quantity > 1)
          ? html` <span class="price each">
              ${this.__translateAmount(this.price)}
            </span>`
          : ''}
        ${this.quantity > 1
          ? html`
              <span class="quantity times text-disabled m-xs text-xs">
                &times;${this.quantity}
              </span>
            `
          : ''}
        <span class="price total font-bold">
          ${this.__translateAmount(this.total)}
        </span>
      </div>
    `;
  }

  private __pricesLen(): number {
    if (this.prices) {
      return this.prices.length;
    } else {
      return 0;
    }
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
