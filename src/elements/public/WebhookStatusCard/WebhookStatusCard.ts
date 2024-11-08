import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';
import { classMap } from '../../../utils/class-map';

const NS = 'webhook-status-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Basic card displaying webhook status (`fx:webhook_status`) info.
 *
 * @element foxy-webhook-status-card
 * @since 1.17.0
 */
export class WebhookStatusCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      layout: {},
    };
  }

  /** When set to "resource", doesn't render resource type and ID. */
  layout: null | 'resource' = null;

  renderBody(): TemplateResult {
    const { resource_type: type, date_created: date, resource_id: id, status } = this.data ?? {};

    return html`
      <div class="leading-none space-y-xs">
        <p class="flex justify-between items-center">
          <foxy-i18n .options=${{ value: date }} class="font-medium" infer="" key="date">
          </foxy-i18n>
          ${this.layout === 'resource'
            ? ''
            : html`<span class="text-xs text-tertiary capitalize">${type} #${id}</span>`}
        </p>
        <p
          class=${classMap({
            'text-secondary': status === 'pending',
            'text-success': status === 'successful',
            'text-error': status === 'failed',
            'text-s': true,
          })}
        >
          <foxy-i18n infer="" key="status_${status}"></foxy-i18n>
        </p>
      </div>
    `;
  }
}
