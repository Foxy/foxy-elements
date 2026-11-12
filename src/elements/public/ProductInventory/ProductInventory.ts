import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { ProductGroup, StockState } from '../ProductList/listing';
import type { Data as Product } from '../ProductForm/types';
import type { Data } from '../ProductList/types';

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
  groupProducts,
  loadAllProducts,
  lowStockThresholdOf,
  matchesQuery,
  productId,
  productName,
  productStockState,
  stockHolders,
  stockState,
  variantLabel,
} from '../ProductList/listing';

const NS = 'product-inventory';
const Base = TranslatableMixin(ConfigurableMixin(ThemeableMixin(NucleonElement)), NS);

type Filter = 'all' | 'low_stock' | 'out_of_stock' | 'untracked';

const FILTERS: Filter[] = ['all', 'low_stock', 'out_of_stock', 'untracked'];

const MAX_THRESHOLD = 1000000;

/** A whole number of units, or `null` for blank, which means not tracked. */
function parseStock(value: string): number | null | undefined {
  const text = value.trim();
  if (text === '') return null;
  return /^\d{1,9}$/.test(text) ? Number(text) : undefined;
}

/**
 * Stock for every item of a store that holds any: standalone products and
 * variants, grouped under their product. One product's counts are changed and
 * saved at a time, each as a PATCH of that item's `stock_level`.
 *
 * @element foxy-product-inventory
 * @since 1.60.0
 */
export class ProductInventory extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      lowStockThreshold: { type: Number, attribute: 'low-stock-threshold' },
      getProductPageHref: { attribute: false },
      productSettings: { attribute: 'product-settings' },
      query: {},
      __filter: { attribute: false },
      __draft: { attribute: false },
      __active: { attribute: false },
      __blocked: { attribute: false },
      __message: { attribute: false },
      __saving: { attribute: false },
      __thresholdDraft: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        .row {
          display: grid;
          grid-template-columns: minmax(0, 2.2fr) minmax(0, 1.6fr) 9.5rem 8rem;
          gap: 0.75rem;
          align-items: center;
          padding: 0.5rem 1rem 0.5rem 2rem;
          border-top: 1px solid var(--lumo-contrast-5pct);
        }

        .row.head {
          padding: 0.625rem 1rem;
          border-top: 0;
          background: var(--lumo-contrast-5pct);
          font-size: var(--lumo-font-size-s);
          font-weight: 600;
          color: var(--lumo-secondary-text-color);
        }

        .row.changed {
          background: #fffbf0;
        }

        .group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 1rem;
          border-top: 1px solid var(--lumo-contrast-10pct);
          background: var(--lumo-contrast-5pct);
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

        input {
          box-sizing: border-box;
          height: 2.125rem;
          padding: 0 0.5rem;
          border: 1px solid var(--lumo-contrast-30pct);
          border-radius: var(--lumo-border-radius-s);
          background: var(--lumo-base-color);
          color: inherit;
          font: inherit;
        }

        input.stock {
          width: 100%;
        }

        .changed input.stock {
          border-color: #e5c98f;
        }

        input.invalid {
          border-color: var(--lumo-error-color);
        }

        input[type='search'] {
          flex: 1 1 16rem;
          max-width: 22.5rem;
          height: 2.25rem;
        }

        button {
          height: 1.875rem;
          padding: 0 0.75rem;
          border-radius: var(--lumo-border-radius-s);
          font-size: var(--lumo-font-size-s);
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
          cursor: default;
        }

        button:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--lumo-primary-color-50pct);
          outline-offset: 1px;
        }

        button.primary {
          background: var(--lumo-primary-color);
          color: var(--lumo-primary-contrast-color);
          font-weight: 600;
        }

        button.secondary {
          background: var(--lumo-contrast-10pct);
        }

        button.tertiary {
          background: var(--lumo-primary-color-10pct);
          color: var(--lumo-primary-text-color);
        }

        button.link {
          height: auto;
          padding: 0;
          color: var(--lumo-primary-text-color);
          text-decoration: underline;
        }

        button.pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4375rem;
          height: 2.125rem;
          border: 1px solid var(--lumo-contrast-30pct);
          border-radius: 1.0625rem;
          background: var(--lumo-base-color);
        }

        button.pill[aria-checked='true'] {
          border-color: var(--lumo-primary-color);
          background: var(--lumo-primary-color-10pct);
          color: var(--lumo-primary-text-color);
        }

        @media (max-width: 47.99rem) {
          .row {
            grid-template-columns: minmax(0, 1fr) 6rem;
          }

          .row .sku,
          .row.head {
            display: none;
          }
        }
      `,
    ];
  }

  /** Stock at or below this is low. 0 means nothing is. Read from `productSettings` when set. */
  lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD;

  /** URL of the store's `fx:product_settings`, which holds the low-stock threshold. */
  productSettings: string | null = null;

  /** Returns the URL of a product's page for its `self` link. Names aren't links without it. */
  getProductPageHref: ((href: string) => string) | null = null;

  /** Text a product's name or SKU, or a variant's SKU, must contain. */
  query = '';

  private __filter: Filter = 'all';

  /** Unsaved stock, as typed, by the item's `self` link. Only the active product has any. */
  private __draft: Record<string, string> = {};

  /** The id of the product being edited. */
  private __active: number | null = null;

  /** The id of the product an edit was refused for, while another has unsaved changes. */
  private __blocked: number | null = null;

  private __message: { type: 'saved' | 'error'; text: string } | null = null;

  private __saving = false;

  private __thresholdDraft: string | null = null;

  get groups(): ProductGroup[] {
    return groupProducts(this.data?._embedded['fx:products'] ?? []).filter(
      group => group.product.product_type !== 'template'
    );
  }

  /** Whether a product has stock changes that haven't been saved. */
  get hasChanges(): boolean {
    return this.__changes.length > 0;
  }

  render(): TemplateResult {
    const groups = this.groups;
    const threshold = this.lowStockThreshold;
    const counts: Record<Filter, number> = { all: 0, low_stock: 0, out_of_stock: 0, untracked: 0 };

    for (const group of groups) {
      const holders = stockHolders(group);
      if (!holders.length) counts.untracked++;
      for (const holder of holders) {
        counts.all++;
        const state = productStockState(holder, threshold);
        if (state === 'low_stock' || state === 'out_of_stock') counts[state]++;
      }
    }

    const sections = groups
      .filter(group => matchesQuery(group, this.query))
      .map(group => this.__renderGroup(group))
      .filter(section => section !== null);

    return html`
      <div class="grid gap-m text-body font-lumo leading-s" aria-busy=${this.in('busy')}>
        <div class="flex flex-wrap items-end" style="gap: 0.5rem 1rem">
          <p class="text-s text-secondary" style="flex: 1 1 24rem">${this.t('intro')}</p>
          ${this.__renderThreshold()}
        </div>

        <div class="flex flex-wrap items-center" style="gap: 0.75rem">
          <input
            type="search"
            data-testid="search"
            aria-label=${this.t('search_label')}
            placeholder=${this.t('search_placeholder')}
            .value=${this.query}
            @input=${(evt: Event) => (this.query = (evt.currentTarget as HTMLInputElement).value)}
          />
          <div role="radiogroup" aria-label=${this.t('filter_label')} class="flex flex-wrap">
            ${FILTERS.map(
              filter => html`
                <button
                  type="button"
                  role="radio"
                  class="pill"
                  style="margin-right: 0.375rem"
                  data-testid="filter-${filter}"
                  aria-checked=${this.__filter === filter ? 'true' : 'false'}
                  @click=${() => (this.__filter = filter)}
                >
                  ${filter === 'all'
                    ? ''
                    : html`<span class="dot" style="background: ${STOCK_COLORS[filter]}"></span>`}
                  ${this.t(`filter_${filter}`)}
                  <span class="font-semibold">${counts[filter]}</span>
                </button>
              `
            )}
          </div>
        </div>

        ${this.__message
          ? html`
              <p
                class="rounded text-s ${this.__message.type === 'error' ? 'text-error' : ''}"
                style="padding: 0.625rem 0.875rem; background: ${this.__message.type === 'error'
                  ? 'var(--lumo-error-color-10pct)'
                  : 'var(--lumo-success-color-10pct)'}"
                role=${this.__message.type === 'error' ? 'alert' : 'status'}
                data-testid="message"
              >
                ${this.__message.text}
              </p>
            `
          : ''}
        ${this.__renderBlocked(groups)}

        <div class="border border-contrast-10 rounded-l overflow-hidden">
          <div class="row head">
            <span>${this.t('column_item')}</span>
            <span class="sku" style="font-family: inherit">${this.t('column_sku')}</span>
            <span>${this.t('column_status')}</span>
            <span>${this.t('column_stock')}</span>
          </div>
          ${sections} ${this.__renderStatus(sections.length)}
        </div>
      </div>
    `;
  }

  /** Saves the active product's changed counts, one PATCH per item. */
  async save(): Promise<void> {
    const changes = this.__changes;
    if (!changes.length || this.__saving || changes.some(change => change.value === undefined)) {
      return;
    }

    const name = this.__groupName(this.__active);
    const saved = new Map<string, Product>();
    this.__saving = true;
    this.__message = null;

    for (const { product, value } of changes) {
      const href = product._links.self.href;
      try {
        const updated = await this._fetch<Product>(href, {
          method: 'PATCH',
          body: JSON.stringify({ stock_level: value }),
        });
        saved.set(href, updated);
      } catch {
        // Stop at the first refusal, keeping what's left as unsaved changes.
        break;
      }
    }

    if (saved.size && this.data) {
      const products = this.data._embedded['fx:products'].map(
        product => saved.get(product._links.self.href) ?? product
      );
      this.data = { ...this.data, _embedded: { 'fx:products': products } } as Data;
      saved.forEach((product, href) => {
        NucleonElement.Rumour(this.group).share({ data: product, source: href });
      });
      this.dispatchEvent(new CustomEvent('stock-change', { bubbles: true, composed: true }));
    }

    const draft = { ...this.__draft };
    saved.forEach((_, href) => delete draft[href]);
    this.__draft = draft;
    this.__saving = false;
    this.__blocked = null;

    if (saved.size === changes.length) {
      this.__active = null;
      this.__message = { type: 'saved', text: this.t('saved', { name }) };
    } else {
      this.__message = { type: 'error', text: this.t('save_failed', { name }) };
    }
  }

  /** Drops the active product's unsaved counts. */
  cancel(): void {
    this.__draft = {};
    this.__active = null;
    this.__blocked = null;
  }

  protected async _sendGet(): Promise<Data> {
    const [products, settings] = await Promise.all([
      loadAllProducts(this.href, url => this._fetch(url)),
      this.productSettings
        ? this._fetch<{ low_stock_threshold?: number }>(this.productSettings).catch(() => null)
        : null,
    ]);

    const threshold = settings?.low_stock_threshold;
    if (typeof threshold === 'number') this.lowStockThreshold = threshold;

    return {
      _links: { self: { href: this.href } },
      _embedded: { 'fx:products': products },
      total_items: products.length,
      returned_items: products.length,
      offset: 0,
      limit: products.length,
    } as unknown as Data;
  }

  /** The active product's items whose typed count differs from the saved one. */
  private get __changes(): { product: Product; value: number | null | undefined }[] {
    const products = this.data?._embedded['fx:products'] ?? [];
    return Object.entries(this.__draft).flatMap(([href, text]) => {
      const product = products.find(p => p._links.self.href === href);
      if (!product) return [];
      const value = parseStock(text);
      return value === (product.stock_level ?? null) ? [] : [{ product, value }];
    });
  }

  private __groupName(id: number | null): string {
    const group = this.groups.find(g => productId(g.product) === id);
    return group ? productName(group.product) || group.product.sku : '';
  }

  /** Takes a typed count, or refuses it while another product has unsaved changes. */
  private __edit(group: ProductGroup, product: Product, value: string): boolean {
    const id = productId(group.product);
    if (this.__active !== null && this.__active !== id && this.hasChanges) {
      this.__blocked = id;
      return false;
    }

    const draft = this.__active === id ? this.__draft : {};
    this.__draft = { ...draft, [product._links.self.href]: value };
    this.__active = id;
    this.__blocked = null;
    this.__message = null;
    return true;
  }

  private __renderThreshold() {
    const threshold = this.lowStockThreshold;
    const draft = this.__thresholdDraft;

    if (draft === null) {
      return html`
        <p class="text-s text-secondary" data-testid="threshold">
          ${threshold > 0 ? this.t('threshold', { count: threshold }) : this.t('threshold_off')}
          ${this.productSettings
            ? html`
                ·
                <button
                  type="button"
                  class="link"
                  data-testid="threshold-change"
                  @click=${() => (this.__thresholdDraft = String(threshold))}
                >
                  ${this.t('threshold_change')}
                </button>
              `
            : ''}
        </p>
      `;
    }

    const value = /^\d{1,7}$/.test(draft.trim()) ? Number(draft) : NaN;
    const valid = value >= 0 && value <= MAX_THRESHOLD;

    return html`
      <form
        class="flex flex-wrap items-center text-s"
        style="gap: 0.5rem"
        data-testid="threshold-form"
        @submit=${(evt: Event) => {
          evt.preventDefault();
          if (valid) this.__saveThreshold(value);
        }}
      >
        <label for="threshold">${this.t('threshold_label')}</label>
        <input
          id="threshold"
          class=${valid ? '' : 'invalid'}
          style="width: 5.5rem"
          type="number"
          min="0"
          max=${MAX_THRESHOLD}
          step="1"
          aria-describedby="threshold-help"
          .value=${draft}
          @input=${(evt: Event) =>
            (this.__thresholdDraft = (evt.currentTarget as HTMLInputElement).value)}
        />
        <button type="submit" class="primary" ?disabled=${!valid || this.__saving}>
          ${this.t('save')}
        </button>
        <button type="button" class="secondary" @click=${() => (this.__thresholdDraft = null)}>
          ${this.t('cancel')}
        </button>
        <span id="threshold-help" class="text-secondary" style="flex-basis: 100%">
          ${this.t('threshold_helper_text')}
        </span>
      </form>
    `;
  }

  private async __saveThreshold(value: number) {
    if (!this.productSettings) return;
    this.__saving = true;
    this.__message = null;
    try {
      const settings = await this._fetch<{ low_stock_threshold: number }>(this.productSettings, {
        method: 'PATCH',
        body: JSON.stringify({ low_stock_threshold: value }),
      });
      this.lowStockThreshold = settings.low_stock_threshold ?? value;
      this.__thresholdDraft = null;
      this.dispatchEvent(
        new CustomEvent('threshold-change', {
          detail: this.lowStockThreshold,
          bubbles: true,
          composed: true,
        })
      );
    } catch {
      this.__message = { type: 'error', text: this.t('threshold_failed') };
    }
    this.__saving = false;
  }

  private __renderBlocked(groups: ProductGroup[]) {
    if (this.__blocked === null || !groups.length) return '';
    const active = this.__groupName(this.__active);
    return html`
      <div
        class="flex flex-wrap items-center rounded"
        style="gap: 0.75rem; padding: 0.75rem 0.875rem; background: #fff6e5; color: #5e3b00"
        role="alert"
        data-testid="blocked"
      >
        <p class="text-s" style="flex: 1 1 24rem">
          ${this.t('blocked', { active, blocked: this.__groupName(this.__blocked) })}
        </p>
        <button
          type="button"
          class="primary"
          data-testid="blocked-save"
          ?disabled=${this.__saving}
          @click=${() => this.save()}
        >
          ${this.t('save_named', { name: active })}
        </button>
        <button
          type="button"
          class="secondary"
          data-testid="blocked-cancel"
          @click=${() => this.cancel()}
        >
          ${this.t('cancel_changes')}
        </button>
      </div>
    `;
  }

  private __renderStatus(shown: number) {
    let key = '';
    if (this.in('fail')) key = this.accessDenied ? 'access_denied' : 'error';
    else if (!this.data) key = 'loading';
    else if (!shown) key = 'no_matches';
    if (!key) return '';

    return html`
      <p
        class="p-l text-center text-s ${key === 'error' ? 'text-error' : 'text-secondary'}"
        style="border-top: 1px solid var(--lumo-contrast-10pct)"
        data-testid="status"
        role=${key === 'error' ? 'alert' : 'status'}
      >
        ${this.t(key)}
      </p>
    `;
  }

  private __renderGroup(group: ProductGroup): TemplateResult | null {
    const { product, variants } = group;
    const id = productId(product);
    const isActive = this.__active === id;
    const holders = stockHolders(group);
    const draft = isActive ? this.__draft : {};

    // Starting to track adds rows for what would hold the stock: each variant, or the product.
    const started = [product, ...variants].filter(
      item => !holders.includes(item) && draft[item._links.self.href] !== undefined
    );
    const items = [product, ...variants].filter(
      item => holders.includes(item) || started.includes(item)
    );

    if (this.__filter === 'untracked') {
      if (holders.length) return null;
    } else if (!holders.length && !started.length) {
      return null;
    }

    const rows = items.filter(item => {
      if (isActive || this.__filter === 'all' || this.__filter === 'untracked') return true;
      return productStockState(item, this.lowStockThreshold) === this.__filter;
    });
    if (!rows.length && holders.length) return null;

    const name = productName(product) || product.sku;
    const href = this.getProductPageHref?.(product._links.self.href);
    const changes = isActive ? this.__changes : [];
    const invalid = changes.some(change => change.value === undefined);
    const type = variants.length
      ? `${this.t('type_parent')} · ${this.t('variant_count', { count: variants.length })}`
      : this.t('type_standalone');

    return html`
      <section data-testid="group" data-sku=${product.sku}>
        <div class="group">
          <a
            class="text-m font-semibold text-body"
            style="text-decoration: none"
            href=${ifDefined(href)}
            data-testid="group-name"
          >
            ${name}
          </a>
          <span class="text-xs text-secondary">${type}</span>
          ${changes.length
            ? html`
                <span class="flex items-center" style="margin-left: auto; gap: 0.5rem">
                  <span class="text-xs" style="color: #8a4b00">
                    ${this.t(invalid ? 'invalid' : 'unsaved')}
                  </span>
                  <button
                    type="button"
                    class="primary"
                    data-testid="save"
                    ?disabled=${invalid || this.__saving}
                    @click=${() => this.save()}
                  >
                    ${this.t(this.__saving ? 'saving' : 'save')}
                  </button>
                  <button
                    type="button"
                    class="secondary"
                    data-testid="cancel"
                    ?disabled=${this.__saving}
                    @click=${() => this.cancel()}
                  >
                    ${this.t('cancel')}
                  </button>
                </span>
              `
            : !holders.length && !started.length
            ? html`
                <button
                  type="button"
                  class="tertiary"
                  style="margin-left: auto"
                  data-testid="start-tracking"
                  @click=${() => this.__startTracking(group)}
                >
                  ${this.t('start_tracking')}
                </button>
              `
            : started.length
            ? html`
                <button
                  type="button"
                  class="secondary"
                  style="margin-left: auto"
                  data-testid="cancel"
                  @click=${() => this.cancel()}
                >
                  ${this.t('cancel')}
                </button>
              `
            : ''}
        </div>
        ${started.length
          ? html`<p class="text-s text-secondary" style="padding: 0.5rem 1rem 0.5rem 2rem">
              ${this.t(variants.length ? 'start_tracking_variants' : 'start_tracking_product')}
            </p>`
          : ''}
        ${rows.map(item => this.__renderRow(group, item, draft))}
      </section>
    `;
  }

  private __renderRow(group: ProductGroup, item: Product, draft: Record<string, string>) {
    const href = item._links.self.href;
    const saved = item.stock_level ?? null;
    const text = draft[href] ?? (saved === null ? '' : String(saved));
    const value = parseStock(text);
    const changed = draft[href] !== undefined && value !== saved;
    const state: StockState = stockState(
      value === undefined ? saved : value,
      lowStockThresholdOf(item, this.lowStockThreshold)
    );
    const inputId = `stock-${productId(item)}`;
    const label =
      item === group.product
        ? productName(item) || item.sku
        : variantLabel(group.product, item) || item.sku;

    return html`
      <div class="row ${changed ? 'changed' : ''}" data-testid="item" data-sku=${item.sku}>
        <label class="text-m" style="overflow-wrap: anywhere" for=${inputId}>${label}</label>
        <span class="sku">${item.sku}</span>
        <span
          class="text-s inline-flex items-center"
          style="gap: 0.4375rem"
          data-testid="state"
          data-state=${state}
        >
          <span class="dot" style="background: ${STOCK_COLORS[state]}"></span>
          ${this.t(`state_${state}`)}
        </span>
        <input
          id=${inputId}
          class="stock ${value === undefined ? 'invalid' : ''}"
          type="number"
          inputmode="numeric"
          min="0"
          step="1"
          placeholder=${this.t('not_tracked_placeholder')}
          aria-invalid=${value === undefined ? 'true' : 'false'}
          ?disabled=${this.__saving}
          .value=${text}
          @input=${(evt: Event) => {
            const input = evt.currentTarget as HTMLInputElement;
            // A refused edit re-renders with the same value, which wouldn't reset the field.
            if (!this.__edit(group, item, input.value)) input.value = text;
          }}
        />
      </div>
    `;
  }

  private __startTracking(group: ProductGroup) {
    const id = productId(group.product);
    if (this.__active !== null && this.__active !== id && this.hasChanges) {
      this.__blocked = id;
      return;
    }

    const items = group.variants.length ? group.variants : [group.product];
    this.__draft = Object.fromEntries(items.map(item => [item._links.self.href, '']));
    this.__active = id;
    this.__blocked = null;
    this.__message = null;
  }
}
