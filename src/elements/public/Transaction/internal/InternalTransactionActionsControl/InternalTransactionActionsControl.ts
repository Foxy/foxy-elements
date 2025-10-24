import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Transaction } from '../../Transaction';
import type { Resource } from '@foxy.io/sdk/core';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';
import { Rels } from '@foxy.io/sdk/backend';

export class InternalTransactionActionsControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      currencyDisplay: { attribute: 'currency-display' },
      folders: {},
    };
  }

  currencyDisplay: string | null = null;

  folders: string | null = null;

  renderControl(): TemplateResult {
    return html`
      <div class="flex flex-wrap gap-x-m gap-y-xs">
        ${this.nucleon?.data?._links['fx:capture'] ? this.__renderCaptureAction() : ''}
        ${this.nucleon?.data?._links['fx:void'] ? this.__renderVoidAction() : ''}
        ${this.nucleon?.data?._links['fx:refund'] ? this.__renderRefundAction() : ''}
        ${this.nucleon?.data?._links['fx:send_emails'] ? this.__renderSendEmailsAction() : ''}
        ${this.nucleon?.data?._links['fx:subscription'] ? this.__renderSubscriptionAction() : ''}
        ${this.nucleon?.data?._links['fx:receipt'] ? this.__renderReceiptAction() : ''}
        ${this.__renderArchiveAction()}
        ${this.folders ? this.__renderFolderSelector(this.folders) : ''}
      </div>
    `;
  }

  private get __refundAmount(): number {
    const data = (this.nucleon as Transaction | null)?.data;
    const originalTotal = data?.total_order ?? 0;
    // @ts-expect-error SDK types do not include amount on fx:refund
    return parseFloat(data?._links['fx:refund']?.amount ?? originalTotal);
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
    const currencyCode = (this.nucleon as Transaction | null)?.data?.currency_code;

    return html`
      <foxy-internal-post-action-control
        message-options=${JSON.stringify({
          currencyDisplay: this.currencyDisplay,
          amount: `${this.__refundAmount} ${currencyCode}`,
        })}
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

  private __renderArchiveAction() {
    const host = this.nucleon as Transaction | null;

    return html`
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
    `;
  }

  private __renderFolderSelector(foldersHref: string) {
    type FoldersLoader = NucleonElement<Resource<Rels.StoreTransactionFolders>>;

    const foldersLoader = this.renderRoot.querySelector<FoldersLoader>('#foldersLoader');
    const folders = Array.from(foldersLoader?.data?._embedded?.['fx:transaction_folders'] ?? []);
    const host = this.nucleon as Transaction | null;

    return html`
      <foxy-nucleon
        class="hidden"
        infer=""
        href=${foldersHref}
        id="foldersLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <label
        class="group relative rounded focus-within-ring-2 focus-within-ring-primary-50"
        ?hidden=${folders.length === 0}
      >
        <span
          class="inline-flex items-center gap-xs relative transition-opacity group-hover-opacity-80"
        >
          <foxy-i18n class="font-medium text-primary" infer="folder" key="caption"></foxy-i18n>
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-primary transform scale-125" style="width: 1em; height: 1em"><path fill-rule="evenodd" d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z" clip-rule="evenodd" /></svg>`}
        </span>

        <select
          class="absolute inset-0 opacity-0 cursor-pointer"
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @change=${(evt: Event) => {
            host?.edit({ folder_uri: (evt.currentTarget as HTMLSelectElement).value });
            host?.submit(false);
          }}
        >
          <option value="" ?selected=${!host?.form.folder_uri} ?disabled=${!host?.form.folder_uri}>
            ${this.t('folder.option_none')}
          </option>

          ${folders
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(folder => {
              const folderHref = folder._links.self.href;
              const isSelected = host?.form.folder_uri === folderHref;
              return html`
                <option value=${folderHref} ?selected=${isSelected} ?disabled=${isSelected}>
                  ${folder.name}
                </option>
              `;
            })}
        </select>
      </label>
    `;
  }
}
