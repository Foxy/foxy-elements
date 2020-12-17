import '@polymer/iron-icons';
import '@polymer/iron-icon';

import * as FoxySDK from '@foxy.io/sdk';

import { HypermediaResource, I18N, Skeleton } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { classMap } from '../../../utils/class-map';

type Resource = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.CustomerAddress, undefined>;

export class FoxyCustomerAddressElement extends HypermediaResource<Resource> {
  static readonly defaultNodeName = 'foxy-customer-address';

  static get scopedElements(): ScopedElementsMap {
    return {
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  readonly rel = 'customer_address';

  constructor() {
    super('customer-address');
  }

  render(): TemplateResult {
    const isLoading = this._is('loading');
    const isError = this._is('error');
    const isReady = this._is('ready');

    const icon = this.resource?.is_default_billing ? 'payment' : 'local-shipping';
    const variant = isError ? 'error' : 'busy';

    return html`
      <div
        class="flex items-start leading-m font-lumo space-x-m"
        aria-live="polite"
        aria-busy=${isLoading}
      >
        <p class="relative flex-1 leading-m">
          ${[1, 2, 3].map(lineIndex => {
            const lineClass = classMap({ 'block text-m text-body': true, 'opacity-0': isError });
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
        </p>

        ${isReady
          ? html`<iron-icon icon="icons:${icon}"></iron-icon>`
          : html`<x-skeleton class="w-s min-w-0" variant=${variant}></x-skeleton>`}
      </div>
    `;
  }
}
