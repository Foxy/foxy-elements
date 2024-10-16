import type { PropertyDeclarations } from 'lit-element';
import type { SVGTemplateResult, TemplateResult } from 'lit-html';
import type { Transaction } from '../../Transaction';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { getResourceId } from '@foxy.io/sdk/core';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';
import { classMap } from '../../../../../utils/class-map';

export class InternalTransactionCustomerControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __copyEmailState: { attribute: false },
      __copyIdState: { attribute: false },
    };
  }

  private __copyEmailState: 'idle' | 'busy' | 'done' | 'fail' = 'idle';

  private __copyIdState: 'idle' | 'busy' | 'done' | 'fail' = 'idle';

  renderControl(): TemplateResult {
    const host = this.nucleon as Transaction | null;
    const customerHref = host?.data?._links['fx:customer'].href;
    const customerPageHref = customerHref ? host?.getCustomerPageHref?.(customerHref) : void 0;

    return html`
      <foxy-i18n infer="" class="block text-l font-medium leading-xs mb-s" key="label"> </foxy-i18n>

      <foxy-swipe-actions>
        <a
          class=${classMap({
            'block ring-inset rounded transition-colors bg-contrast-5': true,
            'cursor-pointer hover-bg-contrast-10': !!customerPageHref,
            'focus-outline-none focus-ring-2 focus-ring-primary-50': !!customerPageHref,
          })}
          style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
          href=${ifDefined(customerPageHref)}
        >
          <foxy-customer-card infer="" href=${ifDefined(customerHref)}></foxy-customer-card>
        </a>

        <div class="h-full grid grid-cols-2 gap-s ml-s" slot="action">
          ${this.__renderCopyAction(
            svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1.2rem; height: 1.2rem"><path fill-rule="evenodd" d="M9.493 2.852a.75.75 0 0 0-1.486-.204L7.545 6H4.198a.75.75 0 0 0 0 1.5h3.14l-.69 5H3.302a.75.75 0 0 0 0 1.5h3.14l-.435 3.148a.75.75 0 0 0 1.486.204L7.955 14h2.986l-.434 3.148a.75.75 0 0 0 1.486.204L12.456 14h3.346a.75.75 0 0 0 0-1.5h-3.14l.69-5h3.346a.75.75 0 0 0 0-1.5h-3.14l.435-3.148a.75.75 0 0 0-1.486-.204L12.045 6H9.059l.434-3.148ZM8.852 7.5l-.69 5h2.986l.69-5H8.852Z" clip-rule="evenodd" /></svg>`,
            'copy_id_caption',
            '__copyIdState',
            customerHref ? String(getResourceId(customerHref)) : ''
          )}
          ${this.__renderCopyAction(
            svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1.2rem; height: 1.2rem"><path fill-rule="evenodd" d="M5.404 14.596A6.5 6.5 0 1 1 16.5 10a1.25 1.25 0 0 1-2.5 0 4 4 0 1 0-.571 2.06A2.75 2.75 0 0 0 18 10a8 8 0 1 0-2.343 5.657.75.75 0 0 0-1.06-1.06 6.5 6.5 0 0 1-9.193 0ZM10 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" clip-rule="evenodd" /></svg>`,
            'copy_email_caption',
            '__copyEmailState',
            host?.data?.customer_email ?? ''
          )}
        </div>
      </foxy-swipe-actions>
    `;
  }

  private __renderCopyAction(
    icon: SVGTemplateResult,
    caption: string,
    stateKey: '__copyIdState' | '__copyEmailState',
    textToCopy: string
  ) {
    const state = this[stateKey];
    const spinnerState = state === 'fail' ? 'error' : state === 'done' ? 'end' : 'busy';

    return html`
      <button
        class="relative transition-colors bg-contrast-5 text-body hover-bg-contrast-10 rounded h-full py-0 px-m focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50"
        ?disabled=${state !== 'idle'}
        @click=${() => state === 'idle' && this.__copy(textToCopy, stateKey)}
        @focusout=${(evt: Event) => state !== 'idle' && evt.stopPropagation()}
        @mouseout=${(evt: Event) => state !== 'idle' && evt.stopPropagation()}
      >
        <div
          class=${classMap({
            'relative flex flex-col items-center justify-center transition-opacity': true,
            'opacity-0': state !== 'idle',
          })}
        >
          ${icon}
          <foxy-i18n class="mt-xs text-s font-medium leading-none" infer="" key=${caption}>
          </foxy-i18n>
        </div>
        <div
          class=${classMap({
            'absolute inset-0 flex items-center justify-center transition-opacity': true,
            'opacity-0': state === 'idle',
          })}
        >
          <foxy-spinner layout="no-label" state=${spinnerState} infer="spinner"> </foxy-spinner>
        </div>
      </button>
    `;
  }

  private async __copy(text: string, stateKey: '__copyIdState' | '__copyEmailState') {
    this[stateKey] = 'busy';

    try {
      await navigator.clipboard.writeText(text);
      this[stateKey] = 'done';
    } catch {
      this[stateKey] = 'fail';
    }

    setTimeout(() => (this[stateKey] = 'idle'), 3000);
  }
}
