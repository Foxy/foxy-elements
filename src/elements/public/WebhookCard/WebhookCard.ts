import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';
import { TranslatableMixin } from '../../../mixins/translatable';

/**
 * Basic card displaying webhook (`fx:webhook`) info.
 *
 * @element foxy-webhook-card
 * @since 1.17.0
 */
export class WebhookCard extends TranslatableMixin(InternalCard, 'webhook-card')<Data> {
  renderBody(): TemplateResult {
    return html`
      <div class="grid grid-cols-1 leading-s -my-xs">
        <p class="text-m truncate text-body font-medium">${this.data?.name}&ZeroWidthSpace;</p>
        <p class="text-s truncate text-secondary">${this.data?.url}&ZeroWidthSpace;</p>
        <p class="text-s truncate text-tertiary">
          ${this.data?.format} &bull; ${this.data?.event_resource}&ZeroWidthSpace;
        </p>
      </div>
    `;
  }
}
