import * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { AddressFormElement } from '../../AddressForm';
import { Dialog } from '../../../private/Dialog/Dialog';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type CustomerAddress = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.CustomerAddress, undefined>;

export class AddressFormDialog extends Dialog {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-address-form': customElements.get(AddressFormElement.defaultNodeName),
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      resource: { attribute: false },
    };
  }

  resource: CustomerAddress | null = null;

  render(): TemplateResult {
    return super.render(() => {
      return html`
        <foxy-address-form .ns=${this.ns} .lang=${this.lang} .resource=${this.resource}>
        </foxy-address-form>
      `;
    });
  }
}
