import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

/**
 * Basic card displaying webhook log (`fx:webhook_log`) info.
 *
 * @element foxy-webhook-log-card
 * @since 1.17.0
 */
export class WebhookLogCard extends TranslatableMixin(InternalCard, 'webhook-log-card')<Data> {
  renderBody(): TemplateResult {
    const { date_created, response_code, response_body } = this.data ?? {};

    return html`
      <div class="leading-none space-y-xs">
        <p class="flex justify-between items-center font-semibold">
          <foxy-i18n .options=${{ value: date_created }} infer="" key="date"></foxy-i18n>
          <span class="inline-block text-xs bg-contrast-5 text-secondary rounded p-xs">
            ${response_code}&ZeroWidthSpace;
          </span>
        </p>

        <p class="text-tertiary">${response_body}&ZeroWidthSpace;</p>
      </div>
    `;
  }
}
