import '@polymer/iron-icon';
import '@polymer/iron-icons';

import type * as FoxySDK from '@foxy.io/sdk';

import { TemplateResult, html } from 'lit-html';

import { HypermediaCollection } from '../../private/HypermediaCollection/HypermediaCollection';
import { I18N } from '../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { debounce } from 'lodash-es';
import { parseDuration } from '../../../utils/parse-duration';

type Collection = FoxySDK.Core.Resource<
  FoxySDK.Integration.Rels.Subscriptions,
  { zoom: [{ transaction_template: 'items' }, 'last_transaction'] }
>;

type Resource = Collection['_embedded']['fx:subscriptions'][number];

const DEBOUNCE_WAIT = 250;

function getSummaryTitleOpts(sub: Resource) {
  const items = sub._embedded['fx:transaction_template']._embedded['fx:items'];
  return {
    most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
    count: items.length,
  };
}

function getSummarySubtitleParams(sub: Resource, lang: string) {
  let status = '';
  let color = '';
  let date: Date | null = null;

  if (sub.first_failed_transaction_date) {
    date = new Date(sub.first_failed_transaction_date);
    status = 'failed';
    color = 'error';
  } else if (sub.end_date) {
    date = new Date(sub.end_date);
    status = date.getTime() > Date.now() ? 'will_be_cancelled' : 'cancelled';
    color = date.getTime() > Date.now() ? 'success' : 'tertiary';
  } else {
    date = new Date(sub.next_transaction_date);
    status = 'active';
    color = 'success';
  }

  return {
    key: `status_${status}`,
    color: `text-${color}`,
    opts: {
      date: date?.toLocaleDateString(lang, {
        year: date.getFullYear() === new Date().getFullYear() ? 'full' : undefined,
        month: 'long',
        day: 'numeric',
      }),
    },
  };
}

function getIcon(subscription: Resource) {
  if (subscription?.first_failed_transaction_date) return 'error-outline';
  if (subscription?.end_date) return 'done-all';
  return 'done';
}

function getIconClass(subscription: Resource) {
  if (subscription?.first_failed_transaction_date) return 'text-error bg-error-10';
  if (subscription?.end_date) return 'text-contrast bg-contrast-5';
  return 'text-success bg-success-10';
}

export class Subscriptions extends HypermediaCollection<Collection> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': TextFieldElement,
      'iron-icon': customElements.get('iron-icon'),
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
    super('subscriptions');
  }

  render(): TemplateResult {
    return html`
      <vaadin-text-field
        placeholder=${this._t('search_example').toString()}
        label=${this._t('search').toString()}
        class="w-full mb-l"
        clear-button-visible
        @input=${(evt: InputEvent) => {
          return this.__setSearch((evt.target as TextFieldElement).value);
        }}
      >
        <iron-icon icon="icons:search" slot="suffix"></iron-icon>
      </vaadin-text-field>

      <table class="block">
        <thead class="sr-only">
          <tr>
            <th>${this._t('th_status')}</th>
            <th>${this._t('th_summary')}</th>
            <th>${this._t('th_amount')}</th>
          </tr>
        </thead>

        <tbody class="block space-y-m">
          ${this.pages.map(page => {
            return page._embedded['fx:subscriptions'].map(subscription => {
              const iconClass = getIconClass(subscription);
              const summarySubtitleParams = getSummarySubtitleParams(subscription, this.lang);
              const frequency = parseDuration(subscription.frequency);

              return html`
                <tr class="p-s flex items-center rounded-t-l rounded-b-l border border-contrast-10">
                  <td class="p-0 flex-shrink-0">
                    <div class="${iconClass} h-l w-l flex items-center justify-center rounded-full">
                      <iron-icon icon=${getIcon(subscription)}></iron-icon>
                    </div>
                  </td>

                  <td class="py-0 px-m min-w-0 mr-auto leading-s">
                    <x-i18n
                      .ns=${this.ns}
                      .lang=${this.lang}
                      .opts=${getSummaryTitleOpts(subscription)}
                      class="min-w-0 truncate block text-m text-body font-medium"
                      key="summary"
                    >
                    </x-i18n>

                    <x-i18n
                      .ns=${this.ns}
                      .lang=${this.lang}
                      .key=${summarySubtitleParams.key}
                      .opts=${summarySubtitleParams.opts}
                      class="${summarySubtitleParams.color} min-w-0 truncate block text-s"
                    >
                    </x-i18n>
                  </td>

                  <td class="p-0 mr-s flex-shrink-0 font-tnum leading-s text-right">
                    <span class="block text-m font-medium text-body">
                      ${this.__formatPrice(subscription)}
                    </span>

                    <x-i18n
                      key="frequency"
                      class="block text-s"
                      .ns=${this.ns}
                      .lang=${this.lang}
                      .opts=${{
                        units: this._t(frequency.units, { count: frequency.count }),
                        count: frequency.count,
                      }}
                    >
                    </x-i18n>
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

  private __formatPrice(subscription: Resource) {
    const transaction = subscription._embedded['fx:last_transaction'];
    return transaction.total_order.toLocaleString(this.lang, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      currency: transaction.currency_code,
      style: 'currency',
    });
  }
}
