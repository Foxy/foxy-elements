import { TemplateResult, html } from 'lit-html';

import { HypermediaResourceDialog } from '../../../private/Dialog/HypermediaResourceDialog';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { SubscriptionFormElement } from '../../SubscriptionForm';

export class FormDialogElement extends HypermediaResourceDialog {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-subscription-form': customElements.get(SubscriptionFormElement.defaultNodeName),
    };
  }

  render(): TemplateResult {
    return super.render(() => {
      return html`
        <foxy-subscription-form .ns=${this.ns} .lang=${this.lang} .href=${this.href}>
        </foxy-subscription-form>
      `;
    });
  }
}
