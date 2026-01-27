import type { Data } from './types';
import type { TemplateResult } from 'lit-html';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-element';

const NS = 'client-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for viewing and deleting clients (`fx:client`).
 *
 * @element foxy-client-form
 * @since 1.24.0
 */
export class ClientForm extends Base<Data> {
  get headerSubtitleOptions(): Record<string, unknown> {
    try {
      const url = new URL(this.data?.redirect_uri ?? '');
      return { context: 'with_domain', domain: url.hostname };
    } catch {
      return super.headerSubtitleOptions;
    }
  }

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = ['general:client-secret'];
    if (this.data || this.in({ busy: 'fetching' })) alwaysMatch.push('general:client-id');
    return new BooleanSelector(`${alwaysMatch.join(' ')} ${super.readonlySelector.toString()}`);
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch: string[] = [];
    if (!this.data && !this.in({ busy: 'fetching' })) alwaysMatch.push('general:client-secret');
    return new BooleanSelector(`${alwaysMatch.join(' ')} ${super.hiddenSelector.toString()}`);
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="client-id">
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="client-secret">
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="redirect-uri">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="project">
        <foxy-internal-text-control layout="summary-item" infer="project-name">
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="project-description">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="company">
        <foxy-internal-text-control layout="summary-item" infer="company-name">
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="company-url">
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="company-logo">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="contact">
        <foxy-internal-text-control layout="summary-item" infer="contact-name">
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="contact-email">
        </foxy-internal-text-control>

        <foxy-internal-text-control layout="summary-item" infer="contact-phone">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }
}
