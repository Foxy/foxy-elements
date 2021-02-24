import { CSSResultArray, css } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ConfirmDialogElement } from '../../private/ConfirmDialog/index';
import { Data } from './types';
import { I18nElement } from '../I18n/index';
import { NucleonElement } from '../NucleonElement/index';
import { Themeable } from '../../../mixins/themeable';
import { backgrounds } from './backgrounds';
import { cdn } from '../../../env';

export class PaymentMethodCardElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'x-confirm-dialog': ConfirmDialogElement,
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
  }

  static get styles(): CSSResultArray {
    return [
      Themeable.styles,
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

  private static __ns = 'payment-method-card';

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18nElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const data = this.data;
    const ns = PaymentMethodCardElement.__ns;
    const t = I18nElement.i18next.getFixedT(this.lang, ns);

    if (this.in({ idle: 'template' }) || !data?.save_cc || !this.in('idle')) {
      const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';

      return html`
        <div
          class="ratio-card"
          aria-live="polite"
          aria-busy=${this.in('busy')}
          data-testid="wrapper"
        >
          <div class="h-full bg-contrast-10"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <foxy-spinner state=${spinnerState} data-testid="spinner"></foxy-spinner>
          </div>
        </div>
      `;
    }

    const type = data!.cc_type.toLowerCase();
    const logo = new URL(`./logos/${type}.svg`, cdn).toString();
    const last4Digits = data!.cc_number_masked.substring(data!.cc_number_masked.length - 4);

    return html`
      <x-confirm-dialog
        message="delete_message"
        confirm="delete_yes"
        cancel="delete_no"
        header="delete"
        theme="primary error"
        lang=${this.lang}
        ns=${ns}
        id="confirm"
        data-testid="confirm"
        @submit=${this.delete}
      >
      </x-confirm-dialog>

      <div class="ratio-card" data-testid="wrapper" aria-busy=${this.in('busy')} aria-live="polite">
        <div
          class="flex flex-col justify-between text-base text-m leading-m font-lumo p-m bg-unknown bg-${type}"
        >
          <div class="flex items-start justify-between">
            <vaadin-button
              class="px-xs rounded"
              theme="icon"
              style="--lumo-primary-text-color: #fff; --lumo-primary-color-50pct: rgba(255, 255, 255, 0.5); --lumo-contrast-5pct: rgba(255, 255, 255, 0.05)"
              aria-label=${t('delete').toString()}
              data-testid="delete"
              @click=${this.__handleDelete}
            >
              <iron-icon icon="icons:delete"></iron-icon>
            </vaadin-button>

            <img src=${logo} class="block rounded h-m" />
          </div>

          <div class="font-tnum leading-none flex justify-between">
            <div data-testid="expiry">
              <span class="sr-only">${t('expires').toString()}&nbsp;</span>
              <span>${data!.cc_exp_month} / ${data!.cc_exp_year}</span>
            </div>

            <div data-testid="number">
              <span class="sr-only">${t('last_4_digits').toString()}&nbsp;</span>
              <span aria-hidden="true">••••</span>
              <span>${last4Digits}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
  }

  private __handleDelete(evt: Event) {
    const confirm = this.renderRoot.querySelector('#confirm');
    (confirm as ConfirmDialogElement).show(evt.currentTarget as HTMLElement);
  }

  protected async _sendDelete(): Promise<Data> {
    const body = JSON.stringify({ save_cc: false });
    const data = await this._fetch(this.href, { method: 'PATCH', body });
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data: null, source: this.href, related: [this.parent] });
    return data;
  }
}
