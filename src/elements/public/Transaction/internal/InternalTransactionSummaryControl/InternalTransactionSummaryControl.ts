import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Data } from '../../types';
import type { Rels } from '@foxy.io/sdk/backend';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalTransactionSummaryControl extends InternalControl {
  private readonly __storeLoaderId = 'storeLoader';

  renderControl(): TemplateResult {
    const data = this.nucleon?.data as Data | undefined;
    if (!data) return html``;

    const taxes = data?._embedded?.['fx:applied_taxes'] ?? [];
    const shipments = data._embedded?.['fx:shipments'] ?? [];
    const refundableAmount = this.__refundableAmount;

    return html`
      <foxy-nucleon
        infer=""
        href=${ifDefined(this.__storeHref)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <p
        class="grid gap-x-s text-right text-s leading-m border-dashed border rounded border-contrast-20 whitespace-nowrap overflow-auto"
        style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 2px); grid-template-columns: 1fr min-content"
      >
        <span><foxy-i18n key="subtotal" infer=""></foxy-i18n>&colon;</span>
        <span>${this.__renderPrice(data.total_item_price as unknown as number)}</span>

        ${shipments.length === 0 || (data.total_shipping as unknown as number) === 0
          ? html`
              <span><foxy-i18n infer="" key="total_shipping"></foxy-i18n>&colon;</span>
              <span>${this.__renderPrice(data.total_shipping as unknown as number, true)} </span>
            `
          : shipments.map(shipment => {
              return html`
                <span>${shipment.shipping_service_description}&colon;</span>
                <span>${this.__renderPrice(shipment.total_shipping, true)}</span>
              `;
            })}
        ${taxes.length === 0 || (data.total_tax as unknown as number) === 0
          ? html`
              <span><foxy-i18n infer="" key="total_tax"></foxy-i18n>&colon;</span>
              <span>${this.__renderPrice(data.total_tax as unknown as number, true)}</span>
            `
          : taxes.map(tax => {
              return html`
                <span>${tax.name}&colon;</span>
                <span>${this.__renderPrice(tax.amount, true)}</span>
              `;
            })}
        ${data?._embedded?.['fx:gift_card_code_logs']?.map(log => {
          // @ts-expect-error deep zoom is not supported by the SDK types
          const name = log._embedded?.['fx:gift_card']?.name;
          // @ts-expect-error deep zoom is not supported by the SDK types
          const code = log._embedded?.['fx:gift_card_code']?.code;

          if (name && code) {
            return html`
              <span data-testclass="gift-card-code">${name} &bull; ${code}&colon;</span>
              <span>${this.__renderPrice(log.balance_adjustment ?? 0, true)}</span>
            `;
          }
        })}
        ${data?._embedded?.['fx:discounts']?.map(({ name, code: c, amount }) => {
          return html`
            <span data-testclass="discount">${name}${c ? html` &bull; ${c}` : ''}&colon;</span>
            <span>${this.__renderPrice(amount, true)}</span>
          `;
        })}

        <span class="col-span-2 border-t border-dashed border-contrast-20 my-s"></span>

        <span class="col-span-2 flex gap-s justify-between items-center">
          ${this.__renderStatus()}
          <span class="text-xl font-medium leading-xs">
            <foxy-i18n infer="" key="total"></foxy-i18n>&colon;
            ${this.__renderPrice(data.total_order)}
          </span>
        </span>

        ${refundableAmount !== data.total_order
          ? html`
              <span class="col-span-2 border-t border-dashed border-contrast-20 my-s"></span>
              <span class="col-span-2 flex justify-end">
                <span>
                  <span class="text-xl font-medium leading-xs">
                    <foxy-i18n infer="" key="refundable_amount"></foxy-i18n>&colon;
                    ${this.__renderPrice(refundableAmount)}
                  </span>
                  <br />
                  <foxy-i18n
                    class="inline-block whitespace-normal leading-s text-tertiary"
                    style="max-width: 48ch"
                    infer=""
                    key="refundable_amount_note"
                  >
                  </foxy-i18n>
                </span>
              </span>
            `
          : ''}
      </p>
    `;
  }

  private get __refundableAmount(): number {
    const data = this.nucleon?.data as Data | undefined;
    const originalTotal = data?.total_order ?? 0;
    // @ts-expect-error SDK types do not include amount on fx:refund
    return parseFloat(data?._links['fx:refund']?.amount ?? originalTotal);
  }

  private get __storeHref() {
    return this.nucleon?.data?._links['fx:store']?.href as string | undefined;
  }

  private get __store() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    const selector = `#${this.__storeLoaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private __renderPrice(amount: number, isAdditive = false) {
    const currencyDisplay = this.__store?.use_international_currency_symbol ? 'code' : 'symbol';
    const currencyCode = this.nucleon?.data?.currency_code as string | undefined;

    return html`
      <foxy-i18n
        class=${isAdditive && amount !== 0 ? (amount > 0 ? 'text-success' : 'text-error') : ''}
        infer=""
        key="price"
        .options=${{
          currencyDisplay,
          signDisplay: isAdditive ? 'exceptZero' : 'auto',
          amount: `${amount} ${currencyCode}`,
        }}
      >
      </foxy-i18n>
    `;
  }

  private __renderStatus() {
    const status = this.nucleon?.data?.status || 'completed';
    let color = '';

    if (['capturing', 'captured', 'approved', 'authorized', 'pending'].includes(status)) {
      color = 'text-success bg-success-10';
    } else if (!status || status === 'completed') {
      color = 'text-success-contrast bg-success';
    } else if (['problem', 'pending_fraud_review', 'rejected', 'declined'].includes(status)) {
      color = 'text-error-contrast bg-error';
    } else {
      color = 'bg-contrast-5 text-body';
    }

    return html`
      <foxy-i18n
        infer=""
        class="${color} rounded-s py-xs px-s font-medium text-s leading-xs"
        key="status_${status}"
      ></foxy-i18n>
    `;
  }
}
