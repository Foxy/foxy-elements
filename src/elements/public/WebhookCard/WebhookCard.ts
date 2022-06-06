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
      <div class="grid grid-cols-1 gap-s leading-none">
        <p class="flex justify-between items-center font-semibold">
          <span class="truncate">${this.data?.name}&ZeroWidthSpace;</span>
          <span class="inline-block text-xs bg-contrast-5 rounded p-xs flex-shrink-0">
            ${this.data?.format.toUpperCase()}&ZeroWidthSpace;
          </span>
        </p>

        <div class="flex items-center gap-s text-secondary">
          <iron-icon class="icon-inline flex-shrink-0" icon="icons:language"></iron-icon>
          <p class="truncate">${this.data?.url}&ZeroWidthSpace;</p>
        </div>

        <div class="flex items-center gap-s text-secondary">
          <iron-icon class="icon-inline flex-shrink-0" icon="icons:settings-input-antenna">
          </iron-icon>
          <p class="truncate">${this.data?.event_resource}&ZeroWidthSpace;</p>
        </div>
      </div>
    `;
  }
}
