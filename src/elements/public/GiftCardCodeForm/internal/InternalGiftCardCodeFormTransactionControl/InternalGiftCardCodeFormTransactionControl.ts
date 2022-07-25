import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';
import { classMap } from '../../../../../utils/class-map';

export class InternalGiftCardCodeFormTransactionControl extends InternalControl {
  renderControl(): TemplateResult {
    let href: string | undefined;

    try {
      const url = new URL(
        this.nucleon?.form._links?.['fx:provisioned_by_transaction_detail_id'].href ?? ''
      );
      url.searchParams.set('zoom', 'items');
      href = url.toString();
    } catch {
      href = undefined;
    }

    return html`
      <div class="space-y-s">
        <foxy-i18n infer="" class="text-s font-medium text-secondary leading-none" key="title">
        </foxy-i18n>

        <button
          title=${this.t('click_action')}
          class=${classMap({
            'rounded-t-l rounded-b-l block w-full text-left p-m': true,
            'ring-1 ring-contrast-10 transition-colors focus-outline-none': true,
            'hover-bg-contrast-5 focus-ring-2 focus-ring-primary-50': !this.disabled,
          })}
          ?disabled=${this.disabled}
          @click=${() => {
            const event = new CustomEvent('navigation', {
              composed: true,
              bubbles: true,
              detail: href,
            });

            this.dispatchEvent(event);
          }}
        >
          <foxy-transaction-card
            infer="transaction-card"
            class="w-full -my-xs"
            href=${ifDefined(href)}
          >
          </foxy-transaction-card>
        </button>
      </div>
    `;
  }
}
