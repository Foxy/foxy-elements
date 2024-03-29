import type { Data, Templates } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'gift-card-code-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating or editing gift card codes (`fx:gift_card_code`).
 *
 * @slot code:before
 * @slot code:after
 *
 * @slot current-balance:before
 * @slot current-balance:after
 *
 * @slot end-date:before
 * @slot end-date:after
 *
 * @slot logs:before
 * @slot logs:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @element foxy-gift-card-code-form
 * @since 1.15.0
 */
export class GiftCardCodeForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ code: v }) => !!v || 'code:v8n_required',
      ({ code: v }) => !v || v.length <= 50 || 'code:v8n_too_long',
      ({ code: v }) => !v?.includes(' ') || 'code:v8n_has_spaces',
      ({ current_balance: v }) => typeof v === 'number' || 'current-balance:v8n_required',
    ];
  }

  templates: Templates = {};

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];
    if (!this.href) alwaysMatch.push('cart-item', 'logs');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-text-control infer="code"></foxy-internal-text-control>
      <foxy-internal-number-control infer="current-balance"></foxy-internal-number-control>
      <foxy-internal-date-control infer="end-date"></foxy-internal-date-control>

      <foxy-internal-gift-card-code-form-item-control infer="cart-item">
      </foxy-internal-gift-card-code-form-item-control>

      <foxy-internal-async-list-control
        infer="logs"
        first=${ifDefined(this.data?._links?.['fx:gift_card_code_logs'].href)}
        limit="5"
        item="foxy-gift-card-code-log-card"
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}
    `;
  }
}
