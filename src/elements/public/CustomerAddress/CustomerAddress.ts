import '@polymer/iron-icons';
import '@polymer/iron-icon';

import * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { HypermediaResource } from '../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Resource = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.CustomerAddress, undefined>;

export class CustomerAddress extends HypermediaResource<Resource> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  readonly rel = 'customer_address';

  constructor() {
    super('customer-address');
  }

  render(): TemplateResult {
    if (!this.resource) return html`Loading...`;

    return html`
      <div class="flex text-body text-m leading-m font-lumo whitespace-pre-line">
        <p class="flex-1">${this._t('address', this.resource)}</p>

        ${this.resource.is_default_billing
          ? html`<iron-icon icon="icons:payment"></iron-icon>`
          : this.resource.is_default_shipping
          ? html`<iron-icon icon="icons:local-shipping"></iron-icon>`
          : ''}
      </div>
    `;
  }
}
