import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { HypermediaCollection } from '../../private/HypermediaCollection/HypermediaCollection';
import { I18N } from '../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { debounce } from 'lodash-es';

type Transaction = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Transaction, undefined>;
type Collection = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Transactions, { zoom: 'items' }>;
type Items = Collection['_embedded']['fx:transactions'][number]['_embedded']['fx:items'];

const DEBOUNCE_WAIT = 250;

const statusColors = {
  approved: 'bg-contrast-10 text-contrast',
  authorized: 'bg-success-10 text-success',
  declined: 'bg-error-10 text-error',
  pending: 'bg-contrast-10 text-contrast',
  rejected: 'bg-error-10 text-error',
  completed: 'bg-success-10 text-success',
};

function getSummaryOpts(items: Items) {
  return {
    most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
    count: items.length,
  };
}

export class FoxyTransactionsElement extends HypermediaCollection<Collection> {
  static readonly defaultNodeName = 'foxy-transactions';

  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': TextFieldElement,
      'x-i18n': I18N,
    };
  }

  private __setSearch = debounce((search: string) => {
    if (!this.first) return;

    const oldURL = new URL(this.first);
    const newURL = new URL(this.first);
    const reservedNames = ['offset', 'limit'];

    newURL.search = search.trim();
    oldURL.searchParams.forEach((value, name) => {
      if (reservedNames.includes(name)) newURL.searchParams.set(name, value);
    });

    this.first = newURL.toString();
  }, DEBOUNCE_WAIT);

  constructor() {
    super('transactions');
  }

  render(): TemplateResult {
    const { ns, lang } = this;

    return html`
      <vaadin-text-field
        placeholder=${this._t('search_example').toString()}
        label=${this._t('search').toString()}
        class="w-full mb-m"
        clear-button-visible
        @input=${(evt: InputEvent) => {
          return this.__setSearch((evt.target as TextFieldElement).value);
        }}
      >
        <iron-icon icon="icons:search" slot="suffix"></iron-icon>
      </vaadin-text-field>

      <table class="w-full">
        <thead class="sr-only">
          <tr>
            <th>Total</th>
            <th>Summary</th>
            <th class="hidden md:table-cell">Status</th>
            <th class="hidden md:table-cell">ID</th>
            <th class="hidden md:table-cell">Date and time</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody class="font-lumo divide-y divide-contrast-10">
          ${this.pages.map(page => {
            return page._embedded['fx:transactions'].map(transaction => {
              return html`
                <tr>
                  <td class="h-l text-m text-body font-medium tracking-wide font-tnum">
                    ${this.__formatPrice(transaction)}
                  </td>

                  <td class="h-l text-m text-body">
                    <x-i18n
                      .ns=${ns}
                      .lang=${lang}
                      .opts=${getSummaryOpts(transaction._embedded['fx:items'])}
                      key="summary"
                    >
                    </x-i18n>
                  </td>

                  <td class="hidden h-l text-xs tracking-wide md:table-cell">
                    <x-i18n
                      .ns=${ns}
                      .lang=${lang}
                      key=${`status_${transaction.status}`}
                      class="px-xs rounded ${statusColors[transaction.status]}"
                    >
                    </x-i18n>
                  </td>

                  <td class="hidden h-l text-s text-secondary font-tnum md:table-cell">
                    <span class="text-tertiary">ID</span> ${transaction.id}
                  </td>

                  <td class="hidden h-l text-s text-secondary font-tnum md:table-cell">
                    ${this.__formatDate(transaction)}
                  </td>

                  <td class="h-l text-s text-right font-medium tracking-wide">
                    <a
                      class="text-primary rounded px-xs -mx-xs hover:underline focus:outline-none focus:shadow-outline"
                      href=${transaction._links['fx:receipt'].href}
                      target="_blank"
                    >
                      <x-i18n .ns=${ns} .lang=${lang} key="receipt"></x-i18n>
                    </a>
                  </td>
                </tr>
              `;
            });
          })}
        </tbody>
      </table>

      <div id="trigger"></div>
    `;
  }

  protected get _trigger(): HTMLElement | null {
    return this.shadowRoot?.getElementById('trigger') ?? null;
  }

  private __formatPrice(transaction: Transaction) {
    return transaction.total_order.toLocaleString(this.lang, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      currency: transaction.currency_code,
      style: 'currency',
    });
  }

  private __formatDate(transaction: Transaction) {
    const date = new Date(transaction.transaction_date);
    const now = new Date();

    return date.toLocaleString(this.lang, {
      year: now.getFullYear() === date.getFullYear() ? undefined : 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }
}
