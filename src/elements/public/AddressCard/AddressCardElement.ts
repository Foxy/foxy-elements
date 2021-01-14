import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@polymer/iron-icons/maps-icons';

import * as FoxySDK from '@foxy.io/sdk';

import { CSSResultArray, PropertyDeclarations, css } from 'lit-element';
import { HypermediaResource, I18N, Skeleton } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { AddressFormDialog } from './private/AddressFormDialog';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { classMap } from '../../../utils/class-map';

type Resource = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.CustomerAddress, undefined>;

export class AddressCardElement extends HypermediaResource<Resource> {
  static readonly defaultNodeName = 'foxy-address-card';

  static get scopedElements(): ScopedElementsMap {
    return {
      'x-address-form-dialog': AddressFormDialog,
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __formDialogOpen: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host(:focus-within) {
          box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
        }
      `,
    ];
  }

  readonly rel = 'customer_address';

  private __formDialogOpen = false;

  constructor() {
    super('customer-address');
  }

  render(): TemplateResult {
    const isLoading = this._is('busy.fetching');
    const isError = this._is('error');
    const isReady = this._is('idle');

    const icon = this.resource?.is_default_billing ? 'icons:payment' : 'maps:local-shipping';
    const variant = isError ? 'error' : 'busy';

    return html`
      <x-address-form-dialog
        ns=${this.ns}
        lang=${this.lang}
        href=${this.href ?? ''}
        header="edit"
        id="form-dialog"
      >
      </x-address-form-dialog>

      <button
        class="text-left w-full flex items-start leading-m font-lumo space-x-m text-body focus:outline-none"
        aria-live="polite"
        aria-busy=${isLoading}
        @click=${() => this.__getFormDialog().show()}
      >
        <div class="relative flex-1 leading-m">
          ${[1, 2, 3].map(lineIndex => {
            const lineClass = classMap({ 'block text-m': true, 'opacity-0': isError });
            if (!isReady) return html`<x-skeleton class=${lineClass}>&nbsp;</x-skeleton>`;

            return html`
              <x-i18n
                .ns=${this.ns}
                .key=${`line_${lineIndex}`}
                .lang=${this.lang}
                .opts=${this.resource!}
                .className=${lineClass}
              >
              </x-i18n>
            `;
          })}
          ${isError
            ? html`
                <div class="my-xs absolute text-error bg-error-10 rounded inset-0 flex">
                  <div class="flex m-auto items-center justify-center space-x-s">
                    <iron-icon icon="icons:error-outline"></iron-icon>
                    <x-i18n .ns=${this.ns} .lang=${this.lang} key="error" class="text-s"></x-i18n>
                  </div>
                </div>
              `
            : ''}
        </div>

        ${isReady
          ? html`<iron-icon icon=${icon}></iron-icon>`
          : html`<x-skeleton class="w-s min-w-0" variant=${variant}></x-skeleton>`}
      </button>
    `;
  }

  private __getFormDialog() {
    return this.renderRoot.querySelector('#form-dialog') as AddressFormDialog;
  }
}
