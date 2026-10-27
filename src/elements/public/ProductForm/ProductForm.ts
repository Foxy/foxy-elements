import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { BooleanSelector } from '@foxy.io/sdk/core';
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
 * Renders core fields (name, SKU, price, description, category, tags, stock)
 * plus collapsed placeholders for variants / advanced / events sections that
 * are filled in by Units 5/6/8/9.
 *
 * Variant mode: when `data.product_type === 'variant'`, the parent product
 * is fetched on load and used to compute placeholder values for empty fields,
 * so users can see what they'd inherit.
 *
 * @element foxy-product-form
 * @since 1.54.0
 */
export class ProductForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      productCategories: { attribute: 'product-categories' },
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

  /** Link to the `fx:product_categories` collection for this store, used by the category picker. */
  productCategories: string | null = null;

  /**
   * Parent product data, fetched on load when this form is in variant mode
   * (`product_type === 'variant'`). Used to compute placeholder values for
   * empty variant fields.
   */
  private __parentProduct: Data | null = null;

  // The picker works in hrefs; the product stores category_id. A category's
  // href is /product_categories/{id} beside /products/{id} and /stores/{id}.
  private readonly __categoryGetValue = () => {
    const id = this.form.category_id;
    if (!id) return undefined;
    const self = this.data?._links.self.href;
    if (self) return new URL(`../product_categories/${id}`, self).toString();
    if (this.productCategories)
      return new URL(`../../product_categories/${id}`, this.productCategories).toString();
  };

  private readonly __categorySetValue = (href: string) => {
    const id = getResourceId(href);
    this.edit({ category_id: typeof id === 'number' ? id : null });
  };

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];

    // Hide the variants list when this product IS a variant — variants don't
    // have sub-variants. Also hide it on a brand-new (unsaved) product since
    // the fx:product_variants link doesn't exist yet.
    if (this.data?.product_type === 'variant' || !this.href) {
      alwaysMatch.unshift('variants');
    }

    // Hide tags/events/stock-rules sub-collections until the product is saved
    // (the fx:product_tags / fx:product_events / fx:product_stock_rules links
    // require a server-assigned id).
    if (!this.href) {
      alwaysMatch.unshift('tags', 'events', 'stock-rules');
    }

    return new (super.hiddenSelector.constructor as new (s: string) => BooleanSelector)(
      alwaysMatch.join(' ').trim()
    );
  }

  get headerSubtitleKey(): string {
    return `subtitle_${this.data?.product_type ?? 'standalone'}`;
  }

  renderBody(): TemplateResult {
    const isVariant = this.data?.product_type === 'variant';
    const parentDef = this.__parentProduct?.definition as ProductDefinition | undefined;

    return html`
      ${this.renderHeader()}
      ${isVariant
        ? html`
            <p class="text-s text-secondary leading-s" data-testid="inheritance-note">
              <foxy-i18n infer="" key="inheritance_note"></foxy-i18n>
            </p>
          `
        : ''}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control
          layout="summary-item"
          infer="name"
          property="definition.name"
          placeholder=${ifDefined(parentDef?.name ?? undefined)}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="sku"></foxy-internal-text-control>

        <foxy-internal-number-control
          layout="summary-item"
          infer="price"
          min="0"
          property="definition.price"
          placeholder=${ifDefined(parentDef?.price?.toString() ?? undefined)}
        >
        </foxy-internal-number-control>

        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this.productCategories ?? undefined)}
          infer="category"
          property="category_id"
          .getValue=${this.__categoryGetValue}
          .setValue=${this.__categorySetValue}
          item="foxy-product-category-card"
        >
        </foxy-internal-resource-picker-control>
      </foxy-internal-summary-control>

      <foxy-internal-product-form-description-control
        infer="description"
        property="definition.description"
        placeholder=${ifDefined(parentDef?.description ?? undefined)}
      >
      </foxy-internal-product-form-description-control>

      <foxy-internal-product-form-images-control infer="images">
      </foxy-internal-product-form-images-control>

      <foxy-internal-summary-control infer="stock">
        <foxy-internal-number-control
          layout="summary-item"
          infer="stock-level"
          step="1"
          property="stock_level"
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

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
        wide
      >
      </foxy-internal-async-list-control>

      <!--
        Section placeholders for Units 8/9. Plain divs (rather than empty
        InternalSummaryControl instances) so this form doesn't trigger any
        side effects from sub-control activation while these sections are
        still empty. Data-testids let tests verify the structural slots are
        in place.
      -->
      <div data-testid="advanced-section" hidden></div>
      <div data-testid="stock-rules-section" hidden></div>
      <div data-testid="events-section" hidden></div>

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

  protected async _sendGet(): Promise<Data> {
    const product = await super._sendGet();

    // In variant mode, also fetch the parent so we can show inherited
    // values as placeholders for empty fields. Use super._fetch so the
    // request flows through NucleonElement's event-dispatched fetch and
    // the demo router can intercept (matches ItemForm's chained-fetch pattern).
    const parentHref = product?._links?.['fx:parent_product']?.href;
    if (product?.product_type === 'variant' && parentHref) {
      try {
        this.__parentProduct = await super._fetch<Data>(parentHref);
      } catch {
        // Best-effort; without the parent we just render no placeholders.
        this.__parentProduct = null;
      }
    } else {
      this.__parentProduct = null;
    }

    return product;
  }
}
