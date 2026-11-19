import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { BooleanSelector, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { ListedCollection } from '../ProductList/listing';
import type {
  Data,
  ProductDefinition,
  ProductDefinitionImage,
  ProductModifier,
  ProductOption,
} from './types';

import { getResourceId } from '@foxy.io/sdk/core';
import {
  ImageTooLargeError,
  MAX_IMAGE_BYTES,
  isRemoval,
  mergeModifiers,
  validateModifiers,
  validateOptions,
} from './catalog';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';
import { css } from 'lit-element';
import {
  DEFAULT_LOW_STOCK_THRESHOLD,
  collectionTree,
  groupProducts,
  loadAll,
  loadAllProducts,
  stockSummary,
} from '../ProductList/listing';
import { sectionStyles } from './internal/styles';

const NS = 'product-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Unsaved changes to one variant, as typed. An emptied name, description or image list
 * goes back to the parent's. `delete` marks it for deletion on save.
 */
export interface VariantEdit {
  sku?: string;
  price?: string;
  stock?: string;
  weight?: string;
  name?: string;
  description?: string;
  images?: ProductDefinitionImage[];
  delete?: boolean;
}

type SectionKey = 'general' | 'inventory' | 'options' | 'modifiers' | 'properties' | 'storefront';

const OPEN_BY_DEFAULT: SectionKey[] = ['general', 'options', 'modifiers'];

const isAmount = (text: string) => text.trim() === '' || /^\d+(\.\d+)?$/.test(text.trim());

const isCount = (text: string) => text.trim() === '' || /^\d{1,9}$/.test(text.trim());

async function apiMessage(error: unknown): Promise<string> {
  if (!(error instanceof Response)) return '';
  const body = await error.json().catch(() => null);
  return body?._embedded?.['fx:errors']?.[0]?.message ?? '';
}

/**
 * Form element for creating or editing a Foxy Product (`fx:product`).
 *
 * A product that inherits (a variant from its parent, any other product from a
 * template) shows the inherited values as placeholders for its empty fields.
 *
 * @element foxy-product-form
 * @since 1.62.0
 */
export class ProductForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      productCollections: { attribute: 'product-collections' },
      itemCategories: { attribute: 'item-categories' },
      defaultDomain: { attribute: 'default-domain' },
      storefrontElementsHref: { attribute: 'storefront-elements-href' },
      getProductPageHref: { attribute: false },
      getThumbnailUrl: { attribute: false },
      lowStockThreshold: { type: Number, attribute: 'low-stock-threshold' },
      storefrontScript: { attribute: 'storefront-script' },
      inventoryHref: { attribute: 'inventory-href' },
      parentProduct: { attribute: false },
      variantEdits: { attribute: false },
      variantError: { attribute: false },
      generatedCount: { attribute: false },
      __deleteConfirmed: { attribute: false },
      __saveAttempted: { attribute: false },
      __confirming: { attribute: false },
      __variants: { attribute: false },
      __panel: { attribute: false },
      __open: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      sectionStyles,
      css`
        .pd-invalid {
          background-color: var(--lumo-error-color-10pct);
        }
      `,
    ];
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ sku }) => !!sku || 'sku:v8n_required',
      ({ sku }) => !sku || sku.length <= 255 || 'sku:v8n_too_long',
      // The API takes a product with no name of its own when it inherits one.
      ({ definition }, host: ProductForm) =>
        !!(definition as ProductDefinition | undefined)?.name ||
        !!host.__inherited?.name ||
        'name:v8n_required',
      ({ definition }) => {
        const price = (definition as ProductDefinition | undefined)?.price;
        if (price === undefined || price === null || price === '') return true;
        return Number(price) >= 0 || 'price:v8n_negative';
      },
      ({ definition }, host: ProductForm) => {
        const own = (definition as ProductDefinition | undefined)?.modifiers;
        const names = mergeModifiers(host.__inheritedModifiers, own ?? []).map(m => m.name);
        const options = (definition as ProductDefinition | undefined)?.options;
        return validateOptions(options, names).length === 0 || 'options:v8n_invalid';
      },
      (form, host: ProductForm) => {
        // Validation first runs while the element is still being constructed.
        const confirmed = (host.__deleteConfirmed ?? '').split(' ');
        const agreed = host.__variantsToDeleteBy(form).every(v => confirmed.includes(v.sku));
        return agreed || 'options:v8n_confirm_delete';
      },
      (form, host: ProductForm) => {
        const def = form.definition as ProductDefinition | undefined;
        const optionNames = (
          host.__isVariantForm(form) ? host.__parentOptions : def?.options ?? []
        ).map(option => option.name);
        const errors = validateModifiers(def?.modifiers, host.__inheritedModifiers, optionNames);
        return errors.length === 0 || 'modifiers:v8n_invalid';
      },
      (form, host: ProductForm) => {
        if (!host.__isVariantForm(form)) return true;
        for (const option of host.__parentOptions) {
          const value = form.option_values?.[option.name]?.toLowerCase();
          if (!option.values.some(v => v.value.toLowerCase() === value)) {
            return `option-values:${option.name}:v8n_required`;
          }
        }
        return true;
      },
    ];
  }

  /** Link to the `fx:product_collections` collection for this store, used by the collection picker. */
  productCollections: string | null = null;

  /** Link to the store's `fx:item_categories`, used by the item category picker. */
  itemCategories: string | null = null;

  /** Host domain for stores without a custom domain, such as `foxycart.com`, for the add-to-cart link. */
  defaultDomain: string | null = null;

  /**
   * The product this one inherits from: its parent, or its template. Loaded
   * with the product; set it for a new variant, which has nothing to load yet.
   */
  parentProduct: Data | null = null;

  /** Returns the URL of a product's page for its `self` link, for the link to a variant's own page. */
  getProductPageHref: ((href: string) => string) | null = null;

  /**
   * Returns the URL of a small version of a product image, given the image's URL. Every
   * preview in the form uses it; without it, or when that URL doesn't load, the image itself
   * is shown, scaled down.
   */
  getThumbnailUrl: ((src: string) => string) | null = null;

  /** URL of the page that sets the store's look for the storefront elements. */
  storefrontElementsHref: string | null = null;

  /** URL of the `foxy-products.js` module the storefront snippets load. No snippets without it. */
  storefrontScript: string | null = null;

  /** URL of the page that lists stock for every product. */
  inventoryHref: string | null = null;

  /** The store's low-stock number, which a product without its own uses. */
  lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD;

  /** Unsaved changes to this product's variants, by the variant's `self` link. Saved by `submit()`. */
  variantEdits: Record<string, VariantEdit> = {};

  /** Why the last save of the variants' changes stopped, if it did. */
  variantError = '';

  /** How many variants the last generate created, until the product is loaded afresh. */
  generatedCount: number | null = null;

  private __open: Partial<Record<SectionKey, boolean>> = {};

  /** The `self` link of the variant in the side panel, and its edits when the panel opened. */
  private __panel: { href: string; before: VariantEdit | undefined } | null = null;

  private __confirming = false;

  /** What had focus when each dialog opened. */
  private __openers = new Map<string, HTMLElement | null>();

  /** Whether a save was tried, after which the fields that stopped it stand out. */
  private __saveAttempted = false;

  private __store: Resource<Rels.Store> | null = null;

  /** The active variants of a product that has any, with the options they were loaded for. */
  private __variants: { options: ProductOption[]; list: Data[] } | null = null;

  /** The SKUs the merchant agreed to delete, so a further removal asks again. */
  private __deleteConfirmed = '';

  private readonly __kindOptions = [
    { label: 'option_product', value: 'product' },
    { label: 'option_template', value: 'template' },
  ];

  private readonly __kindGetValue = () =>
    this.form.product_type === 'template' ? 'template' : 'product';

  private readonly __kindSetValue = (value: string) => {
    this.edit({ product_type: value === 'template' ? 'template' : 'standalone' });
  };

  private readonly __templateGetValue = () => {
    const id = this.form.inherit_from_id;
    const products = this.__productsHref;
    return id && products ? new URL(`../../products/${id}`, products).toString() : undefined;
  };

  private readonly __templateSetValue = (href: string) => {
    const id = getResourceId(href);
    this.edit({ inherit_from_id: typeof id === 'number' ? id : null });
  };

  private readonly __templateExtendFilter = (params: URLSearchParams) => {
    params.set('product_type', 'template');
    const id = this.data && getResourceId(this.data._links.self.href);
    if (typeof id === 'number') params.set('id:not', String(id));
  };

  // definition.properties holds a string or a list of strings per name; the
  // control edits a list per name.
  private readonly __propertiesGetValue = () => {
    const properties = (this.form.definition as ProductDefinition | undefined)?.properties ?? {};
    return Object.fromEntries(
      Object.entries(properties).map(([name, value]) => [
        name,
        Array.isArray(value) ? value : [String(value)],
      ])
    );
  };

  private readonly __propertiesSetValue = (value: Record<string, string[]>) => {
    const properties = Object.fromEntries(
      Object.entries(value).map(([name, values]) => [
        name,
        values.length === 1 ? values[0] : values,
      ])
    );
    const definition = { ...(this.form.definition as ProductDefinition | undefined) };
    if (Object.keys(properties).length) definition.properties = properties;
    else delete definition.properties;
    this.edit({ definition });
  };

  // The picker works in hrefs; the product stores collection_id. A collection's
  // href is /product_collections/{id} beside /products/{id} and /stores/{id}.
  private readonly __collectionGetValue = () => {
    const id = this.form.collection_id;
    if (!id) return undefined;
    const self = this.data?._links.self.href;
    if (self) return new URL(`../product_collections/${id}`, self).toString();
    if (this.productCollections)
      return new URL(`../../product_collections/${id}`, this.productCollections).toString();
  };

  // By path, so that each collection follows its parent in the picker.
  private get __collectionsHref(): string | undefined {
    if (!this.productCollections) return undefined;
    try {
      const url = new URL(this.productCollections);
      url.searchParams.set('order', 'path asc');
      return url.toString();
    } catch {
      return this.productCollections;
    }
  }

  private readonly __collectionSetValue = (href: string) => {
    const id = getResourceId(href);
    this.edit({ collection_id: typeof id === 'number' ? id : null });
  };

  /** Each collection's name after its ancestors', by path, such as "Apparel › T-Shirts". */
  private __collectionTrails = new Map<string, string>();

  private readonly __collectionGetDisplayValueOptions = (collection: ListedCollection | null) => ({
    label: (collection && this.__collectionTrails.get(collection.path)) ?? collection?.name ?? '',
  });

  private get __itemCategoriesHref(): string | undefined {
    if (this.itemCategories) return this.itemCategories;
    const store = this.data?._links['fx:store']?.href;
    return store ? `${store}/item_categories` : undefined;
  }

  // The picker works in hrefs; the product stores the category's code. The
  // value is the store's categories narrowed to that code, which loads the
  // category for its name.
  private readonly __categoryGetValue = () => {
    const code = this.form.definition?.category_code;
    const categories = this.__itemCategoriesHref;
    if (!code || !categories) return undefined;
    const url = new URL(categories);
    url.searchParams.set('code', code);
    url.searchParams.set('limit', '1');
    return url.toString();
  };

  private readonly __categorySetValue = async (href: string) => {
    let code = '';
    if (href) {
      try {
        code = (await this._fetch<Resource<Rels.ItemCategory>>(href)).code;
      } catch {
        return;
      }
    }
    const definition = { ...(this.form.definition as ProductDefinition | undefined) };
    if (code) definition.category_code = code;
    else delete definition.category_code;
    this.edit({ definition });
  };

  // A code that matches no category is shown as it is.
  private readonly __categoryGetDisplayValueOptions = (
    categories: Resource<Rels.ItemCategories> | null
  ) => ({
    label:
      categories?._embedded?.['fx:item_categories']?.[0]?.name ??
      this.form.definition?.category_code,
  });

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];

    const type = this.data?.product_type;

    // Variants have no variants of their own, and templates none at all.
    if (type === 'variant' || type === 'template' || !this.href) {
      alwaysMatch.unshift('variants');
    }

    // A variant inherits from its parent, never from a template.
    if (this.__isVariant) alwaysMatch.unshift('general:template');

    // The kind is chosen once, when the product is created; a variant is never a template.
    if (this.href || this.__isVariant) alwaysMatch.unshift('general:kind');

    // A template's stock is only where new products start, so nothing draws on it.
    if (type === 'template') alwaysMatch.unshift('stock-rules');

    // A template is never listed, so there's nothing to hide it from.
    if (this.form.product_type === 'template') alwaysMatch.unshift('general:hidden');
    if (type !== 'template') alwaysMatch.unshift('template-products');

    // These sub-collections need the saved product's links.
    if (!this.href) {
      alwaysMatch.unshift('tags', 'stock-rules', 'template-products');
    }

    return new (super.hiddenSelector.constructor as new (s: string) => BooleanSelector)(
      alwaysMatch.join(' ').trim()
    );
  }

  get headerSubtitleKey(): string {
    return `subtitle_${this.data?.product_type ?? 'standalone'}`;
  }

  renderBody(): TemplateResult {
    const parent = this.parentProduct;
    const inherited = this.__inherited;
    const isTemplate = this.form.product_type === 'template';
    const isVariant = this.__isVariant;
    const hasVariantsSection = !isVariant && !isTemplate && !!this.href;
    const ownOptions = this.form.definition?.options ?? [];
    const optionNames = (isVariant ? this.__parentOptions : ownOptions).map(option => option.name);
    const modifiers = mergeModifiers(
      this.__inheritedModifiers,
      this.form.definition?.modifiers ?? []
    );
    const modifierNames = modifiers.map(modifier => modifier.name);
    const properties = Object.keys(this.form.definition?.properties ?? {});
    const missing = this.__missingCombinations;
    const categoryFrom = this.__inheritedCategory;
    const invalid = (prefix: string) =>
      this.__saveAttempted && this.errors.some(error => error.startsWith(prefix))
        ? 'pd-invalid'
        : '';

    return html`
      ${this.renderHeader()}
      ${parent
        ? html`
            <p class="text-s text-secondary leading-s" data-testid="inheritance-note">
              <foxy-i18n
                infer=""
                key=${parent.product_type === 'template'
                  ? 'inheritance_note_template'
                  : 'inheritance_note_parent'}
                .options=${{ product: this.__parentLabel }}
              >
              </foxy-i18n>
            </p>
          `
        : ''}
      ${this.__renderSection(
        'general',
        this.__generalSummary,
        html`
          ${this.hiddenSelector.matches('general:kind', true)
            ? ''
            : html`
                <foxy-internal-summary-control infer="general" .label=${''} .helperText=${''}>
                  <foxy-internal-radio-group-control
                    layout="summary-item"
                    infer="kind"
                    .options=${this.__kindOptions}
                    .getValue=${this.__kindGetValue}
                    .setValue=${this.__kindSetValue}
                  >
                  </foxy-internal-radio-group-control>
                </foxy-internal-summary-control>
              `}

          <foxy-internal-summary-control
            infer="general"
            layout="section"
            .label=${''}
            .helperText=${''}
          >
            <div class="pd-basics" data-testid="basics">
              <foxy-internal-text-control
                infer="name"
                class="pd-name ${invalid('name:')}"
                property="definition.name"
                placeholder=${ifDefined(inherited?.name ?? undefined)}
              >
              </foxy-internal-text-control>

              <foxy-internal-text-control infer="sku" class=${invalid('sku:')}>
              </foxy-internal-text-control>

              <div class="pd-price-pair" data-testid="price-pair">
                <foxy-internal-number-control
                  infer="price"
                  class=${invalid('price:')}
                  min="0"
                  property="definition.price"
                  placeholder=${ifDefined(inherited?.price?.toString() ?? undefined)}
                  .setValue=${(value: number) => this.__setDefinitionNumber('price', value)}
                >
                </foxy-internal-number-control>

                <foxy-internal-number-control
                  infer="list-price"
                  min="0"
                  property="definition.list_price"
                  placeholder=${ifDefined(inherited?.list_price?.toString() ?? undefined)}
                  .setValue=${(value: number) => this.__setDefinitionNumber('list_price', value)}
                >
                </foxy-internal-number-control>
              </div>

              <foxy-internal-number-control
                infer="weight"
                class="pd-weight"
                min="0"
                placeholder=${ifDefined(inherited?.weight?.toString() ?? undefined)}
                .getValue=${() => this.form.definition?.weight}
                .setValue=${(value: number) => this.__setDefinitionNumber('weight', value)}
              >
              </foxy-internal-number-control>
            </div>
            <p class="text-xs text-secondary">${this.t('general.basics_note')}</p>
          </foxy-internal-summary-control>

          <foxy-internal-summary-control
            infer="general"
            layout="section"
            .label=${''}
            .helperText=${''}
          >
            <div class="grid gap-xs">
              <h3 class="text-s font-medium text-secondary">${this.t('general.organization')}</h3>
              <div class="pd-org" data-testid="organization">
                <foxy-internal-resource-picker-control
                  layout="summary-item"
                  first=${ifDefined(this.__itemCategoriesHref)}
                  infer="category"
                  item="foxy-item-category-card"
                  placeholder=${ifDefined(categoryFrom?.code)}
                  .helperText=${categoryFrom
                    ? this.t(`general.category.from_${categoryFrom.from}`)
                    : ''}
                  .searchFields=${['name', 'code']}
                  .getValue=${this.__categoryGetValue}
                  .setValue=${this.__categorySetValue}
                  .getDisplayValueOptions=${this.__categoryGetDisplayValueOptions}
                >
                </foxy-internal-resource-picker-control>

                <foxy-internal-resource-picker-control
                  layout="summary-item"
                  first=${ifDefined(this.__productsHref)}
                  infer="template"
                  item="foxy-product-card"
                  .getValue=${this.__templateGetValue}
                  .setValue=${this.__templateSetValue}
                  .extendFilter=${this.__templateExtendFilter}
                  .searchFields=${['sku']}
                  .getDisplayValueOptions=${(resource: Data | null) => {
                    const name = (resource?.compiled_definition as ProductDefinition | undefined)
                      ?.name;
                    return { label: name ? `${name} (${resource?.sku})` : resource?.sku ?? '' };
                  }}
                >
                </foxy-internal-resource-picker-control>

                <foxy-internal-resource-picker-control
                  layout="summary-item"
                  first=${ifDefined(this.__collectionsHref)}
                  infer="collection"
                  property="collection_id"
                  .getValue=${this.__collectionGetValue}
                  .setValue=${this.__collectionSetValue}
                  .getDisplayValueOptions=${this.__collectionGetDisplayValueOptions}
                  .searchFields=${['name', 'path']}
                  item="foxy-product-collection-card"
                >
                </foxy-internal-resource-picker-control>

                <foxy-internal-switch-control infer="hidden" helper-text-as-tooltip>
                </foxy-internal-switch-control>
              </div>
              <p class="text-xs text-secondary">${this.t('general.organization_note')}</p>
            </div>
          </foxy-internal-summary-control>

          ${isVariant && this.__parentOptions.length
            ? html`
                <foxy-internal-summary-control infer="option-values">
                  ${this.__parentOptions.map(
                    option => html`
                      <foxy-internal-select-control
                        layout="summary-item"
                        infer="option"
                        class=${invalid(`option-values:${option.name}:`)}
                        data-option=${option.name}
                        .label=${option.label || option.name}
                        .helperText=${''}
                        .v8nPrefix=${`option-values:${option.name}:`}
                        .options=${option.values.map(v => ({
                          rawLabel: v.label || v.value,
                          value: v.value,
                        }))}
                        .getValue=${() => this.__getOptionValue(option)}
                        .setValue=${(value: string) => this.__setOptionValue(option, value)}
                      >
                      </foxy-internal-select-control>
                    `
                  )}
                </foxy-internal-summary-control>
              `
            : ''}

          <foxy-internal-product-form-description-control
            infer="description"
            property="definition.description"
            placeholder=${ifDefined(inherited?.description ?? undefined)}
          >
          </foxy-internal-product-form-description-control>

          <foxy-internal-product-form-images-control infer="images">
          </foxy-internal-product-form-images-control>
        `
      )}
      ${this.__renderSection(
        'inventory',
        this.__inventorySummary,
        html`
          ${this.variants.length
            ? html`<p class="text-s text-secondary" data-testid="inventory-variants-note">
                ${this.t('sections.inventory.variants_note')}
              </p>`
            : ''}

          <foxy-internal-summary-control infer="stock" .label=${''} .helperText=${''}>
            <foxy-internal-number-control
              layout="summary-item"
              infer=${isTemplate ? 'stock-level-template' : 'stock-level'}
              step="1"
              property="stock_level"
            >
            </foxy-internal-number-control>

            <foxy-internal-number-control
              layout="summary-item"
              infer="low-stock-threshold"
              step="1"
              min="0"
              placeholder=${String(inherited?.low_stock_threshold ?? this.lowStockThreshold)}
              .getValue=${() => this.form.definition?.low_stock_threshold ?? undefined}
              .setValue=${(value: number) =>
                this.__setDefinitionNumber('low_stock_threshold', value)}
            >
            </foxy-internal-number-control>
          </foxy-internal-summary-control>

          ${this.inventoryHref
            ? html`<a class="text-s text-primary font-medium" href=${this.inventoryHref}>
                ${this.t('sections.inventory.open_inventory')}
              </a>`
            : ''}

          <foxy-internal-async-list-control
            layout="details"
            infer="stock-rules"
            first=${ifDefined(this.data?._links['fx:product_stock_rules']?.href)}
            item="foxy-product-stock-rule-card"
            form="foxy-product-stock-rule-form"
            .formProps=${{ products: this.__productsHref }}
            alert
          >
          </foxy-internal-async-list-control>
        `
      )}
      ${isVariant || isTemplate
        ? ''
        : this.__renderSection(
            'options',
            this.__optionsSummary,
            html`
              <foxy-internal-product-form-options-control
                infer="options"
                .modifierNames=${modifierNames}
                .savedOptions=${this.__variants?.options ?? this.savedOptions}
                .variants=${this.variants}
              >
              </foxy-internal-product-form-options-control>

              ${hasVariantsSection
                ? html`
                    ${this.data?._links['fx:generate_variants'] && missing !== 0
                      ? html`
                          <foxy-internal-product-form-generate-variants-control
                            infer="generate-variants"
                            .missing=${missing}
                          >
                          </foxy-internal-product-form-generate-variants-control>
                        `
                      : ''}

                    <foxy-internal-product-form-variants-control infer="variants">
                    </foxy-internal-product-form-variants-control>

                    ${this.savedOptions.length
                      ? html`
                          <div>
                            <button
                              type="button"
                              class="pd-button pd-button-tertiary"
                              data-testid="add-variant"
                              @click=${(evt: Event) => {
                                const dialog = this.renderRoot.querySelector('#variant-dialog') as
                                  | (HTMLElement & { show: (t: HTMLElement) => void })
                                  | null;
                                dialog?.show(evt.currentTarget as HTMLElement);
                              }}
                            >
                              ${this.t('variants.add')}
                            </button>
                          </div>
                          <foxy-form-dialog
                            parent=${ifDefined(this.data?._links['fx:product_variants']?.href)}
                            infer="variant-dialog"
                            form="foxy-product-form"
                            id="variant-dialog"
                            wide
                            .props=${{
                              // The new variant's form reads this form's own text.
                              'ns': NS,
                              '.parentProduct': this.data,
                              '.itemCategories': this.itemCategories,
                            }}
                            @hide=${() => this.__reloadVariants()}
                          >
                          </foxy-form-dialog>
                        `
                      : ''}
                  `
                : ''}
            `
          )}
      ${this.__renderSection(
        'modifiers',
        modifierNames.length ? modifiers.map(m => m.label || m.name).join(', ') : '',
        html`
          <foxy-internal-product-form-modifiers-control
            infer="modifiers"
            .inherited=${this.__inheritedModifiers}
            .inheritedFrom=${parent?.product_type === 'template' ? 'template' : 'parent'}
            .optionNames=${optionNames}
          >
          </foxy-internal-product-form-modifiers-control>
        `
      )}
      ${this.__renderSection(
        'properties',
        properties.join(', '),
        html`
          <foxy-internal-array-map-control
            infer="properties"
            .label=${''}
            .helperText=${''}
            .getValue=${this.__propertiesGetValue}
            .setValue=${this.__propertiesSetValue}
          >
          </foxy-internal-array-map-control>

          <foxy-internal-async-list-control
            layout="details"
            infer="tags"
            first=${ifDefined(this.data?._links['fx:product_tags']?.href)}
            item="foxy-product-tag-card"
            form="foxy-product-tag-form"
            alert
          >
          </foxy-internal-async-list-control>
        `
      )}
      ${this.__cartHost &&
      this.data &&
      !isTemplate &&
      !this.hiddenSelector.matches('storefront', true)
        ? this.__renderSection(
            'storefront',
            '',
            html`
              <foxy-internal-product-form-storefront-control
                infer="storefront"
                host=${this.__cartHost}
                script=${ifDefined(this.storefrontScript ?? undefined)}
                look-href=${ifDefined(this.storefrontElementsHref ?? undefined)}
                .product=${this.data}
                .variants=${this.variants}
                .modifiers=${this.__savedModifiers}
              >
              </foxy-internal-product-form-storefront-control>
            `
          )
        : ''}

      <foxy-internal-async-list-control
        layout="details"
        infer="template-products"
        first=${ifDefined(this.__templateProductsHref)}
        item="foxy-product-card"
        wide
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()} ${this.__renderVariantPanel()} ${this.__renderDeleteConfirmation()}
    `;
  }

  /** The active variants of this product. */
  get variants(): Data[] {
    return this.__variants?.list ?? [];
  }

  /** The options as last saved, which the variants were made from. */
  get savedOptions(): ProductOption[] {
    return this.data?.compiled_definition?.options ?? this.data?.definition?.options ?? [];
  }

  /**
   * The variants a save will delete: those using an option or a value that
   * the edited options no longer have, and those marked for deletion.
   */
  get variantsToDelete(): Data[] {
    const byOptions = this.__variantsToDeleteBy(this.form);
    const marked = this.variants.filter(
      variant => this.variantEdits[variant._links.self.href]?.delete && !byOptions.includes(variant)
    );
    return [...byOptions, ...marked];
  }

  /** Whether the product or any of its variants has changes that aren't saved. */
  get hasChanges(): boolean {
    return (
      // The form's first update is sent while it is still being constructed.
      Object.keys(this.variantEdits ?? {}).length > 0 ||
      this.in({ idle: { snapshot: 'dirty' } }) ||
      this.in({ idle: { template: 'dirty' } })
    );
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    this.__showOrLeave('variant-panel');
    this.__showOrLeave('delete-confirmation');
  }

  /**
   * A dialog is in the page only while it is open. Shown as a modal, the
   * browser moves focus into it, keeps it there and closes it on Escape; what
   * had focus before gets it back when the dialog is gone.
   */
  private __showOrLeave(testid: string) {
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>(
      `dialog[data-testid="${testid}"]`
    );

    if (dialog && !dialog.open) {
      let opener = document.activeElement;
      while (opener?.shadowRoot?.activeElement) opener = opener.shadowRoot.activeElement;
      this.__openers.set(testid, opener instanceof HTMLElement ? opener : null);
      dialog.showModal();
    } else if (!dialog && this.__openers.has(testid)) {
      const opener = this.__openers.get(testid);
      this.__openers.delete(testid);
      if (opener?.isConnected) opener.focus();
    }
  }

  /** Drops every unsaved change, the variants' included. */
  discard(): void {
    this.variantEdits = {};
    this.variantError = '';
    this.__deleteConfirmed = '';
    this.__panel = null;
    this.undo();
    this.dispatchEvent(new CustomEvent('update'));
  }

  /** Changes a variant's unsaved values. A value equal to the saved one is no change. */
  editVariant(href: string, changes: VariantEdit): void {
    const variant = this.variants.find(v => v._links.self.href === href);
    if (!variant) return;

    const definition = variant.definition ?? {};
    const saved: Record<string, unknown> = {
      sku: variant.sku,
      price: String(definition.price ?? ''),
      stock: String(variant.stock_level ?? ''),
      weight: String(definition.weight ?? ''),
      name: definition.name ?? '',
      description: definition.description ?? '',
      images: definition.images ?? [],
    };
    const edit = { ...this.variantEdits[href], ...changes } as Record<string, unknown>;
    for (const key of Object.keys(edit)) {
      const unchanged = JSON.stringify(edit[key]) === JSON.stringify(saved[key]);
      if (edit[key] === undefined || edit[key] === false || unchanged) delete edit[key];
    }

    const edits = { ...this.variantEdits };
    if (Object.keys(edit).length) edits[href] = edit as VariantEdit;
    else delete edits[href];

    this.variantEdits = edits;
    this.variantError = '';
    this.dispatchEvent(new CustomEvent('update'));
  }

  /** Which of a variant's unsaved values can't be saved as they are. */
  variantEditErrors(variant: Data): Partial<Record<'sku' | 'price' | 'stock' | 'weight', true>> {
    const edit = this.variantEdits[variant._links.self.href];
    const errors: Partial<Record<'sku' | 'price' | 'stock' | 'weight', true>> = {};
    if (!edit || edit.delete) return errors;
    if (edit.sku !== undefined && (!edit.sku.trim() || edit.sku.trim().length > 255)) {
      errors.sku = true;
    }
    if (edit.price !== undefined && !isAmount(edit.price)) errors.price = true;
    if (edit.weight !== undefined && !isAmount(edit.weight)) errors.weight = true;
    if (edit.stock !== undefined && !isCount(edit.stock)) errors.stock = true;
    return errors;
  }

  /** Opens the side panel with the rest of a variant's values. */
  openVariantPanel(href: string): void {
    this.__panel = { href, before: this.variantEdits[href] };
  }

  /**
   * Saves the variants' changes, then the product's. When that would delete
   * variants, asks first, and saves once the merchant agrees.
   */
  submit(reportValidity = true): void {
    this.__saveAttempted = true;
    if (this.errors.some(error => /^(name|sku|price|option-values):/.test(error))) {
      this.__open = { ...this.__open, general: true };
    }

    const skus = this.variantsToDelete.map(variant => variant.sku).join(' ');
    if (skus && this.__deleteConfirmed !== skus) {
      this.__confirming = true;
      return;
    }

    if (!Object.keys(this.variantEdits).length) return super.submit(reportValidity);

    if (this.variants.some(variant => Object.keys(this.variantEditErrors(variant)).length)) {
      this.variantError = this.t('variants.v8n_invalid');
      this.__open = { ...this.__open, options: true };
      return;
    }

    const isDirty =
      this.in({ idle: { snapshot: 'dirty' } }) || this.in({ idle: { template: 'dirty' } });
    this.__saveVariantEdits().then(saved => {
      if (saved && isDirty) super.submit(reportValidity);
    });
  }

  private async __saveVariantEdits(): Promise<boolean> {
    const byOptions = this.__variantsToDeleteBy(this.form);
    const edits = { ...this.variantEdits };
    let failed = '';
    let deleted = false;

    for (const [href, edit] of Object.entries(this.variantEdits)) {
      const variant = this.variants.find(v => v._links.self.href === href);
      // The API deletes a variant that uses a removed value when the product is saved.
      if (!variant || byOptions.includes(variant)) {
        delete edits[href];
        continue;
      }

      try {
        if (edit.delete) {
          const response = await new ProductForm.API(this).fetch(href, { method: 'DELETE' });
          if (!response.ok) throw response;
          deleted = true;
        } else {
          const body: Record<string, unknown> = {};
          if (edit.sku !== undefined) body.sku = edit.sku.trim();
          if (edit.stock !== undefined) {
            body.stock_level = edit.stock.trim() === '' ? null : Number(edit.stock);
          }
          const { price, weight, name, description, images } = edit;
          if ([price, weight, name, description, images].some(value => value !== undefined)) {
            // A definition is replaced whole, so an emptied value is left out of it.
            const definition = { ...variant.definition } as Record<string, unknown>;
            const put = (key: string, value: unknown, empty: boolean) => {
              if (empty) delete definition[key];
              else definition[key] = value;
            };
            if (price !== undefined) put('price', price.trim(), !price.trim());
            if (weight !== undefined) put('weight', Number(weight), !weight.trim());
            if (name !== undefined) put('name', name.trim(), !name.trim());
            if (description !== undefined) put('description', description, !description.trim());
            if (images !== undefined) put('images', images, !images.length);
            body.definition = definition;
          }
          await this._fetch(href, { method: 'PATCH', body: JSON.stringify(body) });
        }
        delete edits[href];
      } catch (err) {
        const message = await apiMessage(err);
        failed = this.t('variants.save_failed', { sku: variant.sku }) + (message && ` ${message}`);
        break;
      }
    }

    this.variantEdits = edits;
    this.variantError = failed;
    if (this.data) this.__variants = await this.__loadVariants(this.data);
    if (!this.variantsToDelete.length) this.__deleteConfirmed = '';
    // The parent's variant count, and whether it is still a parent, follow its variants.
    if (deleted && !failed && this.in({ idle: { snapshot: 'clean' } })) this.refresh();
    this.dispatchEvent(new CustomEvent('update'));
    return !failed;
  }

  private async __reloadVariants() {
    if (this.data) this.__variants = await this.__loadVariants(this.data);
  }

  // An emptied field is left out, so the product inherits it again.
  private __setDefinitionNumber(
    key: 'price' | 'list_price' | 'weight' | 'low_stock_threshold',
    value: number
  ) {
    const definition = { ...(this.form.definition as ProductDefinition | undefined) };
    if (Number.isFinite(value)) definition[key] = value;
    else delete definition[key];
    this.edit({ definition });
  }

  private __renderSection(key: SectionKey, summary: string, body: TemplateResult) {
    const open = this.__open[key] ?? OPEN_BY_DEFAULT.includes(key);
    return html`
      <section class="pd-section" data-testid="section-${key}">
        <h2>
          <button
            type="button"
            class="pd-section-button"
            aria-expanded=${open ? 'true' : 'false'}
            aria-controls="section-${key}"
            @click=${() => (this.__open = { ...this.__open, [key]: !open })}
          >
            <svg
              class="pd-chevron"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M6 3l5 5-5 5"></path>
            </svg>
            <span class="pd-section-heading">
              <span class="pd-section-title-row">
                <span class="pd-section-title">${this.t(`sections.${key}.title`)}</span>
                <span class="pd-section-summary" data-testid="section-summary">
                  ${open && key !== 'inventory' ? '' : summary}
                </span>
              </span>
              <span class="pd-section-description"> ${this.t(`sections.${key}.description`)} </span>
            </span>
          </button>
        </h2>
        <div id="section-${key}" class="pd-section-body ${open ? '' : 'pd-closed'}">${body}</div>
      </section>
    `;
  }

  private get __generalSummary(): string {
    const price = this.form.definition?.price ?? this.__inherited?.price;
    return [
      this.form.sku,
      price === undefined || price === null || price === '' ? '' : String(price),
      this.form.product_type === 'template'
        ? ''
        : this.t(this.form.hidden ? 'sections.general.hidden' : 'sections.general.listed'),
    ]
      .filter(Boolean)
      .join(' · ');
  }

  private get __inventorySummary(): string {
    const data = this.data;
    if (!data || data.product_type === 'template' || data.product_type === 'variant') {
      const level = this.form.stock_level;
      const isTemplate = this.form.product_type === 'template';
      if (level === null || level === undefined) {
        return isTemplate ? '' : this.t('sections.inventory.untracked');
      }
      return this.t(`sections.inventory.${isTemplate ? 'starting_stock' : 'in_stock'}`, {
        count: level,
      });
    }

    const group = groupProducts([data, ...this.variants])[0];
    const stock = group && stockSummary(group, this.lowStockThreshold);
    if (!stock || stock.state === 'untracked') return this.t('sections.inventory.untracked');
    return [
      this.t('sections.inventory.tracked'),
      this.t('sections.inventory.in_stock', { count: stock.units }),
      stock.out ? this.t('sections.inventory.out', { count: stock.out }) : '',
      stock.low ? this.t('sections.inventory.low', { count: stock.low }) : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  private get __optionsSummary(): string {
    const options = this.form.definition?.options ?? [];
    return [
      options.map(option => option.label || option.name).join(', '),
      this.variants.length
        ? this.t('sections.options.variant_count', { count: this.variants.length })
        : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  /** How many combinations of the saved options have no variant, or `null` without options. */
  private get __missingCombinations(): number | null {
    const options = this.savedOptions;
    if (!options.length) return null;
    const total = options.reduce((count, option) => count * option.values.length, 1);
    const key = (values: Record<string, string> | null | undefined) =>
      options.map(option => values?.[option.name]?.toLowerCase() ?? '').join('\u0000');
    const taken = new Set(this.variants.map(variant => key(variant.option_values)));
    return Math.max(0, total - taken.size);
  }

  private get __savedModifiers(): ProductModifier[] {
    const data = this.data;
    if (!data) return [];
    return (data.compiled_definition?.modifiers?.filter(m => !isRemoval(m)) ??
      mergeModifiers(
        this.__inheritedModifiers,
        data.definition?.modifiers ?? []
      )) as ProductModifier[];
  }

  private __renderVariantPanel(): TemplateResult | string {
    const panel = this.__panel;
    const variant = panel && this.variants.find(v => v._links.self.href === panel.href);
    if (!panel || !variant) return '';

    const href = panel.href;
    const edit = this.variantEdits[href] ?? {};
    const errors = this.variantEditErrors(variant);
    const inherited = this.data?.compiled_definition;
    const own = variant.definition ?? {};
    const page = this.getProductPageHref?.(href);
    const name = inherited?.name || this.data?.sku || '';
    const close = () => (this.__panel = null);
    const field = (
      key: 'sku' | 'price' | 'stock' | 'weight' | 'name',
      value: string,
      placeholder: string
    ) => html`
      <div class="pd-field">
        <label for="variant-${key}">${this.t(`variants.panel_${key}`)}</label>
        <input
          id="variant-${key}"
          data-testid="panel-${key}"
          class=${key === 'sku' ? 'pd-mono' : ''}
          inputmode=${key === 'stock'
            ? 'numeric'
            : key === 'price' || key === 'weight'
            ? 'decimal'
            : 'text'}
          aria-invalid=${key !== 'name' && errors[key] ? 'true' : 'false'}
          placeholder=${placeholder}
          .value=${edit[key] ?? value}
          @input=${(evt: Event) =>
            this.editVariant(href, { [key]: (evt.currentTarget as HTMLInputElement).value })}
        />
        ${key !== 'name' && errors[key]
          ? html`<span class="text-xs text-error">${this.t(`variants.v8n_${key}`)}</span>`
          : key === 'price' || key === 'name'
          ? html`<span class="text-xs text-secondary"
              >${this.t(`variants.panel_${key}_help`)}</span
            >`
          : ''}
      </div>
    `;

    return html`
      <dialog
        class="pd-overlay pd-overlay-side"
        data-testid="variant-panel"
        aria-labelledby="variant-panel-title"
        @click=${(evt: Event) => evt.target === evt.currentTarget && close()}
        @cancel=${close}
      >
        <aside>
          <div class="pd-panel-header">
            <div class="grid gap-xs" style="flex-grow: 1">
              <p class="text-xs font-semibold text-secondary uppercase tracking-wide">
                ${this.t('variants.panel_eyebrow', { name })}
              </p>
              <h2 id="variant-panel-title" class="pd-mono text-l font-semibold">
                ${edit.sku ?? variant.sku}
              </h2>
            </div>
            <button
              type="button"
              class="pd-icon-button"
              data-testid="panel-close"
              aria-label=${this.t('variants.panel_close')}
              @click=${close}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M4 4l8 8M12 4l-8 8"></path>
              </svg>
            </button>
          </div>

          <div class="pd-panel-body">
            <dl class="pd-option-values" data-testid="panel-option-values">
              ${this.savedOptions.map(option => {
                const stored = variant.option_values?.[option.name];
                const value = option.values.find(
                  v => v.value.toLowerCase() === stored?.toLowerCase()
                );
                return html`
                  <div>
                    <dt>${option.label || option.name}</dt>
                    <dd>${value?.label || value?.value || stored || '—'}</dd>
                  </div>
                `;
              })}
            </dl>
            ${field('name', own.name ?? '', inherited?.name ?? '')}
            <foxy-internal-product-form-images-control
              infer="images"
              data-testid="panel-images"
              .getImages=${() => edit.images ?? own.images ?? []}
              .setImages=${(images: ProductDefinitionImage[]) => this.editVariant(href, { images })}
            >
            </foxy-internal-product-form-images-control>
            <foxy-internal-product-form-description-control
              infer="description"
              data-testid="panel-description"
              placeholder=${inherited?.description ?? ''}
              .helperText=${this.t('variants.panel_description_help')}
              .getValue=${() => edit.description ?? own.description ?? ''}
              .setValue=${(description: string) => this.editVariant(href, { description })}
            >
            </foxy-internal-product-form-description-control>
            ${field('sku', variant.sku, '')}
            ${field(
              'price',
              String(variant.definition?.price ?? ''),
              inherited?.price !== undefined && inherited?.price !== null
                ? this.t('variants.price_inherited', { price: inherited.price })
                : ''
            )}
            <div class="grid grid-cols-2 gap-s">
              ${field(
                'stock',
                String(variant.stock_level ?? ''),
                this.t('variants.stock_untracked')
              )}
              ${field(
                'weight',
                String(variant.definition?.weight ?? ''),
                inherited?.weight !== undefined
                  ? this.t('variants.weight_inherited', { weight: inherited.weight })
                  : ''
              )}
            </div>
            ${page
              ? html`<a
                  class="text-s text-primary font-medium"
                  href=${page}
                  data-testid="panel-page"
                >
                  ${this.t('variants.panel_open_page')}
                </a>`
              : ''}
          </div>

          <div class="pd-panel-footer">
            <button
              type="button"
              class="pd-button pd-button-danger-text"
              data-testid="panel-delete"
              @click=${() => {
                this.editVariant(href, { delete: true });
                close();
              }}
            >
              ${this.t('variants.panel_delete')}
            </button>
            <span style="flex-grow: 1"></span>
            <button
              type="button"
              class="pd-button pd-button-secondary"
              data-testid="panel-cancel"
              @click=${() => {
                const edits = { ...this.variantEdits };
                if (panel.before) edits[href] = panel.before;
                else delete edits[href];
                this.variantEdits = edits;
                this.dispatchEvent(new CustomEvent('update'));
                close();
              }}
            >
              ${this.t('variants.panel_cancel')}
            </button>
            <button
              type="button"
              class="pd-button pd-button-primary"
              data-testid="panel-done"
              @click=${close}
            >
              ${this.t('variants.panel_done')}
            </button>
          </div>
        </aside>
      </dialog>
    `;
  }

  private __renderDeleteConfirmation(): TemplateResult | string {
    if (!this.__confirming) return '';
    const deleting = this.variantsToDelete;
    const count = deleting.length;
    const cancel = () => (this.__confirming = false);

    return html`
      <dialog
        class="pd-overlay"
        role="alertdialog"
        data-testid="delete-confirmation"
        aria-labelledby="delete-confirmation-title"
        @cancel=${cancel}
      >
        <div class="pd-dialog">
          <h2 id="delete-confirmation-title" class="text-l font-semibold">
            ${this.t('variants.confirm_title', { count })}
          </h2>
          <p class="text-s">${this.t('variants.confirm_message')}</p>
          <ul class="pd-delete-list">
            ${deleting.map(
              variant => html`
                <li data-testid="deleting">
                  <span class="pd-mono">${variant.sku}</span> ·
                  ${variant.stock_level === null || variant.stock_level === undefined
                    ? this.t('variants.confirm_untracked')
                    : variant.stock_level === 0
                    ? this.t('variants.confirm_no_stock')
                    : this.t('variants.confirm_in_stock', { count: variant.stock_level })}
                </li>
              `
            )}
          </ul>
          <div class="flex justify-end" style="gap: 0.5rem; padding-top: 0.25rem">
            <button
              type="button"
              class="pd-button pd-button-secondary"
              data-testid="delete-cancel"
              autofocus
              @click=${cancel}
            >
              ${this.t('variants.confirm_cancel')}
            </button>
            <button
              type="button"
              class="pd-button pd-button-danger"
              data-testid="delete-confirm"
              @click=${() => {
                this.__deleteConfirmed = deleting.map(variant => variant.sku).join(' ');
                this.__confirming = false;
                // Validation reads the agreement, and only runs on an edit.
                this.edit({});
                this.submit();
              }}
            >
              ${this.t('variants.confirm_button', { count })}
            </button>
          </div>
        </div>
      </dialog>
    `;
  }

  /**
   * Uploads an image for this product and returns its permanent URL. Needs the
   * `fx:create_upload_url` link, which the admin backend adds to a saved
   * product. Rejects with `ImageTooLargeError` for a file over the size limit.
   */
  async uploadImage(file: File): Promise<string> {
    const createUploadUrl = this.data?._links['fx:create_upload_url']?.href;
    if (!createUploadUrl) throw new Error('This product has no fx:create_upload_url link.');
    if (file.size > MAX_IMAGE_BYTES) throw new ImageTooLargeError();

    type Upload = {
      upload_url: string;
      upload_fields: Record<string, string>;
      max_bytes?: number;
      image_url: string;
    };

    let upload: Upload;
    try {
      upload = await this._fetch<Upload>(createUploadUrl, {
        method: 'POST',
        body: JSON.stringify({ type: file.type, size: file.size }),
      });
    } catch (err) {
      throw err instanceof Response && err.status === 413 ? new ImageTooLargeError() : err;
    }

    if (typeof upload.max_bytes === 'number' && file.size > upload.max_bytes) {
      throw new ImageTooLargeError();
    }

    // A signed form for storage: plain fetch, since API credentials mustn't go there.
    // Storage reads the fields in order and takes none after the file.
    const body = new FormData();
    for (const [name, value] of Object.entries(upload.upload_fields)) body.append(name, value);
    body.append('file', file);
    const response = await fetch(upload.upload_url, { method: 'POST', body });
    if (!response.ok) throw new Error(`Image upload failed with ${response.status}.`);

    return upload.image_url;
  }

  /**
   * Creates a variant for every combination of the saved options that has
   * none yet, through `fx:generate_variants`, and reloads the variants.
   * Resolves with how many were created; rejects with the API's message.
   *
   * @param skuPattern Such as `{parent}-{size}-{color}`. The API's default without it.
   */
  async generateVariants(skuPattern?: string): Promise<number> {
    const href = this.data?._links['fx:generate_variants']?.href;
    if (!href) throw new Error('This product has no fx:generate_variants link.');

    let result: { _embedded?: { 'fx:products'?: Data[] } };
    try {
      result = await this._fetch(href, {
        method: 'POST',
        body: JSON.stringify(skuPattern ? { sku_pattern: skuPattern } : {}),
      });
    } catch (err) {
      let message = '';
      if (err instanceof Response) {
        const body = await err.json().catch(() => null);
        message = body?._embedded?.['fx:errors']?.[0]?.message ?? '';
      }
      throw new Error(message);
    }

    // A standalone becomes a parent, and its variant count changes.
    this.refresh();

    this.generatedCount = result._embedded?.['fx:products']?.length ?? 0;
    return this.generatedCount;
  }

  // Validation runs inside the state machine, so this reads only the form it's given and fields.
  private __variantsToDeleteBy(form: Partial<Data>): Data[] {
    const saved = this.__variants?.options ?? [];
    const edited = form.definition?.options ?? [];
    if (!this.__variants?.list.length || !saved.length) return [];

    return this.__variants.list.filter(variant =>
      saved.some(option => {
        const value = variant.option_values?.[option.name]?.toLowerCase();
        if (value === undefined) return false;
        const kept = edited.find(o => o.name === option.name);
        return !kept?.values.some(v => v.value.toLowerCase() === value);
      })
    );
  }

  /** The parent's or template's name and SKU, or the SKU alone if it has no name. */
  private get __parentLabel(): string {
    const parent = this.parentProduct;
    const name = (parent?.compiled_definition as ProductDefinition | undefined)?.name;
    return name ? `${name} (${parent?.sku})` : parent?.sku ?? '';
  }

  // The store's products collection. A product's own href is /products/{id}.
  private get __productsHref(): string | undefined {
    if (this.parent) return this.parent;
    const store = this.data?._links['fx:store']?.href;
    return store ? `${store}/products` : undefined;
  }

  private get __templateProductsHref(): string | undefined {
    const products = this.__productsHref;
    if (!products || !this.data || this.data.product_type !== 'template') return;
    const url = new URL(products);
    url.searchParams.set('inherit_from_id', String(getResourceId(this.data._links.self.href)));
    return url.toString();
  }

  private get __cartHost(): string | undefined {
    const store = this.__store;
    if (!store) return;
    const host = store.use_remote_domain
      ? store.store_domain
      : this.defaultDomain && `${store.store_domain}.${this.defaultDomain}`;
    return host || undefined;
  }

  /** A variant, saved or new, of a parent rather than a product using a template. */
  private get __isVariant(): boolean {
    return this.__isVariantForm(this.form);
  }

  private __isVariantForm(form: Partial<Data>): boolean {
    if (form.product_type) return form.product_type === 'variant';
    const parentType = this.parentProduct?.product_type;
    return !!parentType && parentType !== 'template';
  }

  /** The options a variant picks its values from, which are its parent's. */
  private get __parentOptions(): ProductOption[] {
    const parent = this.parentProduct;
    return parent?.compiled_definition?.options ?? parent?.definition?.options ?? [];
  }

  /** The compiled modifiers of the product this one inherits from. */
  private get __inheritedModifiers(): ProductModifier[] {
    const parent = this.parentProduct;
    if (!parent) return [];
    const compiled = parent.compiled_definition?.modifiers;
    const modifiers = compiled ?? parent.definition?.modifiers ?? [];
    return modifiers.filter(m => !isRemoval(m)) as ProductModifier[];
  }

  // Stored as declared on the parent; matched case-insensitively.
  private __getOptionValue(option: ProductOption): string | undefined {
    const stored = this.form.option_values?.[option.name]?.toLowerCase();
    return option.values.find(v => v.value.toLowerCase() === stored)?.value;
  }

  private __setOptionValue(option: ProductOption, value: string) {
    const values: Record<string, string> = {};
    for (const { name } of this.__parentOptions) {
      const current = name === option.name ? value : this.form.option_values?.[name];
      if (current) values[name] = current;
    }
    this.edit({ option_values: values });
  }

  /** Field placeholders show what an empty field inherits. */
  private get __inherited(): ProductDefinition | undefined {
    return this.parentProduct?.compiled_definition as ProductDefinition | undefined;
  }

  /**
   * The category a product without one of its own takes, and where from. A category
   * compiled in that neither the product nor what it inherits from sets comes from its
   * collection.
   */
  private get __inheritedCategory(): { code: string; from: string } | null {
    if (this.form.definition?.category_code) return null;
    const fromParent = this.__inherited?.category_code;
    if (fromParent) {
      const from = this.parentProduct?.product_type === 'template' ? 'template' : 'parent';
      return { code: fromParent, from };
    }
    const compiled = this.data?.compiled_definition?.category_code;
    if (compiled && !this.data?.definition?.category_code) {
      return { code: compiled, from: 'collection' };
    }
    return null;
  }

  protected async _sendGet(): Promise<Data> {
    const product = await super._sendGet();

    // super._fetch, so the requests go through NucleonElement's fetch event and
    // the demo router can answer them. Both are best-effort: without them the
    // form only loses placeholders or the add-to-cart link.
    const parentHref = product?._links?.['fx:parent_product']?.href;
    const storeHref = product?._links?.['fx:store']?.href;
    const collectionsHref = this.__collectionsHref;
    const [parent, store, collections] = await Promise.all([
      parentHref ? super._fetch<Data>(parentHref).catch(() => null) : null,
      storeHref && ['standalone', 'variant', 'parent'].includes(product.product_type)
        ? super._fetch<Resource<Rels.Store>>(storeHref).catch(() => null)
        : null,
      collectionsHref
        ? loadAll<ListedCollection>(collectionsHref, 'fx:product_collections', url =>
            super._fetch(url)
          ).catch(() => [])
        : [],
    ]);

    this.parentProduct = parent;
    this.__store = store;
    this.__collectionTrails = new Map(collectionTree(collections).map(c => [c.path, c.trail]));
    this.__variants = await this.__loadVariants(product);

    return product;
  }

  protected async _sendPatch(edits: Partial<Data>): Promise<Data> {
    const product = await super._sendPatch(edits);
    // Removing an option value deletes the variants that use it.
    if (edits.definition) {
      this.__variants = await this.__loadVariants(product);
      this.__deleteConfirmed = '';
    }
    return product;
  }

  /** Every active variant of a product with options, to tell which ones a change deletes. */
  private async __loadVariants(
    product: Data
  ): Promise<{ options: ProductOption[]; list: Data[] } | null> {
    const href = product?._links?.['fx:product_variants']?.href;
    const options = product?.definition?.options ?? [];
    const type = product?.product_type;
    if (!href || type === 'variant' || type === 'template') return null;
    if (!options.length && !product.variant_count) return null;

    try {
      return { options, list: await loadAllProducts(href, url => super._fetch(url)) };
    } catch {
      return null;
    }
  }
}
