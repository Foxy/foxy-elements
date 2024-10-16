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

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="name"></foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="value">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="mods">
        <foxy-internal-number-control layout="summary-item" infer="price-mod">
        </foxy-internal-number-control>
        <foxy-internal-number-control layout="summary-item" infer="weight-mod">
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }
}
