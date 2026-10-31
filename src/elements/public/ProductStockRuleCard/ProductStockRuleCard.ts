import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Data as ProductData } from '../ProductForm/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'product-stock-rule-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Card element displaying a product stock rule (`fx:product_stock_rule`):
 * the product whose stock a purchase draws on, and how many units it takes.
 *
 * @element foxy-product-stock-rule-card
 * @since 1.54.0
 */
export class ProductStockRuleCard extends Base<Data> {
  private __targetLoaderId = 'targetLoader';

  renderBody(): TemplateResult {
    return html`
      <foxy-nucleon
        infer=""
        class="hidden"
        href=${ifDefined(this.data?._links['fx:target_product'].href)}
        id=${this.__targetLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      ${super.renderBody({
        title: () => {
          const target = this.__target;
          const name = target?.compiled_definition?.name ?? target?.definition?.name;
          return html`${name || target?.sku || ''}`;
        },
        subtitle: data => {
          const multiplier = html`
            <foxy-i18n
              infer=""
              key=${data.multiplier === 0 ? 'multiplier_zero' : 'multiplier'}
              .options=${{ count: data.multiplier }}
            >
            </foxy-i18n>
          `;

          return this.__target?.sku ? html`${this.__target.sku} · ${multiplier}` : multiplier;
        },
      })}
    `;
  }

  get isBodyReady(): boolean {
    return super.isBodyReady && !!this.__target;
  }

  private get __target() {
    type Loader = NucleonElement<ProductData>;
    return this.renderRoot.querySelector<Loader>(`#${this.__targetLoaderId}`)?.data;
  }
}
