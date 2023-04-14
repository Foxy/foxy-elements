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
  renderBody(): TemplateResult {
    const status = this.data?.status;

    return html`
      <p class="flex justify-between items-center leading-none">
        <foxy-i18n
          .options=${{ value: this.data?.date_created }}
          class="font-medium"
          infer=""
          key="date"
        >
        </foxy-i18n>

        <foxy-i18n
          class=${classMap({
            'text-error': status === 'failed',
            'text-tertiary': status === 'pending',
            'text-success': status === 'successful',
          })}
          infer=""
          key="status_${status}"
        >
        </foxy-i18n>
      </p>
    `;
  }
}
