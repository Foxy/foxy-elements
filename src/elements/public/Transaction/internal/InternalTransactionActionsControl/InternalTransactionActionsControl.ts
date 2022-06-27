import { html, TemplateResult } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';

export class InternalTransactionActionsControl extends InternalControl {
  renderControl(): TemplateResult {
    return html`
      <div class="divide-y divide-contrast-10">
        ${this.nucleon?.data?._links['fx:capture'] ? this.__renderCaptureAction() : ''}
        ${this.nucleon?.data?._links['fx:void'] ? this.__renderVoidAction() : ''}
        ${this.nucleon?.data?._links['fx:refund'] ? this.__renderRefundAction() : ''}
        ${this.nucleon?.data?._links['fx:send_emails'] ? this.__renderSendEmailsAction() : ''}
      </div>
    `;
  }

  private __renderSendEmailsAction() {
    return html`
      <foxy-internal-transaction-post-action-control
        infer="send-emails"
        theme="contrast"
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
        theme="contrast"
        infer="refund"
        href=${ifDefined(this.nucleon?.data?._links['fx:refund']?.href)}
        @done=${() => this.nucleon?.refresh()}
      >
      </foxy-internal-transaction-post-action-control>
    `;
  }
}
