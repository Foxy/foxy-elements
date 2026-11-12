import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { ProductGroup } from './listing';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ifDefined } from 'lit-html/directives/if-defined';
import { css } from 'lit-element';
import { html } from 'lit-html';
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  STOCK_COLORS,
  formatPriceRange,
  groupProducts,
  loadAllProducts,
  matchesQuery,
  priceRange,
  productName,
  stockSummary,
} from './listing';

const NS = 'product-list';
const Base = TranslatableMixin(ConfigurableMixin(ThemeableMixin(NucleonElement)), NS);

/**
 * Every product of a store as a table of name, SKU, type, price and stock,
 * searched by name or SKU. Variants aren't rows of their own: a product's
 * row carries their count, price range and stock.
 *
 * @element foxy-product-list
 * @since 1.60.0
 */
export class ProductList extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      lowStockThreshold: { type: Number, attribute: 'low-stock-threshold' },
      getProductPageHref: { attribute: false },
      currencyCode: { attribute: 'currency-code' },
      query: {},
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        .row {
          display: grid;
          grid-template-columns: minmax(0, 2.4fr) minmax(0, 1.4fr) 9.5rem 9rem 11rem;
          gap: 0.75rem;
          align-items: center;
          padding: 0.625rem 1rem;
        }

        .row + .row {
          border-top: 1px solid var(--lumo-contrast-10pct);
        }

        a.row {
          color: inherit;
          text-decoration: none;
        }

        a.row:hover {
          background: var(--lumo-contrast-5pct);
        }

        a.row:focus-visible {
          outline: 2px solid var(--lumo-primary-color-50pct);
          outline-offset: -2px;
        }

        .head {
          background: var(--lumo-contrast-5pct);
          font-size: var(--lumo-font-size-s);
          font-weight: 600;
          color: var(--lumo-secondary-text-color);
        }

        .sku {
          font-family: ui-monospace, Menlo, monospace;
          font-size: var(--lumo-font-size-s);
          overflow-wrap: anywhere;
        }

        .dot {
          width: 0.5625rem;
          height: 0.5625rem;
          border-radius: 50%;
          flex-shrink: 0;
          display: inline-block;
        }

        input[type='search'] {
          max-width: 22.5rem;
          width: 100%;
          height: 2.25rem;
          padding: 0 0.625rem;
          border: 1px solid var(--lumo-contrast-30pct);
          border-radius: var(--lumo-border-radius-s);
          background: var(--lumo-base-color);
          color: inherit;
          font: inherit;
        }

        @media (max-width: 47.99rem) {
          .row {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }

          .head {
            display: none;
          }
        }
      `,
    ];
  }

  /** ISO 4217 code of the store's currency. Without it, prices are plain numbers. */
  currencyCode: string | null = null;

  /** Stock at or below this is low. 0 means nothing is. */
  lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD;

  /** Returns the URL of a product's page for its `self` link. Rows aren't links without it. */
  getProductPageHref: ((href: string) => string) | null = null;

  /** Text the name or SKU must contain. */
  query = '';

  /** The products shown as rows, each with its variants, in display order. */
  get groups(): ProductGroup[] {
    return groupProducts(this.data?._embedded['fx:products'] ?? []);
  }

  render(): TemplateResult {
    const all = this.groups;
    const shown = all.filter(group => matchesQuery(group, this.query));
    const variants = all.reduce((sum, group) => sum + group.variants.length, 0);

    return html`
      <div class="grid gap-m text-body font-lumo leading-s" aria-busy=${this.in('busy')}>
        <input
          type="search"
          data-testid="search"
          aria-label=${this.t('search_label')}
          placeholder=${this.t('search_placeholder')}
          .value=${this.query}
          @input=${(evt: Event) => (this.query = (evt.currentTarget as HTMLInputElement).value)}
        />

        <div class="border border-contrast-10 rounded-l overflow-hidden" role="table">
          <div class="row head" role="row">
            <span role="columnheader">${this.t('column_name')}</span>
            <span role="columnheader">${this.t('column_sku')}</span>
            <span role="columnheader">${this.t('column_type')}</span>
            <span role="columnheader">${this.t('column_price')}</span>
            <span role="columnheader">${this.t('column_stock')}</span>
          </div>
          ${shown.map(group => this.__renderRow(group))} ${this.__renderStatus(all, shown)}
        </div>

        ${this.data
          ? html`
              <p class="text-s text-secondary" data-testid="summary">
                ${this.t('summary', { count: all.length })}
                ${variants ? this.t('summary_variants', { count: variants }) : ''}
              </p>
            `
          : ''}
      </div>
    `;
  }

  protected async _sendGet(): Promise<Data> {
    const products = await loadAllProducts(this.href, url => this._fetch(url));
    return {
      _links: { self: { href: this.href } },
      _embedded: { 'fx:products': products },
      total_items: products.length,
      returned_items: products.length,
      offset: 0,
      limit: products.length,
    } as unknown as Data;
  }

  private __renderStatus(all: ProductGroup[], shown: ProductGroup[]) {
    let key = '';
    if (this.in('fail')) key = this.accessDenied ? 'access_denied' : 'error';
    else if (!this.data) key = 'loading';
    else if (!all.length) key = 'empty';
    else if (!shown.length) key = 'no_matches';
    if (!key) return '';

    return html`
      <p
        class="p-l text-center text-s ${key === 'error' ? 'text-error' : 'text-secondary'}"
        data-testid="status"
        role=${key === 'error' ? 'alert' : 'status'}
      >
        ${this.t(key)}
      </p>
    `;
  }

  private __renderRow(group: ProductGroup) {
    const { product, variants } = group;
    const name = productName(product);
    const stock = stockSummary(group, this.lowStockThreshold);
    const href = this.getProductPageHref?.(product._links.self.href);
    const price = formatPriceRange(priceRange(group), this.currencyCode, this.lang);

    const type = variants.length
      ? `${this.t('type_parent')} · ${this.t('variant_count', { count: variants.length })}`
      : this.t(`type_${product.product_type}`);

    return html`
      <a class="row" role="row" data-testid="row" data-sku=${product.sku} href=${ifDefined(href)}>
        <span role="cell" class="min-w-0">
          <span
            class="font-medium ${name ? '' : 'text-tertiary'}"
            style="overflow-wrap: anywhere"
            data-testid="name"
          >
            ${name || this.t('unnamed')}
          </span>
          ${product.hidden
            ? html`<span
                class="text-xs font-medium text-secondary bg-contrast-5 rounded-s"
                style="margin-left: 0.375rem; padding: 0.125rem 0.375rem"
                data-testid="hidden"
              >
                ${this.t('hidden')}
              </span>`
            : ''}
        </span>
        <span role="cell" class="sku" data-testid="sku">${product.sku}</span>
        <span role="cell" class="text-s text-secondary" data-testid="type">${type}</span>
        <span role="cell" data-testid="price">${price || '—'}</span>
        <span
          role="cell"
          class="text-s inline-flex items-center"
          style="gap: 0.4375rem"
          data-testid="stock"
          data-state=${stock.state}
        >
          <span class="dot" style="background: ${STOCK_COLORS[stock.state]}"></span>
          ${this.__stockText(stock, variants.length > 0)}
        </span>
      </a>
    `;
  }

  private __stockText(stock: ReturnType<typeof stockSummary>, hasVariants: boolean): string {
    if (stock.state === 'untracked') return this.t('stock_untracked');
    if (stock.state === 'out_of_stock') return this.t('stock_out_of_stock');
    if (!hasVariants && stock.holders === 1) {
      return this.t(stock.state === 'low_stock' ? 'stock_low' : 'stock_in', { count: stock.units });
    }

    const parts = [this.t('stock_in', { count: stock.units })];
    if (stock.out) parts.push(this.t('stock_out_count', { count: stock.out }));
    if (stock.low) parts.push(this.t('stock_low_count', { count: stock.low }));
    return parts.join(' · ');
  }
}
