import * as logos from './logos';

import { CSSResultArray, css } from 'lit-element';
import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { BooleanSelector } from '@foxy.io/sdk/core';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/index';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { backgrounds } from './backgrounds';
import { classMap } from '../../../utils/class-map';

const NS = 'payment-method-card';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Basic card displaying a payment method.
 *
 * @slot actions:before - **new in v1.4.0**
 * @slot actions:after - **new in v1.4.0**
 * @slot actions:delete:before - **new in v1.4.0**
 * @slot actions:delete:after - **new in v1.4.0**
 *
 * @element foxy-payment-method-form
 * @since 1.2.0
 */
export class PaymentMethodCard extends Base<Data> {
  static get styles(): CSSResultArray {
    return [
      super.styles,
      backgrounds,
      css`
        .ratio-card {
          padding-top: 63%;
          position: relative;
          height: 0;
        }

        .ratio-card > * {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
      `,
    ];
  }

  templates: Templates = {};

  private readonly __renderActionsDelete = () => {
    return html`
      <div class="flex">
        ${this.renderTemplateOrSlot('actions:delete:before')}

        <vaadin-button
          class="px-xs rounded"
          theme="icon"
          style="--lumo-primary-text-color: #fff; --lumo-primary-color-50pct: rgba(255, 255, 255, 0.5); --lumo-contrast-5pct: rgba(255, 255, 255, 0.05)"
          aria-label=${this.t('delete').toString()}
          data-testid="actions:delete"
          ?disabled=${this.disabledSelector.matches('actions:delete', true)}
          @click=${this.__handleDelete}
        >
          <iron-icon icon="icons:delete"></iron-icon>
        </vaadin-button>

        ${this.renderTemplateOrSlot('actions:delete:after')}
      </div>
    `;
  };

  private readonly __renderActions = () => {
    return html`
      <div class="flex" data-testid="actions">
        ${this.renderTemplateOrSlot('actions:before')}
        ${this.hiddenSelector.matches('actions:delete', true) ? '' : this.__renderActionsDelete()}
        ${this.renderTemplateOrSlot('actions:after')}
      </div>
    `;
  };

  render(): TemplateResult {
    const { data, lang, ns } = this;

    if (this.in({ idle: 'template' }) || !data?.save_cc || !this.in('idle')) {
      const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';

      return html`
        <div
          class="ratio-card"
          aria-live="polite"
          aria-busy=${this.in('busy')}
          data-testid="wrapper"
        >
          <div class="h-full bg-contrast-5"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <foxy-spinner
              data-testid="spinner"
              state=${spinnerState}
              lang=${this.lang}
              ns="${ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
            >
            </foxy-spinner>
          </div>
        </div>
      `;
    }

    const type = data!.cc_type?.toLowerCase() ?? 'unknown';
    const logo = logos[type as keyof typeof logos] ?? logos.unknown;
    const last4Digits = data!.cc_number_masked?.substring(data!.cc_number_masked.length - 4);

    return html`
      <foxy-internal-confirm-dialog
        data-testid="confirm"
        message="delete_prompt"
        confirm="delete"
        cancel="cancel"
        header="delete"
        theme="primary error"
        lang=${lang}
        ns=${ns}
        id="confirm"
        @hide=${this.__handleConfirmHide}
      >
      </foxy-internal-confirm-dialog>

      <div class="ratio-card" data-testid="wrapper" aria-busy=${this.in('busy')} aria-live="polite">
        <div
          class="flex flex-col justify-between text-base text-m leading-m font-lumo p-m bg-unknown bg-${type}"
        >
          <div
            class=${classMap({
              'flex items-start': true,
              'justify-between': this.readonlyControls === BooleanSelector.False,
              'justify-end': this.readonlyControls === BooleanSelector.True,
            })}
          >
            ${this.hiddenSelector.matches('actions', true) ? '' : this.__renderActions()}
            <div class="ml-auto rounded h-m">${logo}</div>
          </div>

          <div class="font-tnum leading-none flex justify-between">
            <div data-testid="expiry">
              ${data!.cc_exp_month && data.cc_exp_year
                ? html`
                    <span class="sr-only">${this.t('expires').toString()}&nbsp;</span>
                    <span>${data!.cc_exp_month} / ${data!.cc_exp_year}</span>
                  `
                : ''}
            </div>

            <div data-testid="number">
              ${last4Digits
                ? html`
                    <span class="sr-only">${this.t('last_4_digits').toString()}&nbsp;</span>
                    <span aria-hidden="true">••••</span>
                    <span>${last4Digits}</span>
                  `
                : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  protected async _sendDelete(): Promise<Data> {
    const body = JSON.stringify({ save_cc: false });
    const data = await this._fetch(this.href, { method: 'PATCH', body });
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data: null, source: this.href, related: [this.parent] });
    return data;
  }

  private __handleDelete(evt: Event) {
    const confirm = this.renderRoot.querySelector('#confirm');
    (confirm as InternalConfirmDialog).show(evt.currentTarget as HTMLElement);
  }

  private __handleConfirmHide(evt: DialogHideEvent) {
    if (!evt.detail.cancelled) this.delete();
  }
}
