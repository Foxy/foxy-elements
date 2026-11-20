import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { ListedCollection, ProductGroup, SortColumn, TypeFilter } from './listing';
import type { Data as Collection } from '../ProductCollectionForm/types';
import type { Data as Product } from '../ProductForm/types';
import type { CachedList } from './cache';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { loadingLogoStyles, renderLoadingLogo } from '../../private/LoadingScreen/LoadingScreen';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { getResourceId } from '@foxy.io/sdk/core';
import { ifDefined } from 'lit-html/directives/if-defined';
import { readCachedList, writeCachedList, clearCachedLists } from './cache';
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
type StandardColumn = 'type' | 'price' | 'stock';

const EXTRA_COLUMNS: ExtraColumn[] = ['collection', 'template'];
const STANDARD_COLUMNS: StandardColumn[] = ['type', 'price', 'stock'];
const COLUMNS_KEY = 'foxy-product-list:columns';
const HIDDEN_COLUMNS_KEY = 'foxy-product-list:hidden-columns';
const WIDTHS: Record<SortColumn, string> = {
  name: 'minmax(0, 2.4fr)',
  sku: 'minmax(0, 1.4fr)',
  type: '9.5rem',
  collection: 'minmax(5.5rem, 1.3fr)',
  template: 'minmax(5.5rem, 1.3fr)',
  price: '9rem',
  stock: '11rem',
};
const FACT_CHANCE = 0.01;

/** The URL of a product's first image, its own or inherited. */
function imageOf(product: Product): string {
  return (product.compiled_definition?.images ?? product.definition?.images)?.[0]?.src || '';
}

// Storage can be missing or refuse access; the columns then last until the page is left.
function storedColumns<T extends string>(key: string, columns: T[]): T[] {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown;
    return columns.filter(column => Array.isArray(stored) && stored.includes(column));
  } catch {
    return [];
  }
}

function storeColumns(key: string, columns: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(columns));
  } catch {
    // The choice still holds for this visit.
  }
}

/**
 * Every product of a store as a table of name, SKU, type, price and stock,
 * searched by name or SKU and narrowed by type, collection or template.
 * Variants aren't rows of their own: a product's row carries their count,
 * price range and stock.
 *
 * @fires CustomEvent - `filter-change` when the search text or a filter is changed in the list.
 *
 * @element foxy-product-list
 * @since 1.62.0
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
      hiddenColumns: { attribute: false },
      random: { attribute: false },
      __collections: { attribute: false },
      __fact: { attribute: false },
      __failedImages: { attribute: false },
      getProductPageHref: { attribute: false },
      getThumbnailUrl: { attribute: false },
      storage: { attribute: false },
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

        .thumb {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--lumo-border-radius-s);
          background: var(--lumo-contrast-5pct);
          overflow: hidden;
        }

        .thumb img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          padding-right: 2rem;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%23808a96' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2.5 4.5 6 8l3.5-3.5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
        }

        details {
          position: relative;
          margin-left: auto;
        }

        summary {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          padding-right: 0.75rem;
          cursor: pointer;
        }

        summary::after {
          content: '▾';
          margin-left: 0.5rem;
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

          .head,
          .thumb {
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

  /**
   * Returns the URL of a small version of a product image, given the image's URL. Without it,
   * or when that URL doesn't load, the image itself is shown, scaled down.
   */
  getThumbnailUrl: ((src: string) => string) | null = null;

  /**
   * Where the list keeps a copy of its last load, such as `sessionStorage`, to show while the
   * next one is on its way. The copy is kept by the list's URL. The page that sets this decides
   * who may see it: see `clearCachedLists`. Without it, nothing is kept.
   */
  storage: Storage | null = null;

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

  /** The columns shown only when chosen, which the browser remembers. */
  extraColumns: ExtraColumn[] = storedColumns(COLUMNS_KEY, EXTRA_COLUMNS);

  /** The columns shown unless hidden, which the browser remembers too. Name and SKU always show. */
  hiddenColumns: StandardColumn[] = storedColumns(HIDDEN_COLUMNS_KEY, STANDARD_COLUMNS);

  /** Returns a number from 0 up to 1, which decides whether a load shows a fact and which one. */
  random: () => number = Math.random;

  /** The column the rows are ordered by. */
  sortColumn: SortColumn = 'name';

  sortDescending = false;

  private __collections: ListedCollection[] = [];

  private __fact: (typeof FACTS)[number] | null = null;

  /** Image URLs that didn't load, so that the next one in line is shown instead. */
  private __failedImages = new Set<string>();

  private __staleHref = '';

  private __staleList: CachedList | null = null;

  /** The products shown as rows, each with its variants, in display order. */
  get groups(): ProductGroup[] {
    return groupProducts(this.data?._embedded['fx:products'] ?? this.__stale?.products ?? []);
  }

  /** The stored copy of the list, while there is nothing newer and nothing has gone wrong. */
  private get __stale(): CachedList | null {
    if (this.data || this.in('fail') || !this.storage || !this.href) return null;
    if (this.__staleHref !== this.href) {
      this.__staleHref = this.href;
      this.__staleList = readCachedList(this.storage, this.href);
    }
    return this.__staleList;
  }

  private get __listedCollections(): ListedCollection[] {
    return this.data ? this.__collections : this.__stale?.collections ?? [];
  }

  render(): TemplateResult {
    const all = this.groups;
    const listed = this.__listedCollections;
    const collections = collectionTree(listed);
    const templates = all.filter(group => group.product.product_type === 'template');
    const matching = all.filter(
      group =>
        matchesQuery(group, this.query) &&
        (this.typeFilter === 'all' || groupType(group) === this.typeFilter) &&
        matchesCollection(group, this.collectionFilter, listed) &&
        (!this.templateFilter || String(group.product.inherit_from_id) === this.templateFilter)
    );
    const offered = this.__offeredColumns(all, listed);
    const choices = (['type', ...offered, 'price', 'stock'] as const).filter(
      column =>
        column === 'type' || column === 'price' || column === 'stock' || offered.includes(column)
    );
    const isShown = (column: (typeof choices)[number]) =>
      column === 'collection' || column === 'template'
        ? this.extraColumns.includes(column)
        : !this.hiddenColumns.includes(column);
    const columns: SortColumn[] = ['name', 'sku', ...choices.filter(isShown)];
    const labels = this.__labels(collections, templates);
    const shown = sortGroups(matching, this.sortColumn, this.sortDescending, labels);
    // By every product rather than the ones shown, so that filtering doesn't move the columns.
    const hasImages = all.some(group => !!imageOf(group.product));
    const widths = [...(hasImages ? ['2.5rem'] : []), ...columns.map(column => WIDTHS[column])];
    const heading = (column: SortColumn) => {
      const sorted = column === this.sortColumn;
      return html`
        <span
          role="columnheader"
          data-testid="head-${column}"
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
            @input=${(evt: Event) =>
              this.__filter({ query: (evt.currentTarget as HTMLInputElement).value })}
          />
          <select
            data-testid="type-filter"
            aria-label=${this.t('type_filter_label')}
            .value=${this.typeFilter}
            @change=${(evt: Event) =>
              this.__filter({
                typeFilter: (evt.currentTarget as HTMLSelectElement).value as TypeFilter,
              })}
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
                  @change=${(evt: Event) =>
                    this.__filter({
                      collectionFilter: (evt.currentTarget as HTMLSelectElement).value,
                    })}
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
                  @change=${(evt: Event) =>
                    this.__filter({
                      templateFilter: (evt.currentTarget as HTMLSelectElement).value,
                    })}
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
          ${choices.length
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
                    ${choices.map(
                      column => html`
                        <label>
                          <input
                            type="checkbox"
                            data-testid="column-${column}"
                            .checked=${isShown(column)}
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
            ${hasImages
              ? html`<span role="columnheader" aria-label=${this.t('column_image')}></span>`
              : ''}
            ${columns.map(heading)}
          </div>
          ${shown.map(group => this.__renderRow(group, columns, labels, hasImages))}
          ${this.__renderStatus(all, shown)}
        </div>

        ${this.data || this.__stale ? this.__renderFooter(all, shown) : ''}
      </div>
    `;
  }

  protected async _sendGet(): Promise<Data> {
    const fetchPage = (url: string) => this._fetch(url);
    const href = this.href;
    let products: Product[];
    let collections: Collection[];

    try {
      // Without the collections the list only loses their filter and column.
      [products, collections] = await Promise.all([
        loadAllProducts(href, fetchPage),
        this.productCollections
          ? loadAll<Collection>(this.productCollections, 'fx:product_collections', fetchPage).catch(
              () => [] as Collection[]
            )
          : ([] as Collection[]),
      ]);
    } catch (err) {
      // A copy must not outlive the access it was loaded with.
      if (this.storage) clearCachedLists(this.storage);
      this.__staleHref = '';
      throw err;
    }

    // The API gives a collection's id only in its link.
    this.__collections = collections.map(({ _links, name, path }) => ({
      id: Number(getResourceId(_links.self.href)),
      name,
      path,
    }));
    this.__fact =
      this.random() < FACT_CHANCE ? FACTS[Math.floor(this.random() * FACTS.length)] : null;
    if (this.storage) {
      writeCachedList(this.storage, href, { products, collections: this.__collections });
    }

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
  private __offeredColumns(all: ProductGroup[], collections: ListedCollection[]): ExtraColumn[] {
    const hasTemplates = all.some(group => group.product.product_type === 'template');
    return EXTRA_COLUMNS.filter(column =>
      column === 'collection' ? collections.length > 0 : hasTemplates
    );
  }

  private __filter(
    changes: Partial<
      Pick<ProductList, 'query' | 'typeFilter' | 'collectionFilter' | 'templateFilter'>
    >
  ) {
    Object.assign(this, changes);
    this.dispatchEvent(new CustomEvent('filter-change'));
  }

  private __toggleColumn(column: ExtraColumn | StandardColumn, shown: boolean) {
    if (column === 'collection' || column === 'template') {
      this.extraColumns = EXTRA_COLUMNS.filter(c =>
        c === column ? shown : this.extraColumns.includes(c)
      );
      storeColumns(COLUMNS_KEY, this.extraColumns);
    } else {
      this.hiddenColumns = STANDARD_COLUMNS.filter(c =>
        c === column ? !shown : this.hiddenColumns.includes(c)
      );
      storeColumns(HIDDEN_COLUMNS_KEY, this.hiddenColumns);
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
                @click=${() =>
                  this.__filter({
                    query: '',
                    typeFilter: 'all',
                    collectionFilter: '',
                    templateFilter: '',
                  })}
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
    else if (!this.data && !this.__stale) key = 'loading';
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

  /** What a product shows in the Collection and Template columns. */
  private __labels(collections: ReturnType<typeof collectionTree>, templates: ProductGroup[]) {
    const trails = new Map(collections.map(collection => [collection.id, collection.trail]));
    const names = new Map(
      templates.map(({ product }) => [productId(product), productName(product) || product.sku])
    );
    return {
      collection: ({ product }: ProductGroup) => trails.get(product.collection_id as number) ?? '',
      template: ({ product }: ProductGroup) => names.get(product.inherit_from_id as number) ?? '',
    };
  }

  private __renderRow(
    group: ProductGroup,
    columns: SortColumn[],
    labels: ReturnType<ProductList['__labels']>,
    hasImages: boolean
  ) {
    const { product, variants } = group;
    const isTemplate = product.product_type === 'template';
    const image = imageOf(product);
    const sources = image ? [this.getThumbnailUrl?.(image) ?? image, image] : [];
    const src = sources.find(source => !this.__failedImages.has(source));
    const stock = stockSummary(group, this.lowStockThreshold);
    const href = this.getProductPageHref?.(product._links.self.href);
    const price = formatPriceRange(priceRange(group), this.currencyCode, this.lang);

    const type = variants.length
      ? `${this.t('type_parent')} · ${this.t('variant_count', { count: variants.length })}`
      : this.t(`type_${product.product_type}`);

    const text = (column: 'collection' | 'template') => html`
      <span role="cell" class="text-s" style="overflow-wrap: anywhere" data-testid=${column}>
        ${labels[column](group) || '—'}
      </span>
    `;

    const cells: Record<SortColumn, () => TemplateResult> = {
      name: () => html`
        <span role="cell" class="min-w-0">
          <span class="font-medium" style="overflow-wrap: anywhere" data-testid="name"
            >${productName(product)}</span
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
      `,
      sku: () => html`<span role="cell" class="sku" data-testid="sku">${product.sku}</span>`,
      type: () => html`
        <span role="cell" class="text-s text-secondary" data-testid="type">${type}</span>
      `,
      collection: () => text('collection'),
      template: () => text('template'),
      price: () => html`<span role="cell" data-testid="price">${price || '—'}</span>`,
      stock: () => html`
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
      `,
    };

    return html`
      <a class="row" role="row" data-testid="row" data-sku=${product.sku} href=${ifDefined(href)}>
        ${hasImages
          ? html`
              <span role="cell" class="thumb" data-testid="thumbnail">
                ${src
                  ? html`
                      <img
                        loading="lazy"
                        decoding="async"
                        height="40"
                        width="40"
                        alt=""
                        src=${src}
                        @error=${() => {
                          this.__failedImages = new Set([...this.__failedImages, src]);
                        }}
                      />
                    `
                  : ''}
              </span>
            `
          : ''}
        ${columns.map(column => cells[column]())}
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
