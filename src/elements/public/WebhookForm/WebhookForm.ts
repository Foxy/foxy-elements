import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data, WebhookLog } from './types';

import { BooleanSelector, getResourceId } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

/**
 * Form element for creating or editing webhooks (`fx:webhook`).
 *
 * @element foxy-webhook-form
 * @since 1.17.0
 */
export class WebhookForm extends TranslatableMixin(InternalForm, 'webhook-form')<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getStatusPageHref: { attribute: false },
      getLogPageHref: { attribute: false },
      resourceUri: { attribute: 'resource-uri' },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name:v8n_required',
      ({ name: v }) => (!!v && v.length <= 255) || 'name:v8n_too_long',
      ({ url: v }) => !v || v.length <= 1000 || 'url:v8n_too_long',
      ({ query: v }) => !v || v.length <= 1000 || 'query:v8n_too_long',
      ({ encryption_key: v }) => !!v || 'encryption-key:v8n_required',
      ({ encryption_key: v }) => !v || v.length <= 1000 || 'encryption-key:v8n_too_long',
    ];
  }

  /** If set, renders Statuses list items as <a> tags. */
  getStatusPageHref: ((statusHref: string, status: WebhookLog) => string | null) | null = null;

  /** If set, renders Logs list items as <a> tags. */
  getLogPageHref: ((logHref: string, log: WebhookLog) => string | null) | null = null;

  /**
   * Optional URI of a transaction, customer or subscription. When provided,
   * the form will display logs and statuses for that particular resource only.
   */
  resourceUri: string | null = null;

  private __encryptionKeyGeneratorOptions = { separator: '', length: 512 };

  private __eventResources = [
    { value: 'subscription', label: 'event_resource_subscription' },
    { value: 'transaction', label: 'event_resource_transaction' },
    { value: 'customer', label: 'event_resource_customer' },
  ];

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch: string[] = [super.hiddenSelector.toString()];

    if (this.data) {
      alwaysMatch.unshift('general:event-resource');
    } else {
      alwaysMatch.unshift('logs', 'statuses');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    const format = this.data?.format;
    return { context: format === 'json' ? this.data?.event_resource : format };
  }

  edit(data: Partial<Data>): void {
    super.edit(data);
    if (!this.form.format) super.edit({ format: 'json' });
    if (!this.form.version) super.edit({ version: 2 });
  }

  renderBody(): TemplateResult {
    const resourceId = this.resourceUri ? getResourceId(this.resourceUri) : null;

    let statusesLink: string | undefined;
    let logsLink: string | undefined;

    try {
      const url = new URL(this.data?._links['fx:statuses'].href ?? '');
      if (resourceId !== null) url.searchParams.set('resource_id', String(resourceId));
      url.searchParams.set('order', 'date_created desc');
      statusesLink = url.toString();
    } catch {
      statusesLink = undefined;
    }

    try {
      const url = new URL(this.data?._links['fx:logs'].href ?? '');
      if (resourceId !== null) url.searchParams.set('resource_id', String(resourceId));
      url.searchParams.set('order', 'date_created desc');
      logsLink = url.toString();
    } catch {
      logsLink = undefined;
    }

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="name"></foxy-internal-text-control>

        <foxy-internal-select-control
          layout="summary-item"
          infer="event-resource"
          .options=${this.__eventResources}
        >
        </foxy-internal-select-control>

        <foxy-internal-password-control
          layout="summary-item"
          infer="encryption-key"
          show-generator
          .generatorOptions=${this.__encryptionKeyGeneratorOptions}
        >
        </foxy-internal-password-control>

        <foxy-internal-text-control layout="summary-item" infer="query">
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="url"></foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-async-list-control
        first=${ifDefined(statusesLink)}
        infer="statuses"
        limit="10"
        item="foxy-webhook-status-card"
        hide-delete-button
        .getPageHref=${this.getStatusPageHref}
        .itemProps=${this.resourceUri ? { layout: 'resource' } : {}}
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        first=${ifDefined(logsLink)}
        infer="logs"
        limit="10"
        item="foxy-webhook-log-card"
        hide-delete-button
        .getPageHref=${this.getLogPageHref}
        .itemProps=${this.resourceUri ? { layout: 'resource' } : {}}
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}
    `;
  }
}
