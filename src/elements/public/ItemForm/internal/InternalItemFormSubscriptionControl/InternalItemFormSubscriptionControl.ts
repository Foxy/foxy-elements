import type { TemplateResult } from 'lit-html';
import type { FormDialog } from '../../../FormDialog/FormDialog';
import type { Data } from '../../types';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { html } from 'lit-html';

export class InternalItemFormSubscriptionControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    type Links = Data['_links'] & { 'fx:subscription'?: { href: string } };
    let subscriptionLink: string | null;

    try {
      const href = (this.nucleon?.data?._links as Links)['fx:subscription']?.href ?? '';
      const url = new URL(href);
      url.searchParams.set('zoom', 'last_transaction,transaction_template:items');
      subscriptionLink = url.toString();
    } catch {
      subscriptionLink = null;
    }

    return html`
      ${subscriptionLink
        ? html`
            <div class="space-y-xs">
              <foxy-i18n
                infer=""
                class="text-s font-medium text-secondary leading-none"
                key="title"
              >
              </foxy-i18n>

              <foxy-form-dialog
                header="update"
                infer="form"
                href=${subscriptionLink}
                form="foxy-subscription-form"
                .related=${this.nucleon?.href ? [this.nucleon.href] : []}
              >
              </foxy-form-dialog>

              <button
                ?disabled=${this.disabled}
                class="transition-colors rounded w-full bg-contrast-5 hover-bg-contrast-10 focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50"
                style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
                @click=${(evt: Event) => {
                  const button = evt.currentTarget as HTMLButtonElement;
                  const dialog = button.previousElementSibling as FormDialog;
                  dialog.show(button);
                }}
              >
                <foxy-subscription-card infer="card" href=${subscriptionLink}>
                </foxy-subscription-card>
              </button>
            </div>
          `
        : html`
            <div class="space-y-m">
              <foxy-internal-frequency-control infer="frequency" property="subscription_frequency">
              </foxy-internal-frequency-control>

              <foxy-internal-date-control infer="start" property="subscription_start_date">
              </foxy-internal-date-control>

              <foxy-internal-date-control infer="end" property="subscription_end_date">
              </foxy-internal-date-control>

              <foxy-internal-date-control
                infer="next"
                property="subscription_next_transaction_date"
              >
              </foxy-internal-date-control>
            </div>
          `}
    `;
  }
}
