import type { Data, Templates } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm';
import { html } from 'lit-html';

const NS = 'attribute-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating or editing attributes.
 *
 * @slot name:before - **new in v1.4.0**
 * @slot name:after - **new in v1.4.0**
 *
 * @slot value:before - **new in v1.4.0**
 * @slot value:after - **new in v1.4.0**
 *
 * @slot visibility:before - **new in v1.4.0**
 * @slot visibility:after - **new in v1.4.0**
 *
 * @slot timestamps:before - **new in v1.4.0**
 * @slot timestamps:after - **new in v1.4.0**
 *
 * @slot create:before - **new in v1.4.0**
 * @slot create:after - **new in v1.4.0**
 *
 * @slot delete:before - **new in v1.4.0**
 * @slot delete:after - **new in v1.4.0**
 *
 * @element foxy-attribute-form
 * @since 1.2.0
 */
export class AttributeForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ value }) => (value && value.length > 0) || 'value:v8n_required',
      ({ value }) => !value || value.length <= 1000 || 'value:v8n_too_long',
      ({ name }) => (name && name.length > 0) || 'name:v8n_required',
      ({ name }) => !name || name.length <= 500 || 'name:v8n_too_long',
    ];
  }

  templates: Templates = {};

  private readonly __visibilityGetValue = () => {
    return this.form.visibility || 'private';
  };

  private readonly __visibilityOptions = [
    { label: 'option_public', value: 'public' },
    { label: 'option_restricted', value: 'restricted' },
    { label: 'option_private', value: 'private' },
  ];

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    if (this.href) alwaysMatch.unshift('visibility');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-source-control infer="name"></foxy-internal-source-control>
      <foxy-internal-source-control infer="value"></foxy-internal-source-control>
      <foxy-internal-radio-group-control
        infer="visibility"
        .options=${this.__visibilityOptions}
        .getValue=${this.__visibilityGetValue}
      >
      </foxy-internal-radio-group-control>

      ${super.renderBody()}
    `;
  }
}
