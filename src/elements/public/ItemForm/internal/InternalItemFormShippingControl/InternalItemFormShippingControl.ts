import type { TemplateResult } from 'lit-html';
import type { ItemForm } from '../../ItemForm';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalItemFormShippingControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    return html`
      <div class="grid grid-cols-2 gap-m">
        <foxy-internal-async-combo-box-control
          item-value-path="address_name"
          item-label-path="address_name"
          first=${ifDefined((this.nucleon as ItemForm | null)?.customerAddresses ?? undefined)}
          class="col-span-2"
          infer="shipto"
        >
        </foxy-internal-async-combo-box-control>

        <foxy-internal-integer-control infer="width"></foxy-internal-integer-control>
        <foxy-internal-integer-control infer="height"></foxy-internal-integer-control>
        <foxy-internal-integer-control infer="length"></foxy-internal-integer-control>
        <foxy-internal-integer-control infer="weight"></foxy-internal-integer-control>
      </div>
    `;
  }
}
