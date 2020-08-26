import { Translatable } from '../../../../mixins/translatable';
import { html, property, TemplateResult } from 'lit-element';
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
  @property({ type: Number })
  public price?: number;

  @property({ type: Array })
  public prices: number[] = [];

  @property({ type: String, reflect: true })
  public currency?: string;

  @property({ type: Number })
  public quantity?: number;

  private get __totalParts(): number {
    return this.prices.reduce((a, b) => a + b);
  }

  /** The resulting total price */
  public get total(): number {
    if (this.price && this.quantity) {
      return this.quantity * (this.price + this.__totalParts);
    } else {
      return 0;
    }
  }

  public constructor() {
    super('quick-order');
  }

  public updated(changed: unknown): void {
    this.dispatchEvent(new CustomEvent('change', { detail: this.total }));
  }

  public render(): TemplateResult {
    if (this.quantity === undefined || this.price === undefined) {
      return html``;
    }
    return html`
      <div class="price text-right text-primary p-s">
        <span
          class="price each ${this.quantity == 0 ? 'text-shade-50' : ''} ${this.quantity == 1
            ? 'font-bold'
            : ''} "
        >
          ${this.prices.length > 0
            ? html` ${this.price
                ? html`(${this.__translateAmount(this.price)} +
                  ${this.__translateAmount(this.__totalParts)})`
                : this.__translateAmount(this.__totalParts)}`
            : this.__translateAmount(this.price)}
        </span>
        ${this.price != this.total && this.total
          ? html`
              <span class="quantity times text-shade-50 m-xs text-xs">
                &times;${this.quantity}
              </span>
              <span class="price total ${this.quantity > 1 ? 'font-bold' : ''}">
                ${this.__translateAmount(this.total)}
              </span>
            `
          : ''}
      </div>
    `;
  }

  private __translateAmount(amount: number) {
    if (this.currency) {
      return amount.toLocaleString(this.lang, {
        minimumFractionDigits: 0,
        currency: this.currency!,
        style: 'currency',
      });
    } else {
      return 'No currency available';
    }
  }
}
