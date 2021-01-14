import { TemplateResult, html } from 'lit-html';

import { AddressFormElement } from '../../AddressForm';
import { Dialog } from '../../../private/Dialog/Dialog';
import { PropertyDeclarations } from 'lit-element';
import { RequestEvent } from '../../../../events/request';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { UpdateEvent } from '../../../private/HypermediaResource/HypermediaResource';

export class NewAddressFormDialog extends Dialog {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-address-form': customElements.get(AddressFormElement.defaultNodeName),
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      parent: { type: String },
    };
  }

  parent: string | null = null;

  render(): TemplateResult {
    return super.render(() => {
      return html`
        <foxy-address-form
          parent=${this.parent ?? ''}
          lang=${this.lang}
          id="form"
          @update=${this.__handleUpdate}
          @request=${this.__handleRequest}
        >
        </foxy-address-form>
      `;
    });
  }

  private __handleUpdate(evt: UpdateEvent) {
    this.closable = !evt.detail.state.includes('busy');
  }

  private __handleRequest(evt: RequestEvent) {
    const method = evt.detail.init[1]?.method?.toUpperCase();
    const url = evt.detail.init[0].toString();

    if (method === 'POST' && url === this.parent) {
      evt.detail.onResponse(response => {
        if (response.ok) this.hide();
      });
    }
  }
}
