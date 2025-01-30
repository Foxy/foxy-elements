import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';
import { PropertyDeclarations } from 'lit-element';

const NS = 'admin-subscription-form';
const Base = TranslatableMixin(InternalForm, NS);

export class AdminSubscriptionForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      uoeSettingsPage: { attribute: 'uoe-settings-page' },
    };
  }

  /** URL of the UOE settings page in the admin. If set, displays a link to that page in the self-service links section. */
  uoeSettingsPage: string | null = null;

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['delete', super.hiddenSelector.toString()];
    if (!this.data?.error_message) alwaysMatch.unshift('error-message');
    if (!this.data?.is_active) alwaysMatch.unshift('view-action', 'cancel-action');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    return { context: this.data?.is_active ? 'active' : 'inactive' };
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

      <foxy-internal-summary-control infer="self-service-links">
        <foxy-internal-admin-subscription-form-link-control infer="load-in-cart">
        </foxy-internal-admin-subscription-form-link-control>

        <foxy-internal-admin-subscription-form-link-control
          search="cart=checkout"
          infer="load-on-checkout"
        >
        </foxy-internal-admin-subscription-form-link-control>

        <foxy-internal-admin-subscription-form-link-control
          search="sub_cancel=next_transaction_date"
          infer="cancel-at-end-of-billing-period"
        >
        </foxy-internal-admin-subscription-form-link-control>

        <foxy-internal-admin-subscription-form-link-control
          search="sub_cancel=true"
          infer="cancel-next-day"
        >
        </foxy-internal-admin-subscription-form-link-control>

        <p class="text-s text-secondary">
          <foxy-i18n infer="" key="uoe_hint_text"></foxy-i18n>
          ${this.uoeSettingsPage
            ? html`
                <a
                  target="_blank"
                  class="inline-block rounded font-medium text-body transition-colors cursor-pointer hover-opacity-80 focus-outline-none focus-ring-2 focus-ring-primary-50"
                  href=${this.uoeSettingsPage}
                >
                  <foxy-i18n infer="" key="uoe_link_text"></foxy-i18n>
                </a>
              `
            : ''}
        </p>
      </foxy-internal-summary-control>

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
