import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { getSubscriptionStatus } from '../../../utils/get-subscription-status';
import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';

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
    const data = this.data;
    if (!data?.error_message || !data.past_due_amount) alwaysMatch.unshift('error-message');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get headerSubtitleKey(): string {
    const status = getSubscriptionStatus(this.data);
    return status ? `subtitle_${status}` : super.headerSubtitleKey;
  }

  renderHeaderActions(): TemplateResult {
    return html`
      <foxy-internal-admin-subscription-form-status-action infer="status-action">
      </foxy-internal-admin-subscription-form-status-action>
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

    const chargePastDueHref: string | undefined = this.data?._links['fx:charge_past_due']?.href;
    const pastDueAmount = this.data?.past_due_amount;
    const errorMessage = this.data?.error_message;
    const currencyCode = this.data?._embedded['fx:transaction_template'].currency_code;

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
          suffix=${ifDefined(currencyCode)}
          infer="past-due-amount"
          min="0"
        >
        </foxy-internal-number-control>

        ${chargePastDueHref && currencyCode && pastDueAmount
          ? html`
              <foxy-internal-post-action-control
                message-options=${JSON.stringify({ amount: `${pastDueAmount} ${currencyCode}` })}
                theme="tertiary-inline"
                infer="charge-past-due"
                href=${chargePastDueHref}
                @success=${() => this.refresh()}
              >
              </foxy-internal-post-action-control>
            `
          : errorMessage && !pastDueAmount
          ? html`
              <details
                class="leading-xs text-xs text-secondary rounded-b focus-within-ring-2 focus-within-ring-inset focus-within-ring-primary-50"
                style="--gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
              >
                <summary
                  class="cursor-pointer transition-colors hover-text-body focus-outline-none"
                >
                  <span class="flex items-start" style="gap: var(--gap)">
                    ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="flex-shrink-0" style="width: 1.25em"><path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clip-rule="evenodd" /></svg>`}
                    <foxy-i18n infer="" key="error_with_zero_past_due_hint"></foxy-i18n>
                  </span>
                </summary>
                <p style="padding-left: calc(1.25em + var(--gap))" class="pt-xs">
                  <span class="whitespace-pre-line">${errorMessage}</span>
                </p>
              </details>
            `
          : ''}
      </foxy-internal-summary-control>

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

        <div
          class="flex items-start leading-xs text-xs text-secondary"
          style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
        >
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="flex-shrink-0" style="width: 1.25em"><path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clip-rule="evenodd" /></svg>`}
          <p>
            <foxy-i18n infer="" key="uoe_hint_text"></foxy-i18n>
            ${this.uoeSettingsPage
              ? html`
                  <a
                    target="_blank"
                    class="inline-block rounded font-medium text-body cursor-pointer hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
                    href=${this.uoeSettingsPage}
                  >
                    <foxy-i18n infer="" key="uoe_link_text"></foxy-i18n>
                  </a>
                `
              : ''}
          </p>
        </div>
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
        item="foxy-admin-transaction-card"
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
