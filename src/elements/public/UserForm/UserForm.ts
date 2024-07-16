import type { Data } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { validate as isEmail } from 'email-validator';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'user-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for `fx:user` resources.
 *
 * @element foxy-user-form
 * @since 1.3.0
 */
export class UserForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ first_name: v }) => (v && v.length > 0) || 'first-name:v8n_required',
      ({ first_name: v }) => !v || v.length <= 50 || 'first-name:v8n_too_long',
      ({ last_name: v }) => (v && v.length > 0) || 'last-name:v8n_required',
      ({ last_name: v }) => !v || v.length <= 50 || 'last-name:v8n_too_long',
      ({ email: v }) => (v && v.length > 0) || 'email:v8n_required',
      ({ email: v }) => !v || v.length <= 100 || 'email:v8n_too_long',
      ({ email: v }) => !v || isEmail(v) || 'email:v8n_invalid_email',
      ({ phone: v }) => !v || v.length <= 50 || 'phone:v8n_too_long',
    ];
  }

  private readonly __roleGetValue = () => {
    const value: string[] = [];

    if (this.form.is_merchant) value.push('merchant');
    if (this.form.is_programmer) value.push('backend_developer');
    if (this.form.is_front_end_developer) value.push('frontend_developer');
    if (this.form.is_designer) value.push('designer');

    return value;
  };

  private readonly __roleSetValue = (newValue: string[]) => {
    this.edit({
      is_merchant: newValue.includes('merchant'),
      is_programmer: newValue.includes('backend_developer'),
      is_front_end_developer: newValue.includes('frontend_developer'),
      is_designer: newValue.includes('designer'),
    });
  };

  private readonly __roleOptions = [
    { label: 'option_merchant', value: 'merchant' },
    { label: 'option_backend_developer', value: 'backend_developer' },
    { label: 'option_frontend_developer', value: 'frontend_developer' },
    { label: 'option_designer', value: 'designer' },
  ];

  get headerSubtitleOptions(): Record<string, unknown> {
    return {
      ...super.headerSubtitleOptions,
      context: this.data?.affiliate_id ? 'affiliate' : '',
    };
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-text-control infer="first-name"></foxy-internal-text-control>
      <foxy-internal-text-control infer="last-name"></foxy-internal-text-control>
      <foxy-internal-text-control infer="email"></foxy-internal-text-control>
      <foxy-internal-text-control infer="phone"></foxy-internal-text-control>

      <foxy-internal-checkbox-group-control
        infer="role"
        .getValue=${this.__roleGetValue}
        .setValue=${this.__roleSetValue}
        .options=${this.__roleOptions}
      >
      </foxy-internal-checkbox-group-control>

      ${super.renderBody()}
    `;
  }
}
