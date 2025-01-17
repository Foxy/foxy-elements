import { html, TemplateResult } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { Transaction } from '../../Transaction';

export class InternalTransactionActionsControl extends InternalControl {
  renderControl(): TemplateResult {
    return html`
      <div class="flex flex-wrap gap-x-m gap-y-xs">
        ${this.nucleon?.data?._links['fx:capture'] ? this.__renderCaptureAction() : ''}
        ${this.nucleon?.data?._links['fx:void'] ? this.__renderVoidAction() : ''}
        ${this.nucleon?.data?._links['fx:refund'] ? this.__renderRefundAction() : ''}
        ${this.nucleon?.data?._links['fx:send_emails'] ? this.__renderSendEmailsAction() : ''}
        ${this.nucleon?.data?._links['fx:subscription'] ? this.__renderSubscriptionAction() : ''}
        ${this.nucleon?.data?._links['fx:receipt'] ? this.__renderReceiptAction() : ''}
      </div>
    `;
  }

  private __renderSendEmailsAction() {
    return html`
      <foxy-internal-transaction-post-action-control
        infer="send-emails"
        href=${ifDefined(this.nucleon?.data?._links['fx:send_emails'].href)}
        @done=${() => this.nucleon?.refresh()}
      >
      </foxy-internal-transaction-post-action-control>
    `;
  }

  private __renderCaptureAction() {
    return html`
      <foxy-internal-transaction-post-action-control
        theme="success"
        infer="capture"
        href=${ifDefined(this.nucleon?.data?._links['fx:capture'].href)}
        @done=${() => this.nucleon?.refresh()}
      >
      </foxy-internal-transaction-post-action-control>
    `;
  }

  private __renderVoidAction() {
    return html`
      <foxy-internal-transaction-post-action-control
        theme="error"
        infer="void"
        href=${ifDefined(this.nucleon?.data?._links['fx:void']?.href)}
        @done=${() => this.nucleon?.refresh()}
      >
      </foxy-internal-transaction-post-action-control>
    `;
  }

  private __renderRefundAction() {
    return html`
      <foxy-internal-transaction-post-action-control
        infer="refund"
        href=${ifDefined(this.nucleon?.data?._links['fx:refund']?.href)}
        @done=${() => this.nucleon?.refresh()}
      >
      </foxy-internal-transaction-post-action-control>
    `;
  }

  private __renderSubscriptionAction() {
    const host = this.nucleon as Transaction | null;
    const subHref = host?.data?._links['fx:subscription']?.href;
    const subPageHref = subHref ? host?.getSubscriptionPageHref?.(subHref) : void 0;

    return html`
      <a
        class="rounded text-m font-medium text-primary cursor-pointer transition-opacity hover-opacity-80 focus-outline-none focus-ring-2 focus-ring-primary-50"
        href=${ifDefined(subPageHref)}
      >
        <foxy-i18n infer="subscription" key="caption"></foxy-i18n>
      </a>
    `;
  }

  private __renderReceiptAction() {
    const host = this.nucleon as Transaction | null;

    return html`
      <a
        target="_blank"
        class="rounded text-m font-medium text-primary cursor-pointer transition-opacity hover-opacity-80 focus-outline-none focus-ring-2 focus-ring-primary-50"
        href=${ifDefined(host?.data?._links['fx:receipt']?.href)}
      >
        <foxy-i18n infer="receipt" key="caption"></foxy-i18n>
      </a>
    `;
  }
}
