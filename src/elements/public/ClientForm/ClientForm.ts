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
  get readonlySelector(): BooleanSelector {
    const alwaysMatch = ['client-secret'];
    if (this.data || this.in({ busy: 'fetching' })) alwaysMatch.push('client-id');
    return new BooleanSelector(`${alwaysMatch.join(' ')} ${super.readonlySelector.toString()}`);
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch: string[] = [];
    if (!this.data && !this.in({ busy: 'fetching' })) alwaysMatch.push('client-secret');
    return new BooleanSelector(`${alwaysMatch.join(' ')} ${super.hiddenSelector.toString()}`);
  }

  renderBody(): TemplateResult {
    return html`
      <div class="grid grid-cols-2 gap-m">
        <foxy-internal-text-control class="col-span-2" infer="client-id">
        </foxy-internal-text-control>

        <foxy-internal-text-control class="col-span-2" infer="client-secret">
        </foxy-internal-text-control>

        <foxy-internal-text-control class="col-span-2" infer="redirect-uri">
        </foxy-internal-text-control>

        <foxy-internal-text-control class="col-span-2" infer="project-name">
        </foxy-internal-text-control>

        <foxy-internal-text-area-control class="col-span-2" infer="project-description">
        </foxy-internal-text-area-control>

        <foxy-internal-text-control infer="company-name"></foxy-internal-text-control>
        <foxy-internal-text-control infer="company-url"></foxy-internal-text-control>

        <foxy-internal-text-control class="col-span-2" infer="company-logo">
        </foxy-internal-text-control>

        <foxy-internal-text-control class="col-span-2" infer="contact-name">
        </foxy-internal-text-control>

        <foxy-internal-text-control infer="contact-email"></foxy-internal-text-control>
        <foxy-internal-text-control infer="contact-phone"></foxy-internal-text-control>
      </div>

      ${super.renderBody()}
    `;
  }
}
