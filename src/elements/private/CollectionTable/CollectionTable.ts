import { ErrorScreen, I18N, Skeleton } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { HypermediaCollection } from '../../private/HypermediaCollection/HypermediaCollection';
import { Primitive } from 'lit-html/lib/parts';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { classMap } from '../../../utils/class-map';
import { debounce } from 'lodash-es';

const DEBOUNCE_WAIT = 250;

export type Collection<TCurie extends string = any, TResource = any> = {
  readonly _links: Record<'next' | 'self', { href: string }>;
  readonly _embedded: Record<TCurie, readonly TResource[]>;
  readonly total_items: number;
  readonly returned_items: number;
  readonly offset: number;
  readonly limit: number;
};

export interface Column<T extends Collection> {
  mdAndUp?: boolean;
  header: () => TemplateResult | Primitive;
  cell: (resource: T['_embedded'][keyof T['_embedded']][number]) => TemplateResult | Primitive;
}

export abstract class CollectionTable<T extends Collection> extends HypermediaCollection<T> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': TextFieldElement,
      'x-error-screen': ErrorScreen,
      'x-skeleton': Skeleton,
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

  render(columns?: Column<T>[]): TemplateResult {
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

      <div style="min-height: calc(${this._getLimit()} * var(--lumo-size-l))">
        <table class="table-fixed w-full" aria-busy=${this._is('busy.fetching')} aria-live="polite">
          <thead class="sr-only">
            <tr>
              ${columns?.map(column => {
                return html`
                  <th class=${classMap({ 'hidden md:table-cell': !!column.mdAndUp })}>
                    ${column.header()}
                  </th>
                `;
              })}
            </tr>
          </thead>

          <tbody class="divide-y divide-contrast-10 ">
            ${this.pages.map(page => {
              return Object.keys(page._embedded).map(key => {
                return page._embedded[key].map(resource => {
                  return html`
                    <tr>
                      ${columns?.map((column, columnIndex) => {
                        return html`
                          <td
                            class=${classMap({
                              'truncate h-l font-lumo text-body text-m': true,
                              'hidden md:table-cell': !!column.mdAndUp,
                              'text-right': columnIndex === columns.length - 1,
                            })}
                          >
                            ${column.cell(resource)}
                          </td>
                        `;
                      })}
                    </tr>
                  `;
                });
              });
            })}
          </tbody>
        </table>

        <div class="relative">
          <div
            class=${classMap({
              'divide-y divide-contrast-10': true,
              'border-t border-contrast-10': this.pages.length > 0,
            })}
          >
            ${this._is('busy.fetching') || this._is('error')
              ? new Array(this._getLimit()).fill(0).map(() => {
                  return html`
                    <div class="h-l flex items-center">
                      <x-skeleton class="w-full" variant=${this._is('error') ? 'error' : 'busy'}>
                        &nbsp;
                      </x-skeleton>
                    </div>
                  `;
                })
              : ''}
          </div>

          ${this._is('error') ? html`<x-error-screen></x-error-screen>` : ''}
        </div>

        <div id="trigger"></div>
      </div>
    `;
  }

  protected get _trigger(): HTMLElement | null {
    return this.renderRoot?.getElementById('trigger') ?? null;
  }
}
