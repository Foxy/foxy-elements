import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { ActionsCell } from './private/ActionsCell';
import { CollectionTable } from '../../private/CollectionTable/CollectionTable';
import { FrequencyCell } from './private/FrequencyCell';
import { Modal } from '../../private/Modal/Modal';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { StatusCell } from './private/StatusCell';
import { SubscriptionForm } from './private/SubscriptionForm';
import { SummaryCell } from './private/SummaryCell';
import { spread } from '@open-wc/lit-helpers';

type Subscriptions = FoxySDK.Core.Resource<
  FoxySDK.Integration.Rels.Subscriptions,
  { zoom: [{ transaction_template: 'items' }, 'last_transaction'] }
>;

type Subscription = FoxySDK.Core.Resource<
  FoxySDK.Integration.Rels.Subscription,
  { zoom: [{ transaction_template: 'items' }, 'last_transaction'] }
>;

export class FoxySubscriptionsElement extends CollectionTable<Subscriptions> {
  static readonly defaultNodeName = 'foxy-subscriptions';

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'td-frequency': FrequencyCell,
      'td-summary': SummaryCell,
      'td-status': StatusCell,
      'td-actions': ActionsCell,
      'x-modal': Modal,
      'x-subscription-form': SubscriptionForm,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __selectedSubscription: { attribute: false },
    };
  }

  private __selectedSubscription: Subscription | null = null;

  constructor() {
    super('subscriptions');
  }

  render(): TemplateResult {
    const i18n = spread({
      lang: this.lang,
      ns: this.ns,
    });

    return html`
      <x-modal
        ?open=${!!this.__selectedSubscription}
        class="fixed top-0 inset-x-0 z-50"
        closable
        editable
        @close=${() => (this.__selectedSubscription = null)}
      >
        <x-i18n ...=${i18n} key="edit_header" slot="header"></x-i18n>
        ${this.__selectedSubscription
          ? html`
              <x-subscription-form ...=${i18n} .resource=${this.__selectedSubscription}>
              </x-subscription-form>
            `
          : ''}
      </x-modal>

      ${super.render([
        {
          header: () => this._t('th-frequency').toString(),
          cell: sub => html`<td-frequency ...=${i18n} .context=${sub}></td-frequency>`,
        },
        {
          header: () => this._t('th_summary').toString(),
          cell: sub => html`<td-summary ...=${i18n} .context=${sub}></td-summary>`,
        },
        {
          mdAndUp: true,
          header: () => this._t('th_status').toString(),
          cell: sub => html`<td-status ...=${i18n} .context=${sub}></td-status>`,
        },
        {
          header: () => this._t('th_actions').toString(),
          cell: sub =>
            html`<td-actions
              ...=${i18n}
              .context=${sub}
              @edit=${() => (this.__selectedSubscription = sub)}
            ></td-actions>`,
        },
      ])}
    `;
  }
}
