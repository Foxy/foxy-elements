import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

export class WebhookForm extends TranslatableMixin(InternalForm, 'webhook-form')<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name:v8n_required',
      ({ name: v }) => (!!v && v.length <= 255) || 'name:v8n_too_long',
      ({ version: v }) => !!v || 'version:v8n_required',
      ({ format: v }) => !!v || 'format:v8n_required',
      ({ url: v }) => !v || v.length <= 1000 || 'url:v8n_too_long',
      ({ query: v }) => !v || v.length <= 1000 || 'query:v8n_too_long',
      ({ encryption_key: v }) => !v || v.length <= 1000 || 'encryption-key:v8n_too_long',
    ];
  }

  private __formats = [
    { value: 'json', label: 'JSON' },
    { value: 'webflow', label: 'Webflow' },
    { value: 'zapier', label: 'Zapier' },
  ];

  private __eventResources = [
    { value: 'subscription', label: 'event_resource_subscription' },
    { value: 'transaction', label: 'event_resource_transaction' },
    { value: 'customer', label: 'event_resource_customer' },
  ];

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-text-control infer="name"></foxy-internal-text-control>

      <foxy-internal-radio-group-control infer="event-resource" .options=${this.__eventResources}>
      </foxy-internal-radio-group-control>

      <foxy-internal-text-control infer="query"></foxy-internal-text-control>
      <foxy-internal-text-control infer="url"></foxy-internal-text-control>

      <foxy-internal-radio-group-control infer="format" .options=${this.__formats}>
      </foxy-internal-radio-group-control>

      <foxy-internal-text-control infer="encryption-key"></foxy-internal-text-control>
      <foxy-internal-text-control infer="version"></foxy-internal-text-control>

      ${this.data
        ? html`
            <foxy-internal-async-details-control
              first=${this.data._links['fx:statuses'].href}
              infer="statuses"
              limit="10"
              item="foxy-webhook-status-card"
            >
            </foxy-internal-async-details-control>

            <foxy-internal-async-details-control
              first=${this.data._links['fx:logs'].href}
              infer="logs"
              limit="5"
              item="foxy-webhook-log-card"
            >
            </foxy-internal-async-details-control>
          `
        : ''}
      ${super.renderBody()}
    `;
  }
}
