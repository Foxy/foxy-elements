import type { Data } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'custom-field-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating or editing custom fields.
 *
 * @element foxy-custom-field-form
 * @since 1.2.0
 */
export class CustomFieldForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ value: v }) => (v && v.length > 0) || 'value:v8n_required',
      ({ value: v }) => !v || v.length <= 700 || 'value:v8n_too_long',
      ({ name: v }) => (v && v.length > 0) || 'name:v8n_required',
      ({ name: v }) => !v || v.length <= 100 || 'name:v8n_too_long',
    ];
  }

  private readonly __visibilityGetValue = () => {
    return this.form.is_hidden ? ['hidden'] : [];
  };

  private readonly __visibilitySetValue = (newValue: string[]) => {
    this.edit({ is_hidden: newValue.includes('hidden') });
  };

  private readonly __visibilityOptions = [{ label: 'option_hidden', value: 'hidden' }];

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-source-control infer="name"></foxy-internal-source-control>
      <foxy-internal-source-control infer="value"></foxy-internal-source-control>
      <foxy-internal-checkbox-group-control
        infer="visibility"
        .getValue=${this.__visibilityGetValue}
        .setValue=${this.__visibilitySetValue}
        .options=${this.__visibilityOptions}
      >
      </foxy-internal-checkbox-group-control>

      ${super.renderBody()}
    `;
  }
}
