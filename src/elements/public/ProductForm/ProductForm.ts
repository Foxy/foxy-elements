import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { BooleanSelector, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data, ProductDefinition, ProductModifier, ProductOption } from './types';

import { getResourceId } from '@foxy.io/sdk/core';
import { isRemoval, mergeModifiers, validateModifiers, validateOptions } from './catalog';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';
import { DEFAULT_LOW_STOCK_THRESHOLD, groupProducts, stockSummary } from '../ProductList/listing';
import { sectionStyles } from './internal/styles';

const NS = 'product-form';
const Base = TranslatableMixin(InternalForm, NS);

/** Unsaved changes to one variant, as typed. `delete` marks it for deletion on save. */
export interface VariantEdit {
  sku?: string;
  price?: string;
  stock?: string;
  weight?: string;
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
 * @since 1.54.0
 */
export class ProductForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      productCollections: { attribute: 'product-collections' },
      defaultDomain: { attribute: 'default-domain' },
      storefrontElementsHref: { attribute: 'storefront-elements-href' },
      getProductPageHref: { attribute: false },
      lowStockThreshold: { type: Number, attribute: 'low-stock-threshold' },
      storefrontScript: { attribute: 'storefront-script' },
      inventoryHref: { attribute: 'inventory-href' },
      parentProduct: { attribute: false },
      variantEdits: { attribute: false },
      variantError: { attribute: false },
      generatedCount: { attribute: false },
      __deleteConfirmed: { attribute: false },
      __confirming: { attribute: false },
      __variants: { attribute: false },
      __panel: { attribute: false },
      __open: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [...super.styles, sectionStyles];
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ sku }) => !!sku || 'sku:v8n_required',
      ({ sku }) => !sku || sku.length <= 255 || 'sku:v8n_too_long',
      ({ definition }) =>
        !!(definition as ProductDefinition | undefined)?.name || 'name:v8n_required',
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

  /** Host domain for stores without a custom domain, such as `foxycart.com`, for the add-to-cart link. */
  defaultDomain: string | null = null;

  /**
   * The product this one inherits from: its parent, or its template. Loaded
   * with the product; set it for a new variant, which has nothing to load yet.
   */
  parentProduct: Data | null = null;

  /** Returns the URL of a product's page for its `self` link, for the link to a variant's own page. */
  getProductPageHref: ((href: string) => string) | null = null;

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

  private readonly __collectionSetValue = (href: string) => {
    const id = getResourceId(href);
    this.edit({ collection_id: typeof id === 'number' ? id : null });
  };

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
          <foxy-internal-product-form-images-control infer="images">
          </foxy-internal-product-form-images-control>

          <foxy-internal-summary-control infer="general" .label=${''} .helperText=${''}>
            <foxy-internal-radio-group-control
              layout="summary-item"
              infer="kind"
              .options=${this.__kindOptions}
              .getValue=${this.__kindGetValue}
              .setValue=${this.__kindSetValue}
            >
            </foxy-internal-radio-group-control>

            <foxy-internal-text-control
              layout="summary-item"
              infer="name"
              property="definition.name"
              placeholder=${ifDefined(inherited?.name ?? undefined)}
            >
            </foxy-internal-text-control>

            <foxy-internal-text-control layout="summary-item" infer="sku">
            </foxy-internal-text-control>

            <foxy-internal-number-control
              layout="summary-item"
              infer="price"
              min="0"
              property="definition.price"
              placeholder=${ifDefined(inherited?.price?.toString() ?? undefined)}
            >
            </foxy-internal-number-control>

            <foxy-internal-number-control
              layout="summary-item"
              infer="list-price"
              min="0"
              property="definition.list_price"
              placeholder=${ifDefined(inherited?.list_price?.toString() ?? undefined)}
            >
            </foxy-internal-number-control>

            <foxy-internal-number-control
              layout="summary-item"
              infer="weight"
              min="0"
              placeholder=${ifDefined(inherited?.weight?.toString() ?? undefined)}
              .getValue=${() => this.form.definition?.weight}
              .setValue=${(value: number) => this.__setDefinitionNumber('weight', value)}
            >
            </foxy-internal-number-control>

            <foxy-internal-resource-picker-control
              layout="summary-item"
              first=${ifDefined(this.__productsHref)}
              infer="template"
              item="foxy-product-card"
              .getValue=${this.__templateGetValue}
              .setValue=${this.__templateSetValue}
              .extendFilter=${this.__templateExtendFilter}
              .getDisplayValueOptions=${(resource: Data | null) => {
                const name = (resource?.compiled_definition as ProductDefinition | undefined)?.name;
                return { label: name ? `${name} (${resource?.sku})` : resource?.sku ?? '' };
              }}
            >
            </foxy-internal-resource-picker-control>

            <foxy-internal-resource-picker-control
              layout="summary-item"
              first=${ifDefined(this.productCollections ?? undefined)}
              infer="collection"
              property="collection_id"
              .getValue=${this.__collectionGetValue}
              .setValue=${this.__collectionSetValue}
              item="foxy-product-collection-card"
            >
            </foxy-internal-resource-picker-control>

            <foxy-internal-switch-control infer="hidden"></foxy-internal-switch-control>
          </foxy-internal-summary-control>

          ${isVariant && this.__parentOptions.length
            ? html`
                <foxy-internal-summary-control infer="option-values">
                  ${this.__parentOptions.map(
                    option => html`
                      <foxy-internal-select-control
                        layout="summary-item"
                        infer="option"
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
                            .props=${{ '.parentProduct': this.data }}
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
      ${this.__cartHost && this.data && !isTemplate
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

    const saved: Record<string, string> = {
      sku: variant.sku,
      price: String(variant.definition?.price ?? ''),
      stock: String(variant.stock_level ?? ''),
      weight: String(variant.definition?.weight ?? ''),
    };
    const edit = { ...this.variantEdits[href], ...changes } as Record<string, unknown>;
    for (const key of Object.keys(edit)) {
      if (edit[key] === undefined || edit[key] === false || edit[key] === saved[key]) {
        delete edit[key];
      }
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
          if (edit.price !== undefined || edit.weight !== undefined) {
            // A definition is replaced whole, so an emptied value is left out of it.
            const definition = { ...variant.definition } as Record<string, unknown>;
            if (edit.price !== undefined) {
              if (edit.price.trim() === '') delete definition.price;
              else definition.price = edit.price.trim();
            }
            if (edit.weight !== undefined) {
              if (edit.weight.trim() === '') delete definition.weight;
              else definition.weight = Number(edit.weight);
            }
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

  private __setDefinitionNumber(key: 'weight' | 'low_stock_threshold', value: number) {
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
      return level === null || level === undefined
        ? this.t('sections.inventory.untracked')
        : this.t('sections.inventory.in_stock', { count: level });
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
    const page = this.getProductPageHref?.(href);
    const image = variant.definition?.images?.[0];
    const name = inherited?.name || this.data?.sku || '';
    const close = () => (this.__panel = null);
    const field = (
      key: 'sku' | 'price' | 'stock' | 'weight',
      value: string,
      placeholder: string
    ) => html`
      <div class="pd-field">
        <label for="variant-${key}">${this.t(`variants.panel_${key}`)}</label>
        <input
          id="variant-${key}"
          data-testid="panel-${key}"
          class=${key === 'sku' ? 'pd-mono' : ''}
          inputmode=${key === 'sku' ? 'text' : key === 'stock' ? 'numeric' : 'decimal'}
          aria-invalid=${errors[key] ? 'true' : 'false'}
          placeholder=${placeholder}
          .value=${edit[key] ?? value}
          @input=${(evt: Event) =>
            this.editVariant(href, { [key]: (evt.currentTarget as HTMLInputElement).value })}
        />
        ${errors[key]
          ? html`<span class="text-xs text-error">${this.t(`variants.v8n_${key}`)}</span>`
          : key === 'price'
          ? html`<span class="text-xs text-secondary">${this.t('variants.panel_price_help')}</span>`
          : ''}
      </div>
    `;

    return html`
      <div
        class="pd-overlay pd-overlay-side"
        data-testid="variant-panel"
        @click=${(evt: Event) => evt.target === evt.currentTarget && close()}
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Escape' && close()}
      >
        <aside role="dialog" aria-modal="true" aria-labelledby="variant-panel-title">
          <div class="pd-panel-header">
            <div class="grid gap-xs" style="flex-grow: 1">
              <p class="text-xs font-semibold text-secondary uppercase tracking-wide">
                ${this.t('variants.panel_eyebrow', { name })}
              </p>
              <h2 id="variant-panel-title" class="pd-mono text-l font-semibold">
                ${edit.sku ?? variant.sku}
              </h2>
              <div class="flex flex-wrap" style="gap: 0.375rem">
                ${this.savedOptions.map(option => {
                  const value = variant.option_values?.[option.name];
                  return value
                    ? html`<span class="pd-chip">${option.label || option.name}: ${value}</span>`
                    : '';
                })}
              </div>
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
            <div class="flex items-center" style="gap: 0.75rem">
              <img
                class="pd-thumb"
                style="width: 4rem; height: 4rem"
                src=${image?.src ?? inherited?.images?.[0]?.src ?? ''}
                alt=""
              />
              <div class="grid gap-xs text-s">
                <span class="text-secondary">
                  ${this.t(image ? 'variants.panel_own_image' : 'variants.panel_product_image')}
                </span>
                ${page
                  ? html`<a class="text-primary font-medium" href=${page} data-testid="panel-page">
                      ${this.t('variants.panel_open_page')}
                    </a>`
                  : ''}
              </div>
            </div>
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
      </div>
    `;
  }

  private __renderDeleteConfirmation(): TemplateResult | string {
    if (!this.__confirming) return '';
    const deleting = this.variantsToDelete;
    const count = deleting.length;
    const cancel = () => (this.__confirming = false);

    return html`
      <div class="pd-overlay" data-testid="delete-confirmation">
        <div
          class="pd-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirmation-title"
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Escape' && cancel()}
        >
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
      </div>
    `;
  }

  /**
   * Uploads an image for this product and returns its permanent URL. Needs the
   * `fx:create_upload_url` link, which the admin backend adds to a saved
   * product.
   */
  async uploadImage(file: File): Promise<string> {
    const createUploadUrl = this.data?._links['fx:create_upload_url']?.href;
    if (!createUploadUrl) throw new Error('This product has no fx:create_upload_url link.');

    const { upload_url, image_url } = await this._fetch<{ upload_url: string; image_url: string }>(
      createUploadUrl,
      { method: 'POST', body: JSON.stringify({ type: file.type }) }
    );

    // A pre-signed storage URL: plain fetch, since API credentials mustn't go there.
    // Its signature covers the x-amz-meta-* headers, which the URL also carries as
    // parameters, so they must be sent as headers too.
    const headers: Record<string, string> = { 'Content-Type': file.type };
    new URL(upload_url).searchParams.forEach((value, key) => {
      if (key.toLowerCase().startsWith('x-amz-meta-')) headers[key] = value;
    });
    const response = await fetch(upload_url, { method: 'PUT', body: file, headers });
    if (!response.ok) throw new Error(`Image upload failed with ${response.status}.`);

    return image_url;
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

  protected async _sendGet(): Promise<Data> {
    const product = await super._sendGet();

    // super._fetch, so the requests go through NucleonElement's fetch event and
    // the demo router can answer them. Both are best-effort: without them the
    // form only loses placeholders or the add-to-cart link.
    const parentHref = product?._links?.['fx:parent_product']?.href;
    const storeHref = product?._links?.['fx:store']?.href;
    const [parent, store] = await Promise.all([
      parentHref ? super._fetch<Data>(parentHref).catch(() => null) : null,
      storeHref && ['standalone', 'variant', 'parent'].includes(product.product_type)
        ? super._fetch<Resource<Rels.Store>>(storeHref).catch(() => null)
        : null,
    ]);

    this.parentProduct = parent;
    this.__store = store;
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

    const variants: Data[] = [];
    const url = new URL(href);
    url.searchParams.set('limit', '200');
    try {
      for (let offset = 0; ; offset += 200) {
        url.searchParams.set('offset', String(offset));
        const page = await super._fetch<any>(url.toString());
        const items: Data[] = page?._embedded?.['fx:products'] ?? [];
        variants.push(...items);
        if (!items.length || variants.length >= Number(page.total_items ?? 0)) break;
      }
    } catch {
      return null;
    }
    return { options, list: variants };
  }
}
