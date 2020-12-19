import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { CollectionTableCell } from '../../../private/CollectionTable/CollectionTableCell';
import { I18N } from '../../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Subscription = FoxySDK.Core.Resource<
  FoxySDK.Integration.Rels.Subscription,
  { zoom: { transaction_template: 'items' } }
>;

export class SummaryCell extends CollectionTableCell<Subscription> {
  static get scopedElements(): ScopedElementsMap {
    return { 'x-i18n': I18N };
  }

  render(): TemplateResult {
    if (!this.context) return html``;

    const items = this.context._embedded['fx:transaction_template']._embedded['fx:items'];
    const opts = {
      most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
      count: items.length,
    };

    return html`<x-i18n .ns=${this.ns} .lang=${this.lang} .opts=${opts} key="summary"></x-i18n>`;
  }
}
