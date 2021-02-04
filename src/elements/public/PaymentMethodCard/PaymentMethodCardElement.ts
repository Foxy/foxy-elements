import { CSSResultArray, css } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ConfirmDialogElement } from '../../private/ConfirmDialog';
import { Data } from './types';
import { I18NElement } from '../I18N';
import { NucleonElement } from '../NucleonElement';
import { Skeleton } from '../../private';
import { Themeable } from '../../../mixins/themeable';
import { backgrounds } from './backgrounds';
import { cdn } from '../../../env';

export class PaymentMethodCardElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'x-confirm-dialog': ConfirmDialogElement,
      'x-skeleton': Skeleton,
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
    this.__untrackTranslations = I18NElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const { lang, state } = this;

    const data = state.context.data;
    const ns = PaymentMethodCardElement.__ns;
    const t = I18NElement.i18next.getFixedT(lang, ns);

    if (state.matches({ idle: 'template' }) || !state.matches('idle')) {
      return html`
        <div class="ratio-card bg-base" aria-live="polite" aria-busy=${state.matches('busy')}>
          <x-skeleton
            class="h-full"
            size="box"
            variant=${state.matches('fail') ? 'error' : state.matches('idle') ? 'static' : 'busy'}
          >
          </x-skeleton>

          ${state.matches('fail')
            ? html`
                <div class="text-error flex flex-col justify-center absolute inset-0">
                  <iron-icon icon="icons:error-outline" class="mb-xs mx-auto"></iron-icon>
                  <foxy-i18n ns=${ns} lang=${lang} key="failed_to_load" class="text-s mx-auto">
                  </foxy-i18n>
                </div>
              `
            : ''}
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
        lang=${lang}
        ns=${ns}
        id="confirm"
        @submit=${this.__handleDeleteConfirm}
      >
      </x-confirm-dialog>

      <div class="ratio-card">
        <div
          class="flex flex-col justify-between text-base text-m leading-m font-lumo p-m bg-unknown bg-${type}"
        >
          <div class="flex items-start justify-between">
            <button
              class="h-m w-m rounded flex items-center justify-center bg-tint-5 focus:outline-none focus:shadow-outline-base"
              aria-label=${t('delete').toString()}
              @click=${this.__handleDelete}
            >
              <iron-icon icon="icons:delete"></iron-icon>
            </button>

            <img src=${logo} class="block rounded h-m" />
          </div>

          <div class="font-tnum leading-none flex justify-between">
            <div>
              <span class="sr-only">${t('expires').toString()}&nbsp;</span>
              <span>${data!.cc_exp_month} / ${data!.cc_exp_year}</span>
            </div>

            <div>
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

  private __handleDelete() {
    const confirm = this.renderRoot.querySelector('#confirm');
    (confirm as ConfirmDialogElement).show();
  }

  private __handleDeleteConfirm() {
    this.send({ type: 'DELETE' });
  }
}
