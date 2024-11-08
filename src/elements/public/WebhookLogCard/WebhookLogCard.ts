import type { PropertyDeclarations } from 'lit-element';
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
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      layout: {},
    };
  }

  /** When set to "resource", doesn't render resource type and ID. */
  layout: null | 'resource' = null;

  renderBody(): TemplateResult {
    const {
      response_body: body,
      response_code: code,
      resource_type: type,
      date_created: date,
      resource_id: id,
    } = this.data ?? {};

    return html`
      <div class="leading-none space-y-xs">
        <p class="flex justify-between items-center">
          <foxy-i18n .options=${{ value: date }} class="font-medium" infer="" key="date">
          </foxy-i18n>
          ${this.layout === 'resource'
            ? ''
            : html`<span class="text-xs text-tertiary capitalize">${type} #${id}</span>`}
        </p>
        <p class="text-secondary text-s">HTTP ${code} &bull; ${body}</p>
      </div>
    `;
  }
}
