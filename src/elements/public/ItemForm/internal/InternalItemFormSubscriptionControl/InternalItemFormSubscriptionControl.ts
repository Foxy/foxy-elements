import type { TemplateResult } from 'lit-html';
import type { FormDialog } from '../../../FormDialog/FormDialog';
import type { Data } from '../../types';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html } from 'lit-html';

export class InternalItemFormSubscriptionControl extends InternalControl {
  infer = 'subscription';

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
      <foxy-internal-details summary="title" infer="">
        ${subscriptionLink
          ? html`
              <foxy-form-dialog
                related=${this.nucleon?.href ? JSON.stringify([this.nucleon.href]) : ''}
                header="update"
                infer="form"
                href=${subscriptionLink}
                form="foxy-subscription-form"
              >
              </foxy-form-dialog>

              <button
                ?disabled=${this.disabled}
                @click=${(evt: Event) => {
                  const button = evt.currentTarget as HTMLButtonElement;
                  const dialog = button.previousElementSibling as FormDialog;
                  dialog.show(button);
                }}
              >
                <foxy-subscription-card class="p-m" infer="card" href=${subscriptionLink}>
                </foxy-subscription-card>
              </button>
            `
          : html`
              <div class="space-y-m p-m">
                <foxy-internal-frequency-control
                  infer="frequency"
                  property="subscription_frequency"
                >
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
      </foxy-internal-details>
    `;
  }
}
