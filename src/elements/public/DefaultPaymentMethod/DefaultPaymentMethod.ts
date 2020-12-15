import '@polymer/iron-icon';
import '@polymer/iron-icons';

import * as FoxySDK from '@foxy.io/sdk';

import { CSSResultArray, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { HypermediaResource } from '../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { backgrounds } from './backgrounds';
import { cdn } from '../../../env';

type Resource = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.DefaultPaymentMethod, undefined>;

export class DefaultPaymentMethod extends HypermediaResource<Resource> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
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

  readonly rel = 'default_payment_method';

  constructor() {
    super('default-payment-method');
  }

  render(): TemplateResult {
    if (!this.resource) return html`Loading...`;

    const type = this.resource.cc_type.toLowerCase();
    const logo = new URL(`./logos/${type}.svg`, cdn).toString();
    const last4Digits = this.resource.cc_number_masked.substring(
      this.resource.cc_number_masked.length - 4
    );

    return html`
      <div class="ratio-card">
        <div
          class="flex flex-col justify-between text-base text-m leading-m font-lumo p-m bg-${type}"
        >
          <div class="flex items-start justify-between">
            <button
              class="h-m w-m rounded flex items-center justify-center bg-tint-5 focus:outline-none focus:shadow-outline-base"
              aria-label=${this._t('delete').toString()}
            >
              <iron-icon icon="icons:delete"></iron-icon>
            </button>

            <img src=${logo} class="block rounded h-m" />
          </div>

          <div class="font-tnum leading-none flex justify-between">
            <div>
              <span class="sr-only">${this._t('expires').toString()}&nbsp;</span>
              <span>${this.resource.cc_exp_month} / ${this.resource.cc_exp_year}</span>
            </div>

            <div>
              <span class="sr-only">${this._t('last_4_digits').toString()}&nbsp;</span>
              <span aria-hidden="true">••••</span>
              <span>${last4Digits}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
