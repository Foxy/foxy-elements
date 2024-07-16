import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

/**
 * Form element for creating or editing webhooks (`fx:webhook`).
 *
 * @element foxy-webhook-form
 * @since 1.17.0
 */
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

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch: string[] = [];
    if (this.data) alwaysMatch.push('event-resource');
    return new BooleanSelector(`${super.readonlySelector} ${alwaysMatch.join(' ')}`.trim());
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    return { context: this.data?.event_resource };
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

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
            <foxy-internal-async-list-control
              first=${this.data._links['fx:statuses'].href}
              infer="statuses"
              limit="10"
              item="foxy-webhook-status-card"
            >
            </foxy-internal-async-list-control>

            <foxy-internal-async-list-control
              first=${this.data._links['fx:logs'].href}
              infer="logs"
              limit="5"
              item="foxy-webhook-log-card"
            >
            </foxy-internal-async-list-control>
          `
        : ''}
      ${super.renderBody()}
    `;
  }
}
