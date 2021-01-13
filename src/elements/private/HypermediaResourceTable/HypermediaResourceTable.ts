import { I18N, Skeleton } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { HypermediaResource } from '../HypermediaResource/HypermediaResource';
import { Primitive } from 'lit-html/lib/parts';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { classMap } from '../../../utils/class-map';

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

export abstract class HypermediaResourceTable<T extends Collection> extends HypermediaResource<T> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'x-skeleton': Skeleton,
      'x-i18n': I18N,
    };
  }

  render(columns?: Column<T>[]): TemplateResult {
    return html`
      <div class="relative" aria-busy=${this._is('busy.fetching')} aria-live="polite">
        ${this._is('busy.fetching') || this._is('error')
          ? html`
              <div class="divide-y divide-contrast-10">
                ${new Array(this._getLimit()).fill(0).map(() => {
                  return html`
                    <div class="h-l flex items-center">
                      <x-skeleton class="w-full" variant=${this._is('error') ? 'error' : 'busy'}>
                        &nbsp;
                      </x-skeleton>
                    </div>
                  `;
                })}
              </div>
            `
          : html`
              <table class="w-full">
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
                  ${Object.values(this.resource?._embedded ?? {}).map(embeds => {
                    return embeds.map(resource => {
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
                  })}
                </tbody>
              </table>
            `}
      </div>
    `;
  }

  protected _getLimit(): number {
    const defaultLimit = 20;

    try {
      const strLimit = new URL(this.href ?? '').searchParams.get('limit');
      const intLimit = strLimit ? parseInt(strLimit) : defaultLimit;
      return isNaN(intLimit) ? defaultLimit : intLimit;
    } catch {
      return defaultLimit;
    }
  }
}
