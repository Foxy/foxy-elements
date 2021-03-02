import { CSSResultArray, css } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { FormDialog } from '../FormDialog/index';
import { NucleonElement } from '../NucleonElement/index';
import { Skeleton } from '../../private/index';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

export class AddressCard extends ScopedElementsMixin(NucleonElement)<Data> {
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
    const ns = AddressCard.__ns;
    const variant = ifDefined(this.in('fail') ? 'error' : undefined);
    const icon = this.form.is_default_billing
      ? 'icons:payment'
      : this.form.is_default_shipping
      ? 'maps:local-shipping'
      : '';

    return html`
      <foxy-form-dialog
        header="edit"
        parent=${this.parent}
        form="foxy-address-form"
        lang=${this.lang}
        href=${this.href}
        ns=${ns}
        id="form-dialog"
        data-testid="dialog"
      >
      </foxy-form-dialog>

      <button
        class="text-left w-full flex items-start leading-m font-lumo space-x-m text-body focus:outline-none"
        aria-live="polite"
        aria-busy=${this.in('busy')}
        data-testid="wrapper"
        @click=${this.__handleClick}
      >
        <div class="relative flex-1 leading-m">
          ${[1, 2, 3].map(lineIndex => {
            const lineClass = classMap({ 'block text-m': true, 'opacity-0': this.in('fail') });
            if (!this.in('idle')) return html`<x-skeleton class=${lineClass}>&nbsp;</x-skeleton>`;

            return html`
              <foxy-i18n
                ns=${ns}
                key=${`line_${lineIndex}`}
                lang=${this.lang}
                class=${lineClass}
                data-testid="line${lineIndex}"
                .opts=${this.form}
              >
              </foxy-i18n>
            `;
          })}
          ${this.in('fail')
            ? html`
                <div class="my-xs absolute text-error bg-error-10 rounded inset-0 flex">
                  <div class="flex m-auto items-center justify-center space-x-s">
                    <iron-icon icon="icons:error-outline"></iron-icon>
                    <foxy-i18n ns=${ns} lang=${this.lang} key="error" class="text-s"></foxy-i18n>
                  </div>
                </div>
              `
            : ''}
        </div>

        ${this.in('idle')
          ? icon
            ? html`<iron-icon icon=${icon} data-testid="icon"></iron-icon>`
            : ''
          : html`<x-skeleton class="w-s min-w-0" variant=${variant}></x-skeleton>`}
      </button>
    `;
  }

  private __handleClick(evt: Event) {
    const dialog = this.renderRoot.querySelector('#form-dialog') as FormDialog;
    dialog.show(evt.currentTarget as HTMLElement);
  }
}
