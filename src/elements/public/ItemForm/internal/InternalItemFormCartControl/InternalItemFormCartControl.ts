import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html } from 'lit-html';

export class InternalItemFormCartControl extends InternalControl {
  infer = 'cart';

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-details summary="title" lang=${this.lang} ns=${this.ns}>
        <div class="grid grid-cols-2 gap-m p-m">
          <foxy-internal-date-control class="col-span-2" infer="expires" format="unix">
          </foxy-internal-date-control>
          <foxy-internal-text-control class="col-span-2" infer="url"></foxy-internal-text-control>
          <foxy-internal-text-control class="col-span-2" infer="image"></foxy-internal-text-control>
          <foxy-internal-integer-control infer="quantity-min"></foxy-internal-integer-control>
          <foxy-internal-integer-control infer="quantity-max"></foxy-internal-integer-control>
        </div>
      </foxy-internal-details>
    `;
  }
}
