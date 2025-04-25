import type { Data } from './types';
import type { TemplateResult } from 'lit-html';
import type { Rels } from '@foxy.io/sdk/backend';

import { Resource, getResourceId } from '@foxy.io/sdk/core';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const NS = 'transaction-card';
const Base = ConfigurableMixin(TranslatableMixin(InternalCard, NS));

/**
 * Basic card displaying a transaction.
 *
 * @element foxy-transaction-card
 * @since 1.12.0
 */
class TransactionCard extends Base<Data> {
  private __currencyDisplay = '';

  renderBody(): TemplateResult {
    const hiddenSelector = this.hiddenSelector;
    const hasTotal = !hiddenSelector.matches('total', true);
    const hasStatus = !hiddenSelector.matches('status', true);

    return html`
      <div
        aria-busy=${this.in('busy')}
        aria-live="polite"
        class="relative leading-s font-lumo text-m"
      >
        <div class=${classMap({ 'transition-opacity': true, 'opacity-0': !this.data })}>
          ${hasTotal || hasStatus
            ? html`
                <div class="flex items-center justify-between gap-s">
                  ${hasTotal ? this.__renderIdAndTotal() : ''}
                  ${hasStatus ? this.__renderStatus() : ''}
                </div>
              `
            : ''}
          ${hiddenSelector.matches('description', true) ? '' : this.__renderSummary()}
          ${hiddenSelector.matches('customer', true) ? '' : this.__renderCustomer()}
        </div>

        <div
          class=${classMap({
            'pointer-events-none absolute inset-0 flex transition-opacity': true,
            'opacity-0': !!this.data,
          })}
        >
          <foxy-spinner
            data-testid="spinner"
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
            class="m-auto"
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  protected async _sendGet(): Promise<Data> {
    const transaction = await super._sendGet();
    const storeLink = transaction._links['fx:store']?.href;

    if (typeof storeLink === 'string') {
      const store = await super._fetch<Resource<Rels.Store>>(storeLink);
      this.__currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';
    } else {
      this.__currencyDisplay = 'symbol';
    }

    return transaction;
  }

  private __renderIdAndTotal() {
    const data = this.data;
    let content: TemplateResult;

    if (data) {
      const amount = `${data.total_order} ${data.currency_code}`;
      const currencyDisplay = this.__currencyDisplay;
      const options = { amount, currencyDisplay };

      content = html`
        <span class="truncate">ID ${data.display_id || getResourceId(data._links.self.href)}</span>
        ${data.type !== 'updateinfo' && data.type !== 'subscription_cancellation'
          ? html`
              <span>&bull;</span>
              <foxy-i18n .options=${options} infer="" class="whitespace-nowrap" key="price">
              </foxy-i18n>
            `
          : ''}
        ${data?.is_test
          ? html`
              <foxy-i18n
                infer=""
                class="inline-block text-xs font-medium uppercase bg-contrast-5 text-tertiary rounded-s p-xs leading-none tracking-wider"
                key="test"
              >
              </foxy-i18n>
            `
          : ''}
      `;
    } else {
      content = html`&ZeroWidthSpace;`;
    }

    return html`
      <div class="min-w-0" data-testid="total">
        ${this.renderTemplateOrSlot('total:before')}
        <div class="font-medium flex items-center gap-xs">${content}</div>
        ${this.renderTemplateOrSlot('total:after')}
      </div>
    `;
  }

  private __renderStatus() {
    const specialIcons: Record<string, string> = {
      authorized: 'icons:done',
      capturing: 'icons:done',
      captured: 'icons:done',
      approved: 'icons:done',
      pending: 'icons:done',

      completed: 'icons:done-all',

      pending_fraud_review: 'icons:info-outline',
      declined: 'icons:highlight-off',
      rejected: 'icons:highlight-off',
      problem: 'icons:info-outline',

      refunded: 'icons:restore',
      voided: 'icons:remove-circle-outline',
    };

    const specialColors: Record<string, string> = {
      authorized: 'text-success',
      completed: 'text-success',
      capturing: 'text-success',
      captured: 'text-success',
      approved: 'text-success',
      pending: 'text-success',

      pending_fraud_review: 'text-error',
      declined: 'text-error',
      rejected: 'text-error',
      problem: 'text-error',
    };

    const status = this.data?.status || 'completed';
    const source = this.data?.source?.substring(0, 3).toUpperCase();

    return html`
      <div class="flex-shrink-0" data-testid="status">
        ${this.renderTemplateOrSlot('status:before')}

        <div class="text-tertiary text-s flex items-center space-x-xs">
          ${this.data?.hide_transaction
            ? html`
                <vcf-tooltip for="hidden" theme="light" position="top">
                  <foxy-i18n infer="" key="hidden_hint"></foxy-i18n>
                </vcf-tooltip>
                <iron-icon
                  class="icon-inline cursor-default"
                  icon="icons:visibility-off"
                  id="hidden"
                >
                </iron-icon>
              `
            : ''}
          ${source
            ? html`
                <vcf-tooltip for="source" theme="light" position="top">
                  <foxy-i18n infer="" key="source_${source}"></foxy-i18n>
                </vcf-tooltip>
                <span class="cursor-default" id="source">${source}</span>
              `
            : ''}

          <foxy-i18n
            options=${JSON.stringify({ value: this.data?.transaction_date })}
            lang=${this.lang}
            key="time"
            ns=${this.ns}
          >
          </foxy-i18n>

          <iron-icon
            data-testid="status-icon"
            class="icon-inline cursor-default text-l ${specialColors[status] ?? 'text-tertiary'}"
            id="status"
            icon=${specialIcons[status] ?? 'icons:schedule'}
          >
          </iron-icon>

          <vcf-tooltip for="status" theme="light" position="top">
            <foxy-i18n infer="" key="status_${status}"></foxy-i18n>
          </vcf-tooltip>
        </div>

        ${this.renderTemplateOrSlot('status:after')}
      </div>
    `;
  }

  private __renderSummary() {
    const items = this.data?._embedded?.['fx:items'];
    const type = this.data?.type;

    let content: TemplateResult;
    let key: string;

    if (type === 'updateinfo') {
      key = 'summary_payment_method_change';
    } else if (type === 'subscription_modification') {
      key = 'summary_subscription_modification';
    } else if (type === 'subscription_cancellation') {
      key = 'summary_subscription_cancellation';
    } else {
      key = 'summary';
    }

    if (items) {
      const options = {
        count_minus_one: items.length - 1,
        first_item: items[0],
        count: items.length,
      };

      content = html`<foxy-i18n .options=${options} infer="" key=${key}></foxy-i18n>`;
    } else {
      content = html`&ZeroWidthSpace;`;
    }

    return html`
      <div data-testid="description">
        ${this.renderTemplateOrSlot('description:before')}
        <div class="text-s text-secondary truncate">${content}</div>
        ${this.renderTemplateOrSlot('description:after')}
      </div>
    `;
  }

  private __renderCustomer() {
    const data = this.data;
    const content = data
      ? html`${data.customer_first_name} ${data.customer_last_name} (${data.customer_email})`
      : html`&ZeroWidthSpace;`;

    return html`
      <div data-testid="customer">
        ${this.renderTemplateOrSlot('customer:before')}
        <div class="text-tertiary truncate text-s">${content}</div>
        ${this.renderTemplateOrSlot('customer:after')}
      </div>
    `;
  }
}

export { TransactionCard };
