import * as logos from '../PaymentMethodCard/logos';

import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, 'payment-card')));

/**
 * Basic card displaying a payment.
 *
 * Note: payment gateway names need to be loaded separately. You can obtain
 * them from `fx:property_helpers` using your own Backend API proxy or just hardcode the values
 * you need. Once you have the gateway names, call `I18n.setGateways(names)`.
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @slot card-info:before
 * @slot card-info:after
 *
 * @slot fraud-risk:before
 * @slot fraud-risk:after
 *
 * @slot processor-response:before
 * @slot processor-response:after
 *
 * @element foxy-payment-card
 * @since 1.11.0
 */
export class PaymentCard extends Base<Data> {
  templates: Templates = {};

  private __currencyDisplay = '';

  private __currency = '';

  render(): TemplateResult {
    const hidden = this.hiddenSelector;
    const isCardInfoHidden = hidden.matches('card-info', true);
    const isFraudRiskHidden = hidden.matches('fraud-risk', true);

    return html`
      <div
        aria-busy=${!this.data && this.in('busy')}
        aria-live="polite"
        class="relative text-body text-s font-lumo leading-m focus-outline-none"
      >
        <div
          class=${classMap({
            'relative transition duration-250 ease-in-out': true,
            'opacity-0 pointer-events-none': !this.data,
          })}
        >
          ${hidden.matches('title', true) ? '' : this.__renderTitle()}
          ${hidden.matches('subtitle', true) ? '' : this.__renderSubtitle()}
          ${isCardInfoHidden && isFraudRiskHidden
            ? ''
            : html`
                <div class="my-s flex space-x-s">
                  ${isCardInfoHidden ? '' : this.__renderCardInfo()}
                  ${isFraudRiskHidden ? '' : this.__renderFraudRisk()}
                </div>
              `}
          ${hidden.matches('processor-response', true) ? '' : this.__renderProcessorResponse()}
        </div>

        <div
          class=${classMap({
            'transition duration-250 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !!this.data,
          })}
        >
          <foxy-spinner
            data-testid="spinner"
            class="m-auto"
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  protected async _sendGet(): Promise<Data> {
    type Transaction = Resource<Rels.Transaction>;
    type Store = Resource<Rels.Store>;

    const payment = await super._sendGet();
    const [transaction, store] = await Promise.all([
      super._fetch<Transaction>(payment._links['fx:transaction'].href),
      super._fetch<Store>(payment._links['fx:store'].href),
    ]);

    this.__currency = transaction.currency_code;
    this.__currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';

    return payment;
  }

  private __renderTitle() {
    const key = this.data ? `gateways.${this.data.gateway_type}` : '';
    const ns = `${this.ns} gateways`;

    return html`
      <div class="text-s flex text-secondary">
        ${this.renderTemplateOrSlot('title:before')}
        <foxy-i18n lang=${this.lang} key=${key} ns=${ns}></foxy-i18n>&ZeroWidthSpace;
        ${this.renderTemplateOrSlot('title:after')}
      </div>
    `;
  }

  private __renderSubtitle() {
    const amount = `${this.data?.amount ?? ''} ${this.__currency}`;
    const amountOptions = JSON.stringify({ amount, currencyDisplay: this.__currencyDisplay });

    const date = this.data?.date_created ?? '';
    const dateOptions = JSON.stringify({ value: date });

    const lang = this.lang;
    const ns = this.ns;

    return html`
      <div class="flex font-semibold text-s">
        ${this.renderTemplateOrSlot('subtitle:before')}

        <foxy-i18n options=${amountOptions} lang=${lang} key="price" ns=${ns}></foxy-i18n>
        <span>&nbsp;&bull;&nbsp;</span>
        <foxy-i18n options=${dateOptions} lang=${lang} key="date" ns=${ns}></foxy-i18n>

        ${this.renderTemplateOrSlot('subtitle:after')}
      </div>
    `;
  }

  private __renderCardInfo() {
    const data = this.data;
    const type = (data?.cc_type ?? 'unknown').toLowerCase() as keyof typeof logos;
    const year = data?.cc_exp_year?.substring(2);
    const month = data?.cc_exp_month;
    const last4Digits = data?.cc_number_masked?.replace(/x/gi, '');

    if (!month || !year || !last4Digits) return;

    return html`
      <div class="flex">
        ${this.renderTemplateOrSlot('card-info:before')}

        <div class="truncate flex items-center h-s rounded overflow-hidden bg-contrast-5">
          <div class="h-s">${logos[type] ?? logos.unknown}</div>
          <div class="text-s font-semibold px-s">•••• ${last4Digits} ${month}/${year}</div>
        </div>

        ${this.renderTemplateOrSlot('card-info:after')}
      </div>
    `;
  }

  private __renderFraudRisk() {
    const score = this.data?.fraud_protection_score ?? 0;
    const color = score > 0 ? 'text-error' : 'text-success';
    const background = score > 0 ? 'bg-error-10' : 'bg-success-10';

    return html`
      <div class="flex">
        ${this.renderTemplateOrSlot('fraud-risk:before')}

        <foxy-i18n
          options=${JSON.stringify({ score })}
          class="truncate flex font-semibold h-s items-center px-s rounded text-s ${color} ${background}"
          lang=${this.lang}
          key="fraud_risk"
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('fraud-risk:after')}
      </div>
    `;
  }

  private __renderProcessorResponse() {
    return html`
      <div class="text-s text-tertiary">
        ${this.renderTemplateOrSlot('processor-response:before')}
        ${this.data?.processor_response}&ZeroWidthSpace;
        ${this.renderTemplateOrSlot('processor-response:after')}
      </div>
    `;
  }
}
