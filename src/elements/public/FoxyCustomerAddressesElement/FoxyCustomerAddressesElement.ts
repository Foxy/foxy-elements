import '@polymer/iron-icon';
import '@polymer/iron-icons';

import * as FoxySDK from '@foxy.io/sdk';

import { CSSResultArray, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { CollectionSlider } from '../../private/CollectionSlider/CollectionSlider';
import { FoxyCustomerAddressElement } from '../FoxyCustomerAddressElement';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Resource = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.CustomerAddresses, undefined>;

export class FoxyCustomerAddressesElement extends CollectionSlider<Resource> {
  static readonly defaultNodeName = 'foxy-customer-addresses';

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-customer-address': customElements.get(FoxyCustomerAddressElement.defaultNodeName),
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .w-18rem {
          width: 18rem;
        }
      `,
    ];
  }

  render(): TemplateResult {
    return super.render(resource => {
      return html`
        <foxy-customer-address
          .href=${resource._links.self.href}
          .resource=${resource}
          class="w-18rem shadow-xs rounded-t-l rounded-b-l p-m"
        >
        </foxy-customer-address>
      `;
    });
  }
}
