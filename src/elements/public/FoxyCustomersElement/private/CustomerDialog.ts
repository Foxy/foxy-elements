import { TemplateResult, html } from 'lit-html';

import { Dialog } from '../../../private/Dialog/Dialog';
import { FoxyCustomerElement } from '../../FoxyCustomerElement';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

export class CustomerDialog extends Dialog {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      href: { type: String },
    };
  }

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-customer': customElements.get(FoxyCustomerElement.defaultNodeName),
    };
  }

  href: string | null = null;

  render(): TemplateResult {
    return super.render(() => {
      const { lang, href } = this;
      return html`<foxy-customer .lang=${lang} .href=${href}></foxy-customer>`;
    });
  }
}
