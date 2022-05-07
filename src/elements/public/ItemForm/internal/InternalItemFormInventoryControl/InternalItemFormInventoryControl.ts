import type { TemplateResult } from 'lit-html';
import type { ItemForm } from '../../ItemForm';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';

export class InternalItemFormInventoryControl extends InternalControl {
  infer = 'inventory';

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-collapsible-card summary="title" lang=${this.lang} ns=${this.ns}>
        <div class="grid grid-cols-2 gap-m p-m">
          <foxy-internal-async-combo-box-control
            item-value-path="_links.self.href"
            item-label-path="name"
            property="item_category_uri"
            first=${ifDefined((this.nucleon as ItemForm | null)?.itemCategories)}
            class="col-span-2"
            infer="category"
          >
          </foxy-internal-async-combo-box-control>

          <foxy-internal-text-control infer="code"></foxy-internal-text-control>
          <foxy-internal-text-control infer="parent-code"></foxy-internal-text-control>
        </div>
      </foxy-internal-collapsible-card>
    `;
  }
}
