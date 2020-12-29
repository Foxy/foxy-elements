import * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { Dialog } from '../../../private/Dialog/Dialog';
import { FoxyCustomerFormElement } from '../../FoxyCustomerFormElement';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Customer = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customer, undefined>;

export class CustomerFormDialog extends Dialog {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      resource: { attribute: false },
    };
  }

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-customer-form': customElements.get(FoxyCustomerFormElement.defaultNodeName),
    };
  }

  resource: Customer | null = null;

  render(): TemplateResult {
    return super.render(() => {
      return html`
        <foxy-customer-form .ns=${this.ns} .lang=${this.lang} .resource=${this.resource}>
        </foxy-customer-form>
      `;
    });
  }
}
