import { Collection, Column, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/index';
import { PropertyDeclarations } from 'lit-element';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const Base = ConfigurableMixin(ResponsiveMixin(ThemeableMixin(TranslatableMixin(NucleonElement))));

/**
 * Configurable table element for HAL+JSON collections.
 *
 * @element foxy-table
 * @since 1.1.0
 */
export class Table<TData extends Collection> extends Base<TData> {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      columns: { attribute: false },
    };
  }

  templates: Templates<TData> = {};

  /** Array of column templates. See `Column` type for more details. */
  columns: Column<TData>[] = [];

  /** @readonly */
  render(): TemplateResult {
    return html`
      <div data-testid="wrapper" class="relative" aria-busy=${this.in('busy')} aria-live="polite">
        <table class="table-fixed w-full" data-testid="table">
          <thead class="sr-only">
            <tr>
              ${this.columns.map(column => {
                return html`
                  <th>
                    ${column.header?.({ html, lang: this.lang, data: this.data, ns: this.ns })}
                  </th>
                `;
              })}
            </tr>
          </thead>

          <tbody class="divide-y divide-contrast-10">
            ${this.__rows.map(resource => {
              return html`
                <tr class="h-l">
                  ${this.columns?.map((column, columnIndex) => {
                    return html`
                      <td
                        class=${classMap({
                          'text-right': columnIndex === this.columns.length - 1,
                          'hidden sm-table-cell': column.hideBelow === 'sm',
                          'hidden md-table-cell': column.hideBelow === 'md',
                          'hidden lg-table-cell': column.hideBelow === 'lg',
                          'hidden xl-table-cell': column.hideBelow === 'xl',
                          'truncate h-l font-lumo text-body text-m': true,
                        })}
                      >
                        ${resource
                          ? column.cell?.({ html, lang: this.lang, data: resource, ns: this.ns })
                          : ''}
                      </td>
                    `;
                  })}
                </tr>
              `;
            })}
          </tbody>
        </table>

        ${!this.in({ idle: 'snapshot' })
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  data-testid="spinner"
                  layout="vertical"
                  state=${this.in('busy') ? 'busy' : this.in('idle') ? 'empty' : 'error'}
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  lang=${this.lang}
                  ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
                >
                </foxy-spinner>
              </div>
            `
          : ''}
      </div>

      ${this.renderTemplateOrSlot()}
    `;
  }

  private get __rows() {
    const defaultLimit = 20;
    const items = Object.values(this.data?._embedded ?? {}).reduce((p, c) => [...p, ...c], []);

    let rowCount: number;

    if (items.length === 0) {
      try {
        const strLimit = new URL(this.href ?? '').searchParams.get('limit');
        const intLimit = parseInt(strLimit ?? '');
        rowCount = isNaN(intLimit) ? defaultLimit : intLimit;
      } catch {
        rowCount = defaultLimit;
      }
    } else {
      rowCount = items.length;
    }

    return new Array(rowCount).fill(null).map((v, i) => items[i] ?? v);
  }
}
