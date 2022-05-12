import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

export class WebhookLogCard extends TranslatableMixin(InternalCard, 'webhook-log-card')<Data> {
  renderBody(): TemplateResult {
    return html`
      <div class="leading-none space-y-xs">
        <p class="flex justify-between items-center font-semibold">
          <foxy-i18n .options=${{ value: this.data?.date_created }} infer="" key="date">
          </foxy-i18n>

          <span class="inline-block text-xs bg-contrast-5 text-secondary rounded p-xs">
            ${this.data?.response_code}&ZeroWidthSpace;
          </span>
        </p>

        <p class="text-tertiary">${this.data?.response_body}&ZeroWidthSpace;</p>
      </div>
    `;
  }
}
