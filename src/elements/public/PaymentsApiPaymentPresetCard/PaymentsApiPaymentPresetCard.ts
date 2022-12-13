import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const NS = 'payments-api-payment-preset-card';
const Base = TranslatableMixin(TwoLineCard, NS);

export class PaymentsApiPaymentPresetCard extends Base<Data> {
  render(): TemplateResult {
    return super.render({
      title: data => html`${data.description}`,
      subtitle: ({ is_live: isLive }) => html`
        <foxy-i18n
          class=${classMap({ 'text-success': isLive })}
          infer=""
          key="status_${isLive ? 'live' : 'test'}"
        >
        </foxy-i18n>
      `,
    });
  }
}
