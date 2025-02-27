import { html, TemplateResult } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { Transaction } from '../../Transaction';

export class InternalTransactionActionsControl extends InternalControl {
  renderControl(): TemplateResult {
    const host = this.nucleon as Transaction | null;

    return html`
      <div class="flex flex-wrap gap-x-m gap-y-xs">
        ${this.nucleon?.data?._links['fx:capture'] ? this.__renderCaptureAction() : ''}
        ${this.nucleon?.data?._links['fx:void'] ? this.__renderVoidAction() : ''}
        ${this.nucleon?.data?._links['fx:refund'] ? this.__renderRefundAction() : ''}
        ${this.nucleon?.data?._links['fx:send_emails'] ? this.__renderSendEmailsAction() : ''}
        ${this.nucleon?.data?._links['fx:subscription'] ? this.__renderSubscriptionAction() : ''}
        ${this.nucleon?.data?._links['fx:receipt'] ? this.__renderReceiptAction() : ''}

        <vaadin-button
          theme="tertiary-inline"
          ?disabled=${this.disabledSelector.matches('archive', true)}
          @click=${() => {
            host?.edit({ hide_transaction: !host?.form.hide_transaction });
            host?.submit();
          }}
        >
          <foxy-i18n
            infer="archive"
            key="caption_${host?.form.hide_transaction ? 'unarchive' : 'archive'}"
          >
          </foxy-i18n>
        </vaadin-button>
      </div>
    `;
  }

  private __renderSendEmailsAction() {
    return html`
      <foxy-internal-post-action-control
        infer="send-emails"
        theme="tertiary-inline"
        href=${ifDefined(this.nucleon?.data?._links['fx:send_emails'].href)}
        @success=${() => this.nucleon?.refresh()}
      >
      </foxy-internal-post-action-control>
    `;
  }

  private __renderCaptureAction() {
    return html`
      <foxy-internal-post-action-control
        theme="tertiary-inline success"
        infer="capture"
        href=${ifDefined(this.nucleon?.data?._links['fx:capture'].href)}
        @success=${() => this.nucleon?.refresh()}
      >
      </foxy-internal-post-action-control>
    `;
  }

  private __renderVoidAction() {
    return html`
      <foxy-internal-post-action-control
        theme="tertiary-inline error"
        infer="void"
        href=${ifDefined(this.nucleon?.data?._links['fx:void']?.href)}
        @success=${() => this.nucleon?.refresh()}
      >
      </foxy-internal-post-action-control>
    `;
  }

  private __renderRefundAction() {
    return html`
      <foxy-internal-post-action-control
        infer="refund"
        theme="tertiary-inline"
        href=${ifDefined(this.nucleon?.data?._links['fx:refund']?.href)}
        @success=${() => this.nucleon?.refresh()}
      >
      </foxy-internal-post-action-control>
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
