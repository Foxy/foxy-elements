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

  get headerSubtitleOptions(): Record<string, unknown> {
    return {
      ...super.headerSubtitleOptions,
      context: this.data?.affiliate_id ? 'affiliate' : '',
    };
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="first-name">
        </foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="last-name">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="contact-info">
        <foxy-internal-text-control layout="summary-item" infer="email">
        </foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="phone">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="role">
        <foxy-internal-switch-control infer="is-merchant"></foxy-internal-switch-control>
        <foxy-internal-switch-control infer="is-programmer"></foxy-internal-switch-control>
        <foxy-internal-switch-control infer="is-front-end-developer"></foxy-internal-switch-control>
        <foxy-internal-switch-control infer="is-designer"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }
}
