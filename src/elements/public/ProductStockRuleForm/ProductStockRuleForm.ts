import type { PropertyDeclarations } from 'lit-element';
import type { HALJSONResource, NucleonV8N } from '../NucleonElement/types';
import type { TemplateResult } from 'lit-html';
import type { Data as ProductData } from '../ProductForm/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector, getResourceId } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'product-stock-rule-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for a product stock rule (`fx:product_stock_rule`). Create it by
 * POSTing to the source product's `fx:product_stock_rules` link. The API can't
 * change a rule once it exists, so a saved rule can only be deleted.
 *
 * @element foxy-product-stock-rule-form
 * @since 1.54.0
 */
export class ProductStockRuleForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      products: {},
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ target_product_id: v }) => !!v || 'target:v8n_required',
      ({ multiplier: v }) =>
        v === undefined || (Number.isInteger(v) && v >= 0) || 'multiplier:v8n_invalid',
    ];
  }

  /** Link to the store's `fx:products` collection, used by the target picker. */
  products: string | null = null;

  // The picker works in hrefs; the rule stores target_product_id. A product's
  // href is /products/{id} beside /stores/{id}.
  private readonly __targetGetValue = () => {
    const id = this.form.target_product_id;
    if (!id) return undefined;
    const target = this.data?._links['fx:target_product']?.href;
    if (target) return target;
    if (this.products) return new URL(`../../products/${id}`, this.products).toString();
  };

  private readonly __targetSetValue = (href: string) => {
    const id = getResourceId(href);
    this.edit({ target_product_id: typeof id === 'number' ? id : undefined });
  };

  private readonly __targetDisplayValueOptions = (resource: HALJSONResource) => {
    const product = resource as unknown as ProductData;
    const name = product.compiled_definition?.name ?? product.definition?.name;
    return { name: name || product.sku, sku: product.sku };
  };

  // A template's stock is only the stock new products start with, so it can't be a target.
  private readonly __extendTargetFilter = (params: URLSearchParams) => {
    params.set('product_type:in', 'standalone,parent,variant');
  };

  get readonlySelector(): BooleanSelector {
    return this.data ? new BooleanSelector('not=delete') : super.readonlySelector;
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this.products ?? undefined)}
          infer="target"
          item="foxy-product-card"
          .getValue=${this.__targetGetValue}
          .setValue=${this.__targetSetValue}
          .getDisplayValueOptions=${this.__targetDisplayValueOptions}
          .extendFilter=${this.__extendTargetFilter}
        >
        </foxy-internal-resource-picker-control>

        <foxy-internal-number-control
          layout="summary-item"
          infer="multiplier"
          step="1"
          min="0"
          .getValue=${() => this.form.multiplier ?? 1}
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }
}
