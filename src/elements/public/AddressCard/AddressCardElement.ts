import { CSSResultArray, css } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { FormDialogElement } from '../FormDialog/index';
import { NucleonElement } from '../NucleonElement/index';
import { Skeleton } from '../../private/index';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';

export class AddressCardElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
  }

  static get styles(): CSSResultArray {
    return [
      Themeable.styles,
      css`
        :host(:focus-within) {
          box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
        }
      `,
    ];
  }

  private static __ns = 'address-card';

  render(): TemplateResult {
    const { lang, href, state } = this;

    const isFail = state.matches('fail');
    const isIdle = state.matches('idle');

    const ns = AddressCardElement.__ns;
    const variant = isFail ? 'error' : 'busy';
    const icon = this.state.context.data?.is_default_billing
      ? 'icons:payment'
      : this.state.context.data?.is_default_shipping
      ? 'maps:local-shipping'
      : '';

    return html`
      <foxy-form-dialog
        header="edit"
        parent=${this.parent}
        form="foxy-address-form"
        lang=${lang}
        href=${href}
        ns=${ns}
        id="form-dialog"
      >
      </foxy-form-dialog>

      <button
        class="text-left w-full flex items-start leading-m font-lumo space-x-m text-body focus:outline-none"
        aria-live="polite"
        aria-busy=${state.matches('busy')}
        @click=${this.__handleClick}
      >
        <div class="relative flex-1 leading-m">
          ${[1, 2, 3].map(lineIndex => {
            const lineClass = classMap({ 'block text-m': true, 'opacity-0': isFail });
            if (!isIdle) return html`<x-skeleton class=${lineClass}>&nbsp;</x-skeleton>`;

            return html`
              <foxy-i18n
                ns=${ns}
                key=${`line_${lineIndex}`}
                lang=${lang}
                class=${lineClass}
                .opts=${state.context.data!}
              >
              </foxy-i18n>
            `;
          })}
          ${isFail
            ? html`
                <div class="my-xs absolute text-error bg-error-10 rounded inset-0 flex">
                  <div class="flex m-auto items-center justify-center space-x-s">
                    <iron-icon icon="icons:error-outline"></iron-icon>
                    <foxy-i18n ns=${ns} lang=${lang} key="error" class="text-s"></foxy-i18n>
                  </div>
                </div>
              `
            : ''}
        </div>

        ${isIdle
          ? icon
            ? html`<iron-icon icon=${icon}></iron-icon>`
            : ''
          : html`<x-skeleton class="w-s min-w-0" variant=${variant}></x-skeleton>`}
      </button>
    `;
  }

  private __handleClick(evt: Event) {
    const dialog = this.renderRoot.querySelector('#form-dialog') as FormDialogElement;
    dialog.show(evt.currentTarget as HTMLElement);
  }
}
