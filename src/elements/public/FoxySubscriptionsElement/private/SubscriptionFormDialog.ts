import * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { Dialog } from '../../../private/Dialog/Dialog';
import { FoxySubscriptionFormElement } from '../../FoxySubscriptionForm';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Subscription = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Subscription, undefined>;

export class SubscriptionFormDialog extends Dialog {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      resource: { attribute: false },
    };
  }

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-subscription-form': customElements.get(FoxySubscriptionFormElement.defaultNodeName),
    };
  }

  resource: Subscription | null = null;

  render(): TemplateResult {
    return super.render(() => {
      return html`
        <foxy-subscription-form .ns=${this.ns} .lang=${this.lang} .resource=${this.resource}>
        </foxy-subscription-form>
      `;
    });
  }
}
