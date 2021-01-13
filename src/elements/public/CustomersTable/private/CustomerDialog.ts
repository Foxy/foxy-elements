import { TemplateResult, html } from 'lit-html';

import { CustomerElement } from '../../Customer';
import { HypermediaResourceDialog } from '../../../private/Dialog/HypermediaResourceDialog';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { UpdateEvent } from '../../../private';

export class CustomerDialog extends HypermediaResourceDialog {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-customer': customElements.get(CustomerElement.defaultNodeName),
    };
  }

  closable = true;

  render(): TemplateResult {
    return super.render(() => {
      return html`
        <foxy-customer
          .lang=${this.lang}
          .href=${this.href}
          id="form"
          @update=${(evt: UpdateEvent) => {
            this.closable = evt.detail.state.includes('idle');
          }}
        >
        </foxy-customer>
      `;
    });
  }

  async save(): Promise<void> {
    const form = this.renderRoot.querySelector('#form') as CustomerElement;
    form.submit();
  }
}
