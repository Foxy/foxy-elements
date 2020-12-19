import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { ActionsCell } from './private/ActionsCell';
import { CollectionTable } from '../../private/CollectionTable/CollectionTable';
import { DateCell } from './private/DateCell';
import { IDCell } from './private/IDCell';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { StatusCell } from './private/StatusCell';
import { SummaryCell } from './private/SummaryCell';
import { TotalCell } from './private/TotalCell';
import { spread } from '@open-wc/lit-helpers';

type Collection = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Transactions, { zoom: 'items' }>;

export class FoxyTransactionsElement extends CollectionTable<Collection> {
  static readonly defaultNodeName = 'foxy-transactions';

  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'td-total': TotalCell,
      'td-summary': SummaryCell,
      'td-status': StatusCell,
      'td-id': IDCell,
      'td-date': DateCell,
      'td-actions': ActionsCell,
    };
  }

  constructor() {
    super('transactions');
  }

  render(): TemplateResult {
    const i18n = spread({
      lang: this.lang,
      ns: this.ns,
    });

    return super.render([
      {
        header: () => this._t('th_total').toString(),
        cell: transaction => html`<td-total ...=${i18n} .context=${transaction}></td-total>`,
      },
      {
        header: () => this._t('th_summary').toString(),
        cell: transaction => html`<td-summary ...=${i18n} .context=${transaction}></td-summary>`,
      },
      {
        mdAndUp: true,
        header: () => this._t('th_status').toString(),
        cell: transaction => html`<td-status ...=${i18n} .context=${transaction}></td-status>`,
      },
      {
        mdAndUp: true,
        header: () => this._t('th_id').toString(),
        cell: transaction => html`<td-id ...=${i18n} .context=${transaction}></td-id>`,
      },
      {
        mdAndUp: true,
        header: () => this._t('th_date').toString(),
        cell: transaction => html`<td-date ...=${i18n} .context=${transaction}></td-date>`,
      },
      {
        header: () => this._t('th_actions').toString(),
        cell: transaction => html`<td-actions ...=${i18n} .context=${transaction}></td-actions>`,
      },
    ]);
  }
}
