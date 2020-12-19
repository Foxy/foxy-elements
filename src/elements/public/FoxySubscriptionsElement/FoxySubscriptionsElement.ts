import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { ActionsCell } from './private/ActionsCell';
import { CollectionTable } from '../../private/CollectionTable/CollectionTable';
import { FrequencyCell } from './private/FrequencyCell';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { StatusCell } from './private/StatusCell';
import { SummaryCell } from './private/SummaryCell';
import { spread } from '@open-wc/lit-helpers';

type Collection = FoxySDK.Core.Resource<
  FoxySDK.Integration.Rels.Subscriptions,
  { zoom: [{ transaction_template: 'items' }, 'last_transaction'] }
>;

export class FoxySubscriptionsElement extends CollectionTable<Collection> {
  static readonly defaultNodeName = 'foxy-subscriptions';

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'td-frequency': FrequencyCell,
      'td-summary': SummaryCell,
      'td-status': StatusCell,
      'td-actions': ActionsCell,
    };
  }

  constructor() {
    super('subscriptions');
  }

  render(): TemplateResult {
    const i18n = spread({
      lang: this.lang,
      ns: this.ns,
    });

    return super.render([
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
        cell: sub => html`<td-actions ...=${i18n} .context=${sub}></td-actions>`,
      },
    ]);
  }
}
