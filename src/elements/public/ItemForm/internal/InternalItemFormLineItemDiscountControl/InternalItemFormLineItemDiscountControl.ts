import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { ItemForm } from '../../ItemForm';
import type { Rels } from '@foxy.io/sdk/backend';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalItemFormLineItemDiscountControl extends InternalControl {
  infer = 'line-item-discount';

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-details summary="title" infer>
        <div class="space-y-m p-m">
          <foxy-internal-async-combo-box-control
            item-value-path="_links.self.href"
            item-label-path="name"
            first=${ifDefined((this.nucleon as ItemForm | null)?.coupons)}
            infer="coupon"
            @change=${(evt: CustomEvent) => {
              evt.preventDefault();
              const selection = evt.detail as Resource<Rels.Coupon>;

              this.nucleon?.edit({
                discount_name: selection.name,
                discount_type: selection.coupon_discount_type,
                discount_details: selection.coupon_discount_details,
              });
            }}
          >
          </foxy-internal-async-combo-box-control>

          <foxy-internal-text-control infer="discount-name"></foxy-internal-text-control>

          <foxy-discount-builder
            infer="discount-builder"
            .parsedValue=${{
              type: this.nucleon?.form.discount_type,
              name: this.nucleon?.form.discount_name,
              details: this.nucleon?.form.discount_details,
            }}
          >
          </foxy-discount-builder>
        </div>
      </foxy-internal-details>
    `;
  }
}
