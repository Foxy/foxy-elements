import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const NS = 'payments-api-payment-preset-card';
const Base = TranslatableMixin(InternalCard, NS);

export class PaymentsApiPaymentPresetCard extends Base<Data> {
  renderBody(): TemplateResult {
    return html`
      <div class="flex items-center justify-between">
        <div class="font-semibold">
          <foxy-i18n infer="" class="sr-only" key="description_title"></foxy-i18n>
          <span>${this.data?.description}&ZeroWidthSpace;</span>
        </div>

        <div
          class=${classMap({
            'uppercase text-xs font-bold tracking-wide rounded-t-l rounded-b-l px-s py-xs': true,
            'bg-success-10 text-success': !!this.data?.is_live,
            'bg-contrast-5': !this.data?.is_live,
          })}
        >
          <foxy-i18n class="sr-only" infer="" key="status_title"></foxy-i18n>
          <foxy-i18n infer="" key="status_${this.data?.is_live ? 'live' : 'test'}"></foxy-i18n>
        </div>
      </div>
    `;
  }
}
