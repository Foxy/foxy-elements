import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Data } from '../../types';
import type { Rels } from '@foxy.io/sdk/backend';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalCartFormTotalsControl extends InternalControl {
  private readonly __storeLoaderId = 'storeLoader';

  renderControl(): TemplateResult {
    const data = this.nucleon?.data as Data | undefined;
    if (!data) return html``;

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

        <span><foxy-i18n infer="" key="total_shipping"></foxy-i18n>&colon;</span>
        <span>${this.__renderPrice(data.total_shipping as unknown as number, true)} </span>

        <span><foxy-i18n infer="" key="total_tax"></foxy-i18n>&colon;</span>
        <span>${this.__renderPrice(data.total_tax as unknown as number, true)}</span>
        ${data?._embedded?.['fx:gift_card_code_logs']?.map(code => {
          // @ts-expect-error deep zoom is not supported by the SDK types
          const name = code._embedded['fx:gift_card'].name;
          return html`
            <span>${name}&colon;</span>
            <span>${this.__renderPrice(code.balance_adjustment ?? 0, true)}</span>
          `;
        })}
        ${data?._embedded?.['fx:discounts']?.map(discount => {
          return html`
            <span data-testclass="discount">${discount.name}&colon;</span>
            <span>${this.__renderPrice(discount.amount, true)}</span>
          `;
        })}

        <span class="col-span-2 border-t border-dashed border-contrast-20 my-s"></span>

        <span class="col-span-2 flex gap-s justify-between items-center">
          <span></span>
          <span class="text-xl font-medium leading-xs">
            <foxy-i18n infer="" key="total"></foxy-i18n>&colon;
            ${this.__renderPrice(data.total_order)}
          </span>
        </span>
      </p>
    `;
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
}
