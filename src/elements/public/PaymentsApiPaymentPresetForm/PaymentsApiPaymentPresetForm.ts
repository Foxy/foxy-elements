import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Data } from './types';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'payments-api-payment-preset-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for the `fx:payment_preset` resource of Payments API.
 *
 * _Payments API is a client-side virtual API layer built on top of hAPI
 * in an attempt to streamline access to stores' payment method settings
 * that is currently a bit quirky due to the legacy functionality. To use
 * this element with hAPI, wrap it into a foxy-payments-api node._
 *
 * @element foxy-payments-api-payment-preset-form
 * @since 1.21.0
 */
export class PaymentsApiPaymentPresetForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getFraudProtectionImageSrc: { attribute: false },
      getPaymentMethodImageSrc: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ description: v }) => !!v || 'description:v8n_required',
      ({ description: v }) => (v && v.length <= 100) || 'description:v8n_too_long',
    ];
  }

  /** A function that returns image URL for given fraud protection `type`. */
  getFraudProtectionImageSrc: ((type: string) => string) | null = null;

  /** A function that returns image URL for given payment method `type`. */
  getPaymentMethodImageSrc: ((type: string) => string) | null = null;

  private readonly __storeLoaderId = 'storeLoader';

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];

    if (!this.__storeLoader?.data?.is_active) {
      alwaysMatch.unshift('general:is-live', 'general:is-purchase-order-enabled');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['header:copy-json', super.hiddenSelector.toString()];
    const store = this.__storeLoader?.data;

    if (!this.data) alwaysMatch.unshift('payment-methods', 'fraud-protections');
    if (!store) alwaysMatch.unshift('general:is-live', 'general:is-purchase-order-enabled');

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    const isStoreActive = !!this.__storeLoader?.data?.is_active;
    const helperTextSuffix = isStoreActive ? '' : '_inactive_store';

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="description">
        </foxy-internal-text-control>

        <foxy-internal-switch-control
          helper-text=${this.t(`general.is-live.helper_text${helperTextSuffix}`)}
          infer="is-live"
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control
          helper-text=${this.t(`general.is-purchase-order-enabled.helper_text${helperTextSuffix}`)}
          infer="is-purchase-order-enabled"
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-async-list-control
        infer="payment-methods"
        first=${ifDefined(this.data?._links['fx:payment_methods'].href)}
        limit="5"
        item="foxy-payments-api-payment-method-card"
        form="foxy-payments-api-payment-method-form"
        alert
        .itemProps=${{ '.getImageSrc': this.getPaymentMethodImageSrc }}
        .formProps=${{
          '.getImageSrc': this.getPaymentMethodImageSrc,
          'payment-preset': this.href,
          'store': this.data?._links['fx:store'].href,
        }}
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        infer="fraud-protections"
        first=${ifDefined(this.data?._links['fx:fraud_protections'].href)}
        limit="5"
        item="foxy-payments-api-fraud-protection-card"
        form="foxy-payments-api-fraud-protection-form"
        alert
        .itemProps=${{ '.getImageSrc': this.getFraudProtectionImageSrc }}
        .formProps=${{ '.getImageSrc': this.getFraudProtectionImageSrc }}
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.data?._links['fx:store'].href)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__storeLoaderId}`);
  }
}
