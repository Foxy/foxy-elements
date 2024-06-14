import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { PaymentCardEmbedElement } from '../../../PaymentCardEmbedElement/PaymentCardEmbedElement';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalUpdatePaymentMethodFormCcTokenControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      embedUrl: { attribute: 'embed-url' },
    };
  }

  embedUrl: string | null = null;

  renderControl(): TemplateResult {
    return html`
      <foxy-payment-card-embed
        infer="payment-card-embed"
        url=${ifDefined(this.embedUrl)}
        @submit=${this.__tokenize}
      >
      </foxy-payment-card-embed>

      <vaadin-button
        theme="primary"
        class="w-full mt-l"
        ?disabled=${this.disabled}
        @click=${() => this.__tokenize()}
      >
        <foxy-i18n infer="" key="tokenize"></foxy-i18n>
      </vaadin-button>
    `;
  }

  private async __tokenize() {
    const control = this.renderRoot.querySelector(
      '[infer=payment-card-embed]'
    ) as PaymentCardEmbedElement;

    try {
      this.nucleon?.edit({ cc_token: await control.tokenize() });
      this.nucleon?.submit();
    } catch {
      this.nucleon?.undo();
    }
  }
}
