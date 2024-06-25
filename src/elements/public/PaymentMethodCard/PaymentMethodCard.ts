import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { Data, Templates } from './types';
import type { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import type { TemplateResult } from 'lit-html';
import type { FormDialog } from '../FormDialog/FormDialog';

import * as logos from './logos';

import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { NucleonElement } from '../NucleonElement/index';
import { ThemeableMixin } from '../../../mixins/themeable';
import { backgrounds } from './backgrounds';
import { ifDefined } from 'lit-html/directives/if-defined';
import { css, html } from 'lit-element';
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
 * @slot actions:update:before - **new in v1.27.0**
 * @slot actions:update:after - **new in v1.27.0**
 *
 * @element foxy-payment-method-card
 * @since 1.2.0
 */
export class PaymentMethodCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      embedUrl: { attribute: 'embed-url' },
    };
  }

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

  /**
   * Configuration URL for the Payment Card Embed. If provided,
   * the card will have an option of updating payment method.
   * Otherwise, only the delete option will be available.
   */
  embedUrl: string | null = null;

  private readonly __renderActionsUpdate = () => {
    const hasCC = !!this.data?.save_cc;
    const buttonStyle = hasCC
      ? '--lumo-primary-text-color: #fff; --lumo-primary-color-50pct: rgba(255, 255, 255, 0.5); --lumo-contrast-5pct: rgba(255, 255, 255, 0.05)'
      : void 0;

    return html`
      <div class="flex">
        ${this.renderTemplateOrSlot('actions:update:before')}

        <foxy-form-dialog
          data-testid="update-dialog"
          readonlycontrols=${this.readonlySelector.zoom('actions:update:form')}
          disabledcontrols=${this.disabledSelector.zoom('actions:update:form')}
          hiddencontrols="status ${this.hiddenSelector.zoom('actions:update:form')}"
          header=${hasCC ? 'dialog_header_update' : 'dialog_header_add'}
          group=${this.group}
          form="foxy-update-payment-method-form"
          href=${this.href}
          lang=${this.lang}
          ns="${this.ns} dialog"
          alert
          close-on-patch
          .props=${{ '.embedUrl': this.embedUrl }}
        >
        </foxy-form-dialog>

        <vaadin-button
          class=${ifDefined(hasCC ? 'px-xs rounded' : void 0)}
          theme=${hasCC ? 'icon' : 'contrast small'}
          style=${ifDefined(buttonStyle)}
          aria-label=${this.t(hasCC ? 'update' : 'add')}
          data-testid="actions:update"
          ?disabled=${this.disabledSelector.matches('actions:update', true)}
          @click=${(evt: CustomEvent) => {
            const button = evt.currentTarget as HTMLElement;
            const dialog = button.previousElementSibling as FormDialog;
            dialog.show(button);
          }}
        >
          ${hasCC
            ? html`<iron-icon icon="icons:create"></iron-icon>`
            : html`<foxy-i18n infer="" key="add"></foxy-i18n>`}
        </vaadin-button>

        ${this.renderTemplateOrSlot('actions:update:after')}
      </div>
    `;
  };

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
    const isUpdateHidden = this.hiddenSelector.matches('actions:update', true) || !this.embedUrl;
    const isDeleteHidden = this.hiddenSelector.matches('actions:delete', true);

    return html`
      <div class="flex gap-s" data-testid="actions">
        ${this.renderTemplateOrSlot('actions:before')}
        ${isUpdateHidden ? '' : this.__renderActionsUpdate()}
        ${isDeleteHidden ? '' : this.__renderActionsDelete()}
        ${this.renderTemplateOrSlot('actions:after')}
      </div>
    `;
  };

  render(): TemplateResult {
    const { data, lang, ns } = this;

    if (this.in({ idle: 'template' }) || !data?.save_cc || !this.in('idle')) {
      const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';
      const isUpdateHidden =
        this.hiddenSelector.matches('actions:update', true) || !this.embedUrl || !this.data;

      return html`
        <div
          class="ratio-card"
          aria-live="polite"
          aria-busy=${this.in('busy')}
          data-testid="wrapper"
        >
          <div class="h-full bg-contrast-5"></div>
          <div class="absolute inset-0 flex flex-col gap-m items-center justify-center">
            <foxy-spinner
              data-testid="spinner"
              layout="vertical"
              state=${spinnerState}
              lang=${this.lang}
              ns="${ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
            >
            </foxy-spinner>
            ${isUpdateHidden ? '' : this.__renderActionsUpdate()}
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
            <div class="mr-auto rounded h-m">${logo}</div>
            ${this.hiddenSelector.matches('actions', true) ? '' : this.__renderActions()}
          </div>

          <div class="font-tnum leading-none flex justify-between" style="color: white">
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

  protected async _sendDelete(): Promise<null> {
    const body = JSON.stringify({ save_cc: false });
    await this._fetch(this.href, { method: 'PATCH', body });
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data: null, source: this.href, related: [this.parent] });
    return null;
  }

  private __handleDelete(evt: Event) {
    const confirm = this.renderRoot.querySelector('#confirm');
    (confirm as InternalConfirmDialog).show(evt.currentTarget as HTMLElement);
  }

  private __handleConfirmHide(evt: DialogHideEvent) {
    if (!evt.detail.cancelled) this.delete();
  }
}
