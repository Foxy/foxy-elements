import type { TemplateResult } from 'lit-html';
import type { ItemForm } from '../../ItemForm';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';

export class InternalItemFormInventoryControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    return html`
      <div class="grid grid-cols-2 gap-m">
        <foxy-internal-async-combo-box-control
          item-value-path="_links.self.href"
          item-label-path="name"
          property="item_category_uri"
          first=${ifDefined((this.nucleon as ItemForm | null)?.itemCategories ?? undefined)}
          class="col-span-2"
          infer="category"
        >
        </foxy-internal-async-combo-box-control>

        <foxy-internal-text-control infer="code"></foxy-internal-text-control>
        <foxy-internal-text-control infer="parent-code"></foxy-internal-text-control>
      </div>
    `;
  }
}
