import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'admin-subscription-form';
const Base = TranslatableMixin(InternalForm, NS);

export class AdminSubscriptionForm extends Base<Data> {
  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['delete', super.hiddenSelector.toString()];
    if (!this.data?.error_message) alwaysMatch.unshift('error-message');
    if (!this.data?.is_active) alwaysMatch.unshift('view-action', 'cancel-action');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    return { context: this.data?.is_active ? 'active' : 'inactive' };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderHeaderActions(data: Data): TemplateResult {
    return html`
      <foxy-internal-admin-subscription-form-load-in-cart-action infer="view-action">
      </foxy-internal-admin-subscription-form-load-in-cart-action>
      <foxy-internal-admin-subscription-form-load-in-cart-action
        action="cancel"
        infer="cancel-action"
      >
      </foxy-internal-admin-subscription-form-load-in-cart-action>
    `;
  }

  renderBody(): TemplateResult {
    let transactionsHref: string | undefined;

    try {
      const url = new URL(this.data?._links['fx:transactions'].href ?? '');
      url.searchParams.set('zoom', 'items');
      transactionsHref = url.toString();
    } catch {
      transactionsHref = undefined;
    }

    return html`
      ${this.renderHeader()}

      <foxy-internal-admin-subscription-form-error infer="error-message">
      </foxy-internal-admin-subscription-form-error>

      <foxy-internal-summary-control infer="general">
        <foxy-internal-date-control layout="summary-item" infer="start-date">
        </foxy-internal-date-control>
        <foxy-internal-frequency-control
          layout="summary-item"
          infer="frequency"
          allow-twice-a-month
        >
        </foxy-internal-frequency-control>
        <foxy-internal-date-control layout="summary-item" infer="next-transaction-date">
        </foxy-internal-date-control>
        <foxy-internal-date-control layout="summary-item" infer="end-date">
        </foxy-internal-date-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="overdue">
        <foxy-internal-number-control
          layout="summary-item"
          suffix=${ifDefined(this.data?._embedded['fx:transaction_template'].currency_code)}
          infer="past-due-amount"
          min="0"
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      ${this.renderTemplateOrSlot()}

      <foxy-internal-async-list-control
        infer="attributes"
        class="min-w-0"
        first=${ifDefined(this.data?._links?.['fx:attributes'].href)}
        item="foxy-attribute-card"
        form="foxy-attribute-form"
        alert
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        infer="transactions"
        class="min-w-0"
        first=${ifDefined(transactionsHref)}
        item="foxy-transaction-card"
        form="foxy-transaction"
        hide-create-button
        hide-delete-button
        alert
        wide
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}
    `;
  }
}
