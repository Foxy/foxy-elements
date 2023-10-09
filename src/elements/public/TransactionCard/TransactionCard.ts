import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const NS = 'transaction-card';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Basic card displaying a transaction.
 *
 * @slot total:before
 * @slot total:after
 * @slot status:before
 * @slot status:after
 * @slot description:before
 * @slot description:after
 * @slot customer:before
 * @slot customer:after
 *
 * @element foxy-transaction-card
 * @since 1.12.0
 */
class TransactionCard extends Base<Data> {
  templates: Templates = {};

  private __currencyDisplay = '';

  render(): TemplateResult {
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
                <div class="flex items-center justify-between">
                  ${hasTotal ? this.__renderTotal() : ''} ${hasStatus ? this.__renderStatus() : ''}
                </div>
              `
            : ''}
          ${hiddenSelector.matches('description', true) ? '' : this.__renderDescription()}
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

  private __renderTotal() {
    const data = this.data;
    let content: TemplateResult;

    if (data) {
      const amount = `${data.total_order} ${data.currency_code}`;
      const currencyDisplay = this.__currencyDisplay;
      const apiTypes = [
        'subscription_cancellation',
        'subscription_modification',
        'subscription_renewal',
        'updateinfo',
      ];

      const type = apiTypes.includes(data.type)
        ? data.type
        : 'fx:subscription' in data._links
        ? 'new_subscription'
        : 'new_order';

      content = html`
        <foxy-i18n lang=${this.lang} key="type_${type}" ns=${this.ns}></foxy-i18n>
        <span> &bull; </span>
        <foxy-i18n
          options=${JSON.stringify({ amount, currencyDisplay })}
          lang=${this.lang}
          key="price"
          ns=${this.ns}
        >
        </foxy-i18n>
      `;
    } else {
      content = html`&ZeroWidthSpace;`;
    }

    return html`
      <div data-testid="total">
        ${this.renderTemplateOrSlot('total:before')}
        <div class="font-medium truncate">${content}</div>
        ${this.renderTemplateOrSlot('total:after')}
      </div>
    `;
  }

  private __renderStatus() {
    const specialIcons: Record<string, string> = {
      completed: 'icons:done-all',
      refunded: 'icons:restore',
      rejected: 'icons:highlight-off',
      declined: 'icons:highlight-off',
      voided: 'icons:remove-circle-outline',
    };

    const specialColors: Record<string, string> = {
      completed: 'text-success',
      rejected: 'text-error',
      declined: 'text-error',
    };

    const status = this.data?.status || 'completed';
    const source = this.data?.source.substring(0, 3).toUpperCase();

    return html`
      <div data-testid="status">
        ${this.renderTemplateOrSlot('status:before')}

        <div class="text-tertiary text-s flex items-center space-x-s">
          ${source
            ? html`
                <div class="bg-contrast-5 rounded-s px-xs" title=${this.t(`source_${source}`)}>
                  ${source}
                </div>
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
            class="icon-inline text-l ${specialColors[status] ?? 'text-tertiary'}"
            title=${this.t(`transaction_${status}`)}
            icon=${specialIcons[status] ?? 'icons:schedule'}
          >
          </iron-icon>
        </div>

        ${this.renderTemplateOrSlot('status:after')}
      </div>
    `;
  }

  private __renderDescription() {
    const items = this.data?._embedded?.['fx:items'];
    let content: TemplateResult;

    if (items) {
      const options = {
        most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
        count_minus_one: items.length - 1,
        count: items.length,
      };

      content = html`
        <foxy-i18n
          options=${JSON.stringify(options)}
          lang=${this.lang}
          key="transaction_summary"
          ns=${this.ns}
        >
        </foxy-i18n>
      `;
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
