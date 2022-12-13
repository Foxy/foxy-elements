import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const NS = 'payments-api-payment-preset-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Card element representing a `fx:payment_preset` resource of Payments API.
 *
 * _Payments API is a client-side virtual API layer built on top of hAPI
 * in an attempt to streamline access to stores' payment method settings
 * that is currently a bit quirky due to the legacy functionality. To use
 * this element with hAPI, wrap it into a foxy-payments-api node._
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-payments-api-payment-preset-card
 * @since 1.21.0
 */
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
