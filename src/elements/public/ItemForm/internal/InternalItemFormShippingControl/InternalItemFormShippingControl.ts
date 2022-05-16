import type { TemplateResult } from 'lit-html';
import type { ItemForm } from '../../ItemForm';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalItemFormShippingControl extends InternalControl {
  infer = 'shipping';

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-details summary="title" lang=${this.lang} ns=${this.ns}>
        <div class="grid grid-cols-2 gap-m p-m">
          <foxy-internal-async-combo-box-control
            item-value-path="address_name"
            item-label-path="address_name"
            first=${ifDefined((this.nucleon as ItemForm | null)?.customerAddresses)}
            class="col-span-2"
            infer="shipto"
          >
          </foxy-internal-async-combo-box-control>

          <foxy-internal-integer-control infer="width"></foxy-internal-integer-control>
          <foxy-internal-integer-control infer="height"></foxy-internal-integer-control>
          <foxy-internal-integer-control infer="length"></foxy-internal-integer-control>
          <foxy-internal-integer-control infer="weight"></foxy-internal-integer-control>
        </div>
      </foxy-internal-details>
    `;
  }
}
