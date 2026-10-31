import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { SwipeAction } from '../../internal/InternalAsyncListControl/types';
import type { BooleanSelector, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data, ProductDefinition, ProductModifier, ProductOption } from './types';

import { getResourceId } from '@foxy.io/sdk/core';
import {
  buildCartLink,
  isRemoval,
  mergeModifiers,
  validateModifiers,
  validateOptions,
} from './catalog';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'product-form';
const Base = TranslatableMixin(InternalForm, NS);

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
      parentProduct: { attribute: false },
      __variantActions: { attribute: false },
      __deleteConfirmed: { attribute: false },
    };
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
        const skus = host
          .__variantsToDeleteBy(form)
          .map(variant => variant.sku)
          .join(' ');
        if (!skus || host.__deleteConfirmed === skus) return true;
        return 'options:v8n_confirm_delete';
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

  private __store: Resource<Rels.Store> | null = null;

  /** The active variants, when this product has saved options. */
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

  private __variantActions: SwipeAction<Data>[] = [
    {
      theme: 'contrast',
      state: 'idle',
      text: 'copy_button_text',
      onClick: async data => {
        const action = this.__variantActions[0];
        this.__variantActions = [{ ...action, state: 'busy' }];
        try {
          await navigator.clipboard.writeText(data.sku);
          this.__variantActions = [{ ...action, state: 'end' }];
        } catch {
          this.__variantActions = [{ ...action, state: 'error' }];
        }
        setTimeout(() => (this.__variantActions = [{ ...action, state: 'idle' }]), 1000);
      },
    },
  ];

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
    const ownOptions = this.form.definition?.options ?? [];
    const optionNames = (isVariant ? this.__parentOptions : ownOptions).map(option => option.name);
    const modifierNames = mergeModifiers(
      this.__inheritedModifiers,
      this.form.definition?.modifiers ?? []
    ).map(modifier => modifier.name);

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

      <foxy-internal-summary-control infer="general">
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

        <foxy-internal-text-control layout="summary-item" infer="sku"></foxy-internal-text-control>

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

        ${this.__cartLink && !this.__cartLinkChoices
          ? html`
              <div class="flex items-center justify-between gap-m" data-testid="cart-link">
                <div class="min-w-0">
                  <foxy-i18n class="block font-medium" infer="cart-link" key="label"></foxy-i18n>
                  <span class="block text-s text-secondary truncate">${this.__cartLink}</span>
                </div>
                <foxy-copy-to-clipboard infer="cart-link" layout="text" text=${this.__cartLink}>
                </foxy-copy-to-clipboard>
              </div>
            `
          : ''}
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

      <foxy-internal-product-form-images-control infer="images">
      </foxy-internal-product-form-images-control>

      <foxy-internal-array-map-control
        infer="properties"
        .getValue=${this.__propertiesGetValue}
        .setValue=${this.__propertiesSetValue}
      >
      </foxy-internal-array-map-control>

      ${isVariant || isTemplate
        ? ''
        : html`
            <foxy-internal-product-form-options-control
              infer="options"
              .modifierNames=${modifierNames}
              .variantsToDelete=${this.__variantsToDelete.map(variant => variant.sku)}
              .deleteConfirmed=${this.__deleteConfirmed ===
              this.__variantsToDelete.map(variant => variant.sku).join(' ')}
              @confirm-delete=${(evt: CustomEvent<boolean>) => {
                const skus = this.__variantsToDelete.map(variant => variant.sku).join(' ');
                this.__deleteConfirmed = evt.detail ? skus : '';
                this.edit({});
              }}
            >
            </foxy-internal-product-form-options-control>
          `}

      <foxy-internal-product-form-modifiers-control
        infer="modifiers"
        .inherited=${this.__inheritedModifiers}
        .optionNames=${optionNames}
      >
      </foxy-internal-product-form-modifiers-control>

      <foxy-internal-summary-control infer="stock">
        <foxy-internal-number-control
          layout="summary-item"
          infer=${isTemplate ? 'stock-level-template' : 'stock-level'}
          step="1"
          property="stock_level"
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      ${this.__cartLink && this.__cartLinkChoices
        ? html`
            <foxy-internal-product-form-cart-link-control
              infer="cart-link-builder"
              host=${this.__cartHost!}
              sku=${this.data!.sku}
              .options=${this.__cartLinkChoices.options}
              .modifiers=${this.__cartLinkChoices.modifiers}
            >
            </foxy-internal-product-form-cart-link-control>
          `
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

      <foxy-internal-async-list-control
        layout="details"
        infer="tags"
        first=${ifDefined(this.data?._links['fx:product_tags']?.href)}
        item="foxy-product-tag-card"
        form="foxy-product-tag-form"
        alert
      >
      </foxy-internal-async-list-control>

      ${this.data?._links['fx:generate_variants'] && !isVariant && !isTemplate
        ? html`
            <foxy-internal-product-form-generate-variants-control infer="generate-variants">
            </foxy-internal-product-form-generate-variants-control>
          `
        : ''}

      <foxy-internal-async-list-control
        layout="details"
        infer="variants"
        first=${ifDefined(this.data?._links['fx:product_variants']?.href)}
        item="foxy-product-card"
        form="foxy-product-form"
        .actions=${this.__variantActions}
        .formProps=${{ '.parentProduct': this.data }}
        ?hide-create-button=${!this.__savedOptions.length}
        wide
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        layout="details"
        infer="template-products"
        first=${ifDefined(this.__templateProductsHref)}
        item="foxy-product-card"
        wide
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}
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

    this.__refreshVariantsList();
    // A standalone becomes a parent, and its variant count changes.
    this.refresh();

    return result._embedded?.['fx:products']?.length ?? 0;
  }

  private __refreshVariantsList() {
    const variants = this.renderRoot.querySelector<HTMLElement & { renderRoot: ParentNode }>(
      'foxy-internal-async-list-control[infer="variants"]'
    );
    const page = variants?.renderRoot.querySelector('foxy-collection-page') as
      | (Element & { refresh?: () => void })
      | null
      | undefined;
    page?.refresh?.();
  }

  /**
   * The variants that saving the edited options would delete: those using a
   * value, or an option, that the edit removes.
   */
  private get __variantsToDelete(): Data[] {
    return this.__variantsToDeleteBy(this.form);
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

  /** The link for a product added without choices; a parent needs its options chosen. */
  private get __cartLink(): string | undefined {
    const data = this.data;
    const host = this.__cartHost;
    if (!host || !data) return;
    if (data.product_type === 'parent' && !this.__savedOptions.length) return;
    if (!['standalone', 'variant', 'parent'].includes(data.product_type)) return;
    return buildCartLink(host, data.sku);
  }

  /** What the shopper chooses when adding the saved product, if anything. */
  private get __cartLinkChoices():
    | { options: ProductOption[]; modifiers: ProductModifier[] }
    | undefined {
    const data = this.data;
    if (!data) return;
    const options = data.product_type === 'parent' ? this.__savedOptions : [];
    const modifiers =
      data.compiled_definition?.modifiers?.filter(m => !isRemoval(m)) ??
      mergeModifiers(this.__inheritedModifiers, data.definition?.modifiers ?? []);
    if (!options.length && !modifiers.length) return;
    return { options, modifiers: modifiers as ProductModifier[] };
  }

  private get __savedOptions(): ProductOption[] {
    return this.data?.compiled_definition?.options ?? this.data?.definition?.options ?? [];
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
      this.__refreshVariantsList();
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
    if (!href || !options.length) return null;

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
