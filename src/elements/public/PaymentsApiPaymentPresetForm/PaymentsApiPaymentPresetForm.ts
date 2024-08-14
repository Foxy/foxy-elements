import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';

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

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['header:copy-json', super.hiddenSelector.toString()];
    if (!this.data) alwaysMatch.unshift('payment-methods', 'fraud-protections');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="description">
        </foxy-internal-text-control>
        <foxy-internal-switch-control infer="is-live"></foxy-internal-switch-control>
        <foxy-internal-switch-control infer="is-purchase-order-enabled">
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
        .formProps=${{ '.getImageSrc': this.getPaymentMethodImageSrc }}
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
    `;
  }
}
