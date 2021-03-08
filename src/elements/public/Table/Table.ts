import { CSSResult, CSSResultArray, PropertyDeclarations } from 'lit-element';
import { Collection, Column } from './types';
import { TemplateResult, html } from 'lit-html';

import { NucleonElement } from '../NucleonElement/index';
import { Themeable } from '../../../mixins/themeable';
import { addBreakpoints } from '../../../utils/add-breakpoints';
import { classMap } from '../../../utils/class-map';

export class Table<TData extends Collection> extends NucleonElement<TData> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      columns: { attribute: false },
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  columns: Column<TData>[] = [];

  private __removeBreakpoints?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__removeBreakpoints = addBreakpoints(this);
  }

  render(): TemplateResult {
    return html`
      <div data-testid="wrapper" class="relative" aria-busy=${this.in('busy')} aria-live="polite">
        <table class="table-fixed w-full" data-testid="table">
          <thead class="sr-only">
            <tr>
              ${this.columns.map(column => {
                return html`
                  <th>${column.header?.({ html, lang: this.lang, data: this.data })}</th>
                `;
              })}
            </tr>
          </thead>

          <tbody class="divide-y divide-contrast-10 ">
            ${this.__rows.map(resource => {
              return html`
                <tr class="h-l">
                  ${this.columns?.map((column, columnIndex) => {
                    return html`
                      <td
                        class=${classMap({
                          'text-right': columnIndex === this.columns.length - 1,
                          'hidden sm:table-cell': column.hideBelow === 'sm',
                          'hidden md:table-cell': column.hideBelow === 'md',
                          'hidden lg:table-cell': column.hideBelow === 'lg',
                          'hidden xl:table-cell': column.hideBelow === 'xl',
                          'truncate h-l font-lumo text-body text-m': true,
                        })}
                      >
                        ${resource ? column.cell?.({ html, lang: this.lang, data: resource }) : ''}
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
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  state=${this.in('busy') ? 'busy' : this.in('idle') ? 'empty' : 'error'}
                  layout="vertical"
                  data-testid="spinner"
                >
                </foxy-spinner>
              </div>
            `
          : ''}
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__removeBreakpoints?.();
  }

  private get __rows() {
    let rowCount: number;

    try {
      const maxLimit = 10;
      const strLimit = new URL(this.href ?? '').searchParams.get('limit');
      const intLimit = strLimit ? parseInt(strLimit) : maxLimit;
      rowCount = isNaN(intLimit) ? maxLimit : intLimit;
    } catch {
      rowCount = 10;
    }

    const array = new Array(rowCount).fill(null);
    const items = Object.values(this.data?._embedded ?? {}).reduce((p, c) => [...p, ...c], []);

    return array.map((v, i) => items[i] ?? v);
  }
}
