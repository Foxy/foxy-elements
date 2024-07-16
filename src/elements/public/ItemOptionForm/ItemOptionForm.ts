import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

/**
 * Form element for creating or editing item options (`fx:item_option`).
 *
 * @element foxy-item-option-form
 * @since 1.17.0
 */
export class ItemOptionForm extends TranslatableMixin(InternalForm, 'item-option-form')<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name:v8n_required',
      ({ name: v }) => (!!v && v.length <= 100) || 'name:v8n_too_long',
      ({ value: v }) => !!v || 'value:v8n_required',
      ({ value: v }) => (!!v && v.length <= 1024) || 'value:v8n_too_long',
    ];
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <div class="grid grid-cols-2 gap-m">
        <foxy-internal-text-control infer="name" class="col-span-2"></foxy-internal-text-control>
        <foxy-internal-text-control infer="value" class="col-span-2"></foxy-internal-text-control>
        <foxy-internal-number-control infer="price-mod"></foxy-internal-number-control>
        <foxy-internal-number-control infer="weight-mod"></foxy-internal-number-control>
      </div>

      ${super.renderBody()}
    `;
  }
}
