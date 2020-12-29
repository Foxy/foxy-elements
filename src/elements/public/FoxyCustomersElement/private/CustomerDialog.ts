import * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { Dialog } from '../../../private/Dialog/Dialog';
import { FoxyCustomerElement } from '../../FoxyCustomerElement';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Customer = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customer, undefined>;

export class CustomerDialog extends Dialog {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      resource: { attribute: false },
    };
  }

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-customer': customElements.get(FoxyCustomerElement.defaultNodeName),
    };
  }

  resource: Customer | null = null;

  render(): TemplateResult {
    return super.render(() => {
      const { lang, resource } = this;
      return html`<foxy-customer .lang=${lang} .resource=${resource}></foxy-customer>`;
    });
  }
}
