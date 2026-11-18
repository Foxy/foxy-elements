import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { ListedCollection, ProductGroup, SortColumn, TypeFilter } from './listing';
import type { Data as Collection } from '../ProductCollectionForm/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { loadingLogoStyles, renderLoadingLogo } from '../../private/LoadingScreen/LoadingScreen';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { getResourceId } from '@foxy.io/sdk/core';
import { ifDefined } from 'lit-html/directives/if-defined';
import { FACTS } from './facts';
import { css } from 'lit-element';
import { html } from 'lit-html';
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  STOCK_COLORS,
  collectionTree,
  formatPriceRange,
  groupProducts,
  groupType,
  loadAll,
  loadAllProducts,
  matchesCollection,
  matchesQuery,
  productId,
  priceRange,
  productName,
  sortGroups,
  stockSummary,
} from './listing';

const NS = 'product-list';
const Base = TranslatableMixin(ConfigurableMixin(ThemeableMixin(NucleonElement)), NS);

type ExtraColumn = 'collection' | 'template';

const EXTRA_COLUMNS: ExtraColumn[] = ['collection', 'template'];
const COLUMNS_KEY = 'foxy-product-list:columns';
const FACT_CHANCE = 0.01;

// Storage can be missing or refuse access; the columns then last until the page is left.
function storedColumns(): ExtraColumn[] {
  try {
    const stored = JSON.parse(localStorage.getItem(COLUMNS_KEY) ?? '[]') as unknown;
    return EXTRA_COLUMNS.filter(column => Array.isArray(stored) && stored.includes(column));
  } catch {
    return [];
  }
}

/**
 * Every product of a store as a table of name, SKU, type, price and stock,
 * searched by name or SKU and narrowed by type, collection or template.
 * Variants aren't rows of their own: a product's row carries their count,
 * price range and stock.
 *
 * @element foxy-product-list
 * @since 1.60.0
 */
export class ProductList extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      lowStockThreshold: { type: Number, attribute: 'low-stock-threshold' },
      productCollections: { attribute: 'product-collections' },
      collectionFilter: { attribute: 'collection-filter' },
      templateFilter: { attribute: 'template-filter' },
      extraColumns: { attribute: false },
      random: { attribute: false },
      __collections: { attribute: false },
      __fact: { attribute: false },
      getProductPageHref: { attribute: false },
      currencyCode: { attribute: 'currency-code' },
      query: {},
      typeFilter: { attribute: 'type-filter' },
      sortColumn: { attribute: 'sort-column' },
      sortDescending: { type: Boolean, attribute: 'sort-descending' },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      loadingLogoStyles,
      css`
        .row {
          display: grid;
          grid-template-columns: var(--columns);
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

        .head button {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font: inherit;
          color: inherit;
          cursor: pointer;
          border-radius: var(--lumo-border-radius-s);
        }

        .head button:hover,
        .head [aria-sort]:not([aria-sort='none']) button {
          color: var(--lumo-body-text-color);
        }

        .head button:focus-visible {
          outline: 2px solid var(--lumo-primary-color-50pct);
          outline-offset: 2px;
        }

        input[type='search'] {
          flex: 1 1 12rem;
          max-width: 22.5rem;
        }

        input[type='search'],
        select,
        summary {
          width: 100%;
          height: 2.25rem;
          padding: 0 0.625rem;
          border: 1px solid var(--lumo-contrast-30pct);
          border-radius: var(--lumo-border-radius-s);
          background: var(--lumo-base-color);
          color: inherit;
          font: inherit;
        }

        select {
          width: auto;
          max-width: 100%;
        }

        details {
          position: relative;
          margin-left: auto;
        }

        summary {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          cursor: pointer;
        }

        summary::after {
          content: '▾';
          margin-left: 0.375rem;
          color: var(--lumo-secondary-text-color);
        }

        .panel {
          position: absolute;
          right: 0;
          top: 2.5rem;
          z-index: 1;
          display: grid;
          gap: 0.5rem;
          padding: 0.75rem;
          border: 1px solid var(--lumo-contrast-10pct);
          border-radius: var(--lumo-border-radius-m);
          background: var(--lumo-base-color);
          box-shadow: 0 8px 24px rgba(26, 39, 55, 0.14);
          white-space: nowrap;
        }

        .panel label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        summary:focus-visible,
        .link:focus-visible {
          outline: 2px solid var(--lumo-primary-color-50pct);
          outline-offset: 2px;
        }

        .link {
          font: inherit;
          color: var(--lumo-primary-text-color);
          cursor: pointer;
          text-decoration: underline;
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

  /** Which kind of product the rows are limited to. */
  typeFilter: TypeFilter = 'all';

  /** Link to the store's `fx:product_collections`. Without it there's no collection filter or column. */
  productCollections: string | null = null;

  /** The id of the collection the rows are limited to, its sub-collections included, or `none`. */
  collectionFilter = '';

  /** The id of the template whose products the rows are limited to. */
  templateFilter = '';

  /** The optional columns shown, which the browser remembers. */
  extraColumns: ExtraColumn[] = storedColumns();

  /** Returns a number from 0 up to 1, which decides whether a load shows a fact and which one. */
  random: () => number = Math.random;

  /** The column the rows are ordered by. */
  sortColumn: SortColumn = 'name';

  sortDescending = false;

  private __collections: ListedCollection[] = [];

  private __fact: (typeof FACTS)[number] | null = null;

  /** The products shown as rows, each with its variants, in display order. */
  get groups(): ProductGroup[] {
    return groupProducts(this.data?._embedded['fx:products'] ?? []);
  }

  render(): TemplateResult {
    const all = this.groups;
    const collections = collectionTree(this.__collections);
    const templates = all.filter(group => group.product.product_type === 'template');
    const matching = all.filter(
      group =>
        matchesQuery(group, this.query) &&
        (this.typeFilter === 'all' || groupType(group) === this.typeFilter) &&
        matchesCollection(group, this.collectionFilter, this.__collections) &&
        (!this.templateFilter || String(group.product.inherit_from_id) === this.templateFilter)
    );
    const shown = sortGroups(matching, this.sortColumn, this.sortDescending);
    const sortable: SortColumn[] = ['name', 'sku', 'type', 'price', 'stock'];
    const extra = this.__offeredColumns.filter(column => this.extraColumns.includes(column));
    const widths = [
      'minmax(0, 2.4fr) minmax(0, 1.4fr) 9.5rem',
      ...extra.map(() => 'minmax(0, 1.3fr)'),
      '9rem 11rem',
    ];
    const heading = (column: SortColumn) => {
      const sorted = column === this.sortColumn;
      return html`
        <span
          role="columnheader"
          aria-sort=${sorted ? (this.sortDescending ? 'descending' : 'ascending') : 'none'}
        >
          <button
            type="button"
            data-testid="sort-${column}"
            @click=${() => {
              this.sortDescending = sorted && !this.sortDescending;
              this.sortColumn = column;
            }}
          >
            ${this.t(`column_${column}`)}
            <span aria-hidden="true">${sorted ? (this.sortDescending ? '↓' : '↑') : ''}</span>
          </button>
        </span>
      `;
    };

    return html`
      <div class="grid gap-m text-body font-lumo leading-s" aria-busy=${this.in('busy')}>
        <div class="flex flex-wrap" style="gap: 0.5rem">
          <input
            type="search"
            data-testid="search"
            aria-label=${this.t('search_label')}
            placeholder=${this.t('search_placeholder')}
            .value=${this.query}
            @input=${(evt: Event) => (this.query = (evt.currentTarget as HTMLInputElement).value)}
          />
          <select
            data-testid="type-filter"
            aria-label=${this.t('type_filter_label')}
            .value=${this.typeFilter}
            @change=${(evt: Event) => {
              this.typeFilter = (evt.currentTarget as HTMLSelectElement).value as TypeFilter;
            }}
          >
            ${(['all', 'standalone', 'parent', 'template'] as const).map(
              type => html`
                <option value=${type} ?selected=${type === this.typeFilter}>
                  ${this.t(`type_filter_${type}`)}
                </option>
              `
            )}
          </select>
          ${collections.length
            ? html`
                <select
                  data-testid="collection-filter"
                  aria-label=${this.t('collection_filter_label')}
                  @change=${(evt: Event) => {
                    this.collectionFilter = (evt.currentTarget as HTMLSelectElement).value;
                  }}
                >
                  <option value="" ?selected=${!this.collectionFilter}>
                    ${this.t('collection_filter_all')}
                  </option>
                  ${collections.map(
                    collection => html`
                      <option
                        value=${collection.id}
                        ?selected=${String(collection.id) === this.collectionFilter}
                      >
                        ${'\u00A0\u00A0\u00A0'.repeat(collection.depth)}${collection.name}
                      </option>
                    `
                  )}
                  <option value="none" ?selected=${this.collectionFilter === 'none'}>
                    ${this.t('collection_filter_none')}
                  </option>
                </select>
              `
            : ''}
          ${templates.length
            ? html`
                <select
                  data-testid="template-filter"
                  aria-label=${this.t('template_filter_label')}
                  @change=${(evt: Event) => {
                    this.templateFilter = (evt.currentTarget as HTMLSelectElement).value;
                  }}
                >
                  <option value="" ?selected=${!this.templateFilter}>
                    ${this.t('template_filter_all')}
                  </option>
                  ${templates.map(({ product }) => {
                    const id = String(productId(product));
                    return html`
                      <option value=${id} ?selected=${id === this.templateFilter}>
                        ${productName(product) || product.sku}
                      </option>
                    `;
                  })}
                </select>
              `
            : ''}
          ${this.__offeredColumns.length
            ? html`
                <details
                  data-testid="columns"
                  @focusout=${(evt: FocusEvent) => {
                    const details = evt.currentTarget as HTMLDetailsElement;
                    if (!details.contains(evt.relatedTarget as Node | null)) details.open = false;
                  }}
                >
                  <summary>${this.t('columns')}</summary>
                  <div class="panel">
                    ${this.__offeredColumns.map(
                      column => html`
                        <label>
                          <input
                            type="checkbox"
                            data-testid="column-${column}"
                            .checked=${this.extraColumns.includes(column)}
                            @change=${(evt: Event) =>
                              this.__toggleColumn(
                                column,
                                (evt.currentTarget as HTMLInputElement).checked
                              )}
                          />
                          ${this.t(`column_${column}`)}
                        </label>
                      `
                    )}
                  </div>
                </details>
              `
            : ''}
        </div>

        <div
          class="border border-contrast-10 rounded-l overflow-hidden"
          style="--columns: ${widths.join(' ')}"
          role="table"
        >
          <div class="row head" role="row">
            ${sortable.slice(0, 3).map(heading)}
            ${extra.map(
              column => html`
                <span role="columnheader" data-testid="head-${column}">
                  ${this.t(`column_${column}`)}
                </span>
              `
            )}
            ${sortable.slice(3).map(heading)}
          </div>
          ${shown.map(group => this.__renderRow(group, extra, collections))}
          ${this.__renderStatus(all, shown)}
        </div>

        ${this.data ? this.__renderFooter(all, shown) : ''}
      </div>
    `;
  }

  protected async _sendGet(): Promise<Data> {
    const fetchPage = (url: string) => this._fetch(url);
    // Without the collections the list only loses their filter and column.
    const [products, collections] = await Promise.all([
      loadAllProducts(this.href, fetchPage),
      this.productCollections
        ? loadAll<Collection>(this.productCollections, 'fx:product_collections', fetchPage).catch(
            () => [] as Collection[]
          )
        : ([] as Collection[]),
    ]);

    // The API gives a collection's id only in its link.
    this.__collections = collections.map(({ _links, name, path }) => ({
      id: Number(getResourceId(_links.self.href)),
      name,
      path,
    }));
    this.__fact =
      this.random() < FACT_CHANCE ? FACTS[Math.floor(this.random() * FACTS.length)] : null;

    return {
      _links: { self: { href: this.href } },
      _embedded: { 'fx:products': products },
      total_items: products.length,
      returned_items: products.length,
      offset: 0,
      limit: products.length,
    } as unknown as Data;
  }

  /** The optional columns this store has anything to show in. */
  private get __offeredColumns(): ExtraColumn[] {
    const hasTemplates = this.groups.some(group => group.product.product_type === 'template');
    return EXTRA_COLUMNS.filter(column =>
      column === 'collection' ? this.__collections.length > 0 : hasTemplates
    );
  }

  private __toggleColumn(column: ExtraColumn, shown: boolean) {
    this.extraColumns = EXTRA_COLUMNS.filter(c =>
      c === column ? shown : this.extraColumns.includes(c)
    );
    try {
      localStorage.setItem(COLUMNS_KEY, JSON.stringify(this.extraColumns));
    } catch {
      // The choice still holds for this visit.
    }
  }

  private __renderFooter(all: ProductGroup[], shown: ProductGroup[]) {
    if (this.__fact && shown.length === all.length) {
      return html`
        <p class="text-secondary" data-testid="fact">
          ${this.t(`fact_${this.__fact.id}`)}
          <a class="link" target="_blank" rel="noopener noreferrer" href=${this.__fact.href}>
            ${this.__fact.source}
          </a>
        </p>
      `;
    }

    const templates = all.filter(group => group.product.product_type === 'template').length;
    const variants = all.reduce((sum, group) => sum + group.variants.length, 0);
    const counts = [
      this.t('product_count', { count: all.length - templates }),
      variants ? this.t('variant_count', { count: variants }) : '',
      templates ? this.t('template_count', { count: templates }) : '',
    ];

    return html`
      <p class="text-secondary" data-testid="summary">
        ${shown.length < all.length
          ? html`
              ${this.t('showing', { count: shown.length, total: all.length })}
              <button
                type="button"
                class="link"
                data-testid="clear-filters"
                @click=${() => {
                  this.query = '';
                  this.typeFilter = 'all';
                  this.collectionFilter = '';
                  this.templateFilter = '';
                }}
              >
                ${this.t('clear_filters')}
              </button>
            `
          : counts.filter(Boolean).join(' · ')}
      </p>
    `;
  }

  private __renderStatus(all: ProductGroup[], shown: ProductGroup[]) {
    let key = '';
    if (this.in('fail')) key = this.accessDenied ? 'access_denied' : 'error';
    else if (!this.data) key = 'loading';
    else if (!all.length) key = 'empty';
    else if (!shown.length) key = 'no_matches';
    if (!key) return '';

    if (key === 'loading') {
      return html`
        <div
          class="p-l flex justify-center text-primary"
          data-testid="status"
          role="status"
          aria-label=${this.t(key)}
        >
          ${renderLoadingLogo('fill-current w-xl h-xl')}
        </div>
      `;
    }

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

  private __renderRow(
    group: ProductGroup,
    extra: ExtraColumn[],
    collections: ReturnType<typeof collectionTree>
  ) {
    const { product, variants } = group;
    const isTemplate = product.product_type === 'template';
    const template = this.groups.find(
      ({ product: other }) =>
        other.product_type === 'template' && productId(other) === product.inherit_from_id
    )?.product;
    const extraText: Record<ExtraColumn, string> = {
      collection: collections.find(c => c.id === product.collection_id)?.trail ?? '',
      template: template ? productName(template) || template.sku : '',
    };
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
          <span class="font-medium" style="overflow-wrap: anywhere" data-testid="name"
            >${name}</span
          >
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
        ${extra.map(
          column => html`
            <span role="cell" class="text-s" style="overflow-wrap: anywhere" data-testid=${column}>
              ${extraText[column] || '—'}
            </span>
          `
        )}
        <span role="cell" data-testid="price">${price || '—'}</span>
        <span
          role="cell"
          class="text-s inline-flex items-center"
          style="gap: 0.4375rem"
          data-testid="stock"
          data-state=${stock.state}
        >
          ${isTemplate
            ? this.__templateStockText(product.stock_level)
            : html`
                <span class="dot" style="background: ${STOCK_COLORS[stock.state]}"></span>
                ${this.__stockText(stock, variants.length > 0)}
              `}
        </span>
      </a>
    `;
  }

  // A template is never sold: its stock is only what its products start with.
  private __templateStockText(level: number | null): string {
    return typeof level === 'number'
      ? this.t('stock_template', { count: level })
      : this.t('stock_template_none');
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
