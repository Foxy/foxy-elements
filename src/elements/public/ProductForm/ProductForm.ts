import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { SwipeAction } from '../../internal/InternalAsyncListControl/types';
import type { BooleanSelector, Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data, ProductDefinition } from './types';

import { getResourceId } from '@foxy.io/sdk/core';
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
      __variantActions: { attribute: false },
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
    ];
  }

  /** Link to the `fx:product_collections` collection for this store, used by the collection picker. */
  productCollections: string | null = null;

  /** Host domain for stores without a custom domain, such as `foxycart.com`, for the add-to-cart link. */
  defaultDomain: string | null = null;

  /** The product this one inherits from: its parent, or its template. */
  private __parentProduct: Data | null = null;

  private __store: Resource<Rels.Store> | null = null;

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
    if (type === 'variant') alwaysMatch.unshift('general:template');

    // The kind is chosen once, when the product is created.
    if (this.href) alwaysMatch.unshift('general:kind');

    // A template's stock is only where new products start, so nothing draws on it.
    if (type === 'template') alwaysMatch.unshift('stock-rules');
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
    const parent = this.__parentProduct;
    const inherited = this.__inherited;
    const isTemplate = this.form.product_type === 'template';

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

        ${this.__cartLink
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

      <foxy-internal-summary-control infer="stock">
        <foxy-internal-number-control
          layout="summary-item"
          infer=${isTemplate ? 'stock-level-template' : 'stock-level'}
          step="1"
          property="stock_level"
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

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

      <foxy-internal-async-list-control
        layout="details"
        infer="variants"
        first=${ifDefined(this.data?._links['fx:product_variants']?.href)}
        item="foxy-product-card"
        form="foxy-product-form"
        .actions=${this.__variantActions}
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

  /** The parent's or template's name and SKU, or the SKU alone if it has no name. */
  private get __parentLabel(): string {
    const parent = this.__parentProduct;
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

  private get __cartLink(): string | undefined {
    const store = this.__store;
    const data = this.data;
    if (!store || !data || !['standalone', 'variant'].includes(data.product_type)) return;
    const host = store.use_remote_domain
      ? store.store_domain
      : this.defaultDomain && `${store.store_domain}.${this.defaultDomain}`;
    return host ? `https://${host}/cart?sku=${encodeURIComponent(data.sku)}` : undefined;
  }

  /** Field placeholders show what an empty field inherits. */
  private get __inherited(): ProductDefinition | undefined {
    return this.__parentProduct?.compiled_definition as ProductDefinition | undefined;
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
      storeHref && ['standalone', 'variant'].includes(product.product_type)
        ? super._fetch<Resource<Rels.Store>>(storeHref).catch(() => null)
        : null,
    ]);

    this.__parentProduct = parent;
    this.__store = store;

    return product;
  }
}
