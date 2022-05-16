import type { CSSResultArray, TemplateResult } from 'lit-element';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { css, html } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { BooleanSelector } from '@foxy.io/sdk/core';

export class Transaction extends TranslatableMixin(InternalForm, 'transaction')<Data> {
  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        #body {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(calc(18.75 * var(--lumo-space-m)), 1fr));
        }

        #body > :first-child {
          grid-column-start: 1;
          grid-column-end: -2;
        }
      `,
    ];
  }

  get readonlySelector(): BooleanSelector {
    const isEditable = Boolean(this.data?._links['fx:void'] ?? this.data?._links['fx:refund']);
    return isEditable
      ? super.readonlySelector
      : new BooleanSelector(`${super.readonlySelector} attributes custom-fields`);
  }

  renderBody(): TemplateResult {
    return html`
      <div id="body" class="gap-m">
        <foxy-internal-async-details-control
          infer="shipments"
          first=${ifDefined(this.data?._links['fx:shipments'].href)}
          item="foxy-shipment-card"
          open
        >
        </foxy-internal-async-details-control>

        <div class="grid gap-m self-start">
          <foxy-internal-transaction-summary-control infer="summary">
          </foxy-internal-transaction-summary-control>

          <foxy-internal-transaction-customer-control infer="customer">
          </foxy-internal-transaction-customer-control>

          <foxy-internal-async-details-control
            infer="payments"
            class="max-w-full overflow-hidden"
            first=${ifDefined(this.data?._links['fx:payments'].href)}
            limit="1"
            item="foxy-payment-card"
            open
          >
          </foxy-internal-async-details-control>

          <foxy-internal-async-details-control
            infer="discounts"
            first=${ifDefined(this.data?._links['fx:discounts'].href)}
            limit="5"
            item="foxy-discount-card"
          >
          </foxy-internal-async-details-control>

          <foxy-internal-async-details-control
            infer="applied-taxes"
            first=${ifDefined(this.data?._links['fx:applied_taxes'].href)}
            limit="5"
            item="foxy-applied-tax-card"
          >
          </foxy-internal-async-details-control>

          <foxy-internal-async-details-control
            related=${JSON.stringify([this.href])}
            infer="custom-fields"
            first=${ifDefined(this.data?._links['fx:custom_fields'].href)}
            limit="5"
            form="foxy-custom-field-form"
            item="foxy-custom-field-card"
          >
          </foxy-internal-async-details-control>

          <foxy-internal-async-details-control
            related=${JSON.stringify([this.href])}
            infer="attributes"
            first=${ifDefined(this.data?._links['fx:attributes'].href)}
            limit="5"
            form="foxy-attribute-form"
            item="foxy-attribute-card"
          >
          </foxy-internal-async-details-control>

          <foxy-internal-transaction-actions-control infer="actions">
          </foxy-internal-transaction-actions-control>
        </div>
      </div>
    `;
  }
}
