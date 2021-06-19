import { CSSResult, CSSResultArray, PropertyDeclarations } from 'lit-element';
import { Collection, Column } from './types';
import { TemplateResult, html } from 'lit-html';

import { NucleonElement } from '../NucleonElement';
import { Themeable } from '../../../mixins/themeable';
import { addBreakpoints } from '../../../utils/add-breakpoints';
import { classMap } from '../../../utils/class-map';

/**
 * Configurable table element for HAL+JSON collections.
 *
 * @element foxy-table
 * @since 1.1.0
 */
export class Table<TData extends Collection> extends NucleonElement<TData> {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      columns: { attribute: false },
    };
  }

  /** @readonly */
  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  /** Array of column templates. See `Column` type for more details. */
  columns: Column<TData>[] = [];

  private __removeBreakpoints?: () => void;

  /** @readonly */
  connectedCallback(): void {
    super.connectedCallback();
    this.__removeBreakpoints = addBreakpoints(this);
  }

  /** @readonly */
  render(): TemplateResult {
    return html`
      <div data-testid="wrapper" class="relative" aria-busy=${this.in('busy')} aria-live="polite">
        <table class="table-fixed w-full" data-testid="table">
          <thead class="sr-only">
            <tr>
              ${this.columns.map(column => {
                return html`
                  <th>${column.header?.({ data: this.data, html, lang: this.lang })}</th>
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
                          'hidden sm-table-cell': column.hideBelow === 'sm',
                          'hidden md-table-cell': column.hideBelow === 'md',
                          'hidden lg-table-cell': column.hideBelow === 'lg',
                          'hidden xl-table-cell': column.hideBelow === 'xl',
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

  /** @readonly */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__removeBreakpoints?.();
  }

  private get __rows() {
    const defaultLimit = 20;
    const items = Object.values(this.data?._embedded ?? {}).reduce((p, c) => [...p, ...c], []);

    let rowCount: number;

    try {
      const strLimit = new URL(this.href ?? '').searchParams.get('limit');
      const intLimit = strLimit ? parseInt(strLimit) : defaultLimit;
      rowCount = Math.max(isNaN(intLimit) ? defaultLimit : intLimit, items.length);
    } catch {
      rowCount = defaultLimit;
    }

    return new Array(rowCount).fill(null).map((v, i) => items[i] ?? v);
  }
}
