import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const NS = 'product-card';
const Base = ConfigurableMixin(TranslatableMixin(InternalCard, NS));

type StockState = 'in_stock' | 'low_stock' | 'out_of_stock' | 'untracked';

/**
 * Card element displaying a Foxy Product as a catalog list row.
 *
 * Shows thumbnail, name, SKU, product type badge, price, stock indicator,
 * and (for parents) a variant count badge.
 *
 * @element foxy-product-card
 * @since 1.54.0
 */
export class ProductCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      currencyDisplay: { type: String, attribute: 'currency-display' },
      currencyCode: { type: String, attribute: 'currency-code' },
      lowStockThreshold: { type: Number, attribute: 'low-stock-threshold' },
    };
  }

  /** `'symbol'` (default) or `'code'`. Forwarded to `Intl.NumberFormat`. */
  currencyDisplay: 'symbol' | 'code' | 'name' = 'symbol';

  /** ISO 4217 currency code for the price. When unset, the price is shown without a currency. */
  currencyCode: string | null = null;

  /** stock_level <= this counts as "low stock" (amber). Default 5. */
  lowStockThreshold = 5;

  // 1x1 transparent placeholder so broken/missing image URLs don't trigger
  // alt-text rendering or layout shifts. Inlined to avoid an extra request.
  private static readonly __placeholder =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23E8E8E8"/%3E%3C/svg%3E';

  renderBody(): TemplateResult {
    const data = this.data;
    if (!data) return html``;

    const def = data.definition ?? {};
    const name = def.name || data.sku;
    const thumbnailSrc = def.images?.[0]?.src;
    const stockState = this.__stockState;

    return html`
      <div class="flex items-start" style="gap: 0.75rem">
        <img
          class="relative h-s w-s object-cover rounded-s bg-contrast-20 flex-shrink-0 shadow-xs"
          src=${ifDefined(thumbnailSrc)}
          alt=""
          data-testid="thumbnail"
          @error=${(evt: Event) => {
            const img = evt.currentTarget as HTMLImageElement;
            img.src = ProductCard.__placeholder;
          }}
        />

        <div class="flex-1 min-w-0">
          <div class="flex items-center" style="gap: 0.5rem">
            <div class="flex-1 min-w-0 truncate text-m font-medium" data-testid="name">${name}</div>
            ${def.price !== undefined ? this.__renderPrice(def.price) : ''}
          </div>

          <div
            class="flex items-center text-s text-secondary leading-s"
            style="gap: 0.5rem; margin-top: 0.125rem"
          >
            <span class="truncate" data-testid="sku">${data.sku}</span>
            <span class="text-tertiary">&bull;</span>
            ${this.__renderTypeBadge(data.product_type)}
            <span class="text-tertiary">&bull;</span>
            ${this.__renderStockIndicator(stockState)}
            ${data.product_type === 'parent' && data.variant_count > 0
              ? html`
                  <span class="text-tertiary">&bull;</span>
                  <span data-testid="variant-count">
                    <foxy-i18n
                      infer=""
                      key="variant_count"
                      .options=${{ count: data.variant_count }}
                    >
                    </foxy-i18n>
                  </span>
                `
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  private __renderPrice(price: number): TemplateResult {
    const amount = this.currencyCode ? `${price} ${this.currencyCode}` : `${price}`;
    return html`
      <span class="text-m text-tertiary whitespace-nowrap" data-testid="price">
        <foxy-i18n
          infer=""
          key="price"
          .options=${{ amount, currencyDisplay: this.currencyDisplay }}
        >
        </foxy-i18n>
      </span>
    `;
  }

  private __renderTypeBadge(productType: Data['product_type']): TemplateResult {
    return html`
      <span data-testid="type-badge" data-type=${productType}>
        <foxy-i18n infer="" key="type_${productType}"></foxy-i18n>
      </span>
    `;
  }

  private __renderStockIndicator(state: StockState): TemplateResult {
    return html`
      <span
        class="inline-flex items-center"
        style="gap: 0.25rem"
        data-testid="stock-indicator"
        data-state=${state}
      >
        <span
          class=${classMap({
            'inline-block rounded-full': true,
            'bg-success': state === 'in_stock',
            'bg-warning': state === 'low_stock',
            'bg-error': state === 'out_of_stock',
            'bg-contrast-30': state === 'untracked',
          })}
          style="width: 0.5rem; height: 0.5rem"
        ></span>
        <foxy-i18n infer="" key="stock_${state}"></foxy-i18n>
      </span>
    `;
  }

  private get __stockState(): StockState {
    const stockLevel = this.data?.stock_level;
    if (stockLevel === null || stockLevel === undefined) return 'untracked';
    if (stockLevel === 0) return 'out_of_stock';
    if (stockLevel <= this.lowStockThreshold) return 'low_stock';
    return 'in_stock';
  }
}
