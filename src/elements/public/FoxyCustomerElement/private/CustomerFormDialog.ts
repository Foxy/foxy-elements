import { TemplateResult, html } from 'lit-html';

import { Dialog } from '../../../private/Dialog/Dialog';
import { FoxyCustomerFormElement } from '../../FoxyCustomerFormElement';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

export class CustomerFormDialog extends Dialog {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      href: { type: String },
    };
  }

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-customer-form': customElements.get(FoxyCustomerFormElement.defaultNodeName),
    };
  }

  href: string | null = null;

  render(): TemplateResult {
    return super.render(() => {
      return html`
        <foxy-customer-form .lang=${this.lang} .href=${this.href}></foxy-customer-form>
      `;
    });
  }
}
