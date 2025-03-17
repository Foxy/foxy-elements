import type { PropertyDeclarations, TemplateResult, CSSResultArray } from 'lit-element';

import { LitElement, html, css } from 'lit-element';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../NucleonElement/NucleonElement';

import get from 'lodash-es/get';

const NS = 'pagination';
const Base = ConfigurableMixin(
  ThemeableMixin(TranslatableMixin(ResponsiveMixin(InferrableMixin(LitElement)), NS))
);

/**
 * Helper element that adds pagination controls to elements
 * representing Hypermedia API collection pages. Works with NucleonElement instances only.
 * Page element **MUST** be a direct descendant of `foxy-pagination`.
 *
 * @example
 * ```html
 * <foxy-pagination first="https://demo.api/hapi/customers?limit=3">
 *   <foxy-customers-table></foxy-customers-table>
 * </foxy-pagination>
 * ```
 *
 * @element foxy-pagination
 * @since 1.15.0
 */
export class Pagination extends Base {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      first: { type: String },
      __pageElement: { attribute: false },
      __customPage: { attribute: false },
      __first: { attribute: false },
      __limit: { attribute: false },
      __page: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        dialog {
          --position-bottom: translate(-100%, var(--lumo-space-m));
          --position-top: translate(calc(-100% - 1px), calc(-100% - var(--lumo-space-m) - 1px));
          border-radius: calc(var(--lumo-border-radius-m) + 1px);
        }

        dialog::backdrop {
          background: transparent;
        }
      `,
    ];
  }

  private readonly __handlePageElementUpdate = () => this.requestUpdate();

  private readonly __handleScrollAndResize = () => {
    this.renderRoot.querySelector('dialog')?.close();
  };

  private __pageElement: NucleonElement<any> | null = null;

  private __customPage = 1;

  private __first = '';

  private __limit = 20;

  private __page = 1;

  /** URL of the first page of the collection. */
  get first(): string {
    return this.__first;
  }

  set first(newValue: string) {
    this.__first = newValue;
    this.__page = 1;

    try {
      const url = new URL(newValue);
      const limit = parseInt(url.searchParams.get('limit') ?? '');
      this.__limit = Number.isNaN(limit) || limit < 1 || limit > 200 ? 20 : limit;
    } catch {
      this.__limit = 20;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.__connectPageElement();
    addEventListener('scroll', this.__handleScrollAndResize);
    addEventListener('resize', this.__handleScrollAndResize);
  }

  render(): TemplateResult {
    const data = this.__pageElement?.data;

    const returnedItemsValue = Number(get(data, 'returned_items'));
    const returnedItems = Number.isNaN(returnedItemsValue) ? 0 : returnedItemsValue;

    const totalValue = Number(get(data, 'total_items'));
    const total = Number.isNaN(totalValue) ? 0 : totalValue;

    const limitOptions = [20, 50, 100, 150, 200];
    const maxPageLinks = 5;
    const offsetValue = Number(get(data, 'offset'));
    const offset = Number.isNaN(offsetValue) ? 0 : offsetValue;
    const pages = total && this.__limit ? Math.ceil(total / this.__limit) : 0;

    return html`
      <slot @slotchange=${this.__connectPageElement}></slot>

      ${offset > 0 || offset + returnedItems < total
        ? html`
            <div class="flex items-center gap-xs mt-s">
              <label class="text-tertiary" for="limit">
                <foxy-i18n infer="" key="per_page"></foxy-i18n>
              </label>

              <select
                class="mr-auto cursor-pointer appearance-none bg-transparent rounded-s font-medium px-xs transition-opacity hover-opacity-80 focus-outline-none focus-ring-2 focus-ring-primary-50"
                id="limit"
                ?disabled=${this.disabled}
                @change=${(evt: Event) => {
                  this.__limit = parseInt((evt.currentTarget as HTMLSelectElement).value);
                  this.__page = 1;
                }}
              >
                ${limitOptions.includes(this.__limit)
                  ? ''
                  : html`<option value=${this.__limit} selected>${this.__limit}</option>`}
                ${limitOptions.map(
                  option =>
                    html`
                      <option value=${option} ?selected=${option === this.__limit}>
                        ${option}
                      </option>
                    `
                )}
              </select>

              <foxy-i18n class="text-tertiary sr-only sm-not-sr-only" infer="" key="jump_to">
              </foxy-i18n>

              ${new Array(pages).fill('').map((_, pageIndex) => {
                if (!(pageIndex < maxPageLinks + 1 || pageIndex === pages - 1)) return;

                const isEllipsis = pageIndex === maxPageLinks && pages > maxPageLinks + 2;
                const isCurrentPage = this.__page === pageIndex + 1;

                return html`
                  <vaadin-button
                    data-testclass="page-link"
                    theme="tertiary-inline contrast"
                    class="relative px-xs ${pageIndex === pages - 1 ? '-mr-xs' : ''}"
                    ?disabled=${this.disabled || (isCurrentPage && !isEllipsis)}
                    @click=${(evt: MouseEvent) => {
                      if (isEllipsis) {
                        const dialog = this.__dialog as HTMLDialogElement;
                        dialog.showModal();

                        const elementRight = this.getBoundingClientRect().right;
                        dialog.style.margin = `${evt.clientY}px auto auto ${elementRight}px`;

                        const dialogBottom = dialog.getBoundingClientRect().bottom;
                        const dialogPosition = dialogBottom > innerHeight ? 'top' : 'bottom';
                        dialog.style.transform = `var(--position-${dialogPosition})`;
                      } else {
                        this.__page = pageIndex + 1;
                      }
                    }}
                  >
                    ${isEllipsis
                      ? this.__page > maxPageLinks && this.__page !== pages
                        ? html`
                            <span
                              class="inline-block transform origin-top scale-50"
                              style="--tw-translate-y: 0.1em;"
                            >
                              ${this.__page}
                            </span>
                            <span class="absolute inset-x-0 bottom-0">...</span>
                          `
                        : '...'
                      : pageIndex + 1}
                  </vaadin-button>
                `;
              })}
            </div>
          `
        : ''}

      <dialog
        class="p-0 shadow-m bg-transparent"
        @click=${(evt: MouseEvent) => {
          const dialog = evt.currentTarget as HTMLDialogElement;
          const dialogBox = dialog.getBoundingClientRect();
          const clickedInsideDialog =
            dialogBox.top <= evt.clientY &&
            evt.clientY <= dialogBox.top + dialogBox.height &&
            dialogBox.left <= evt.clientX &&
            evt.clientX <= dialogBox.left + dialogBox.width;

          if (!clickedInsideDialog) dialog.close();
        }}
      >
        <foxy-internal-summary-control
          helper-text=""
          label=""
          infer=""
          class="bg-base rounded border border-base"
          style="width: 18rem"
        >
          <foxy-internal-number-control
            placeholder="1"
            helper-text=""
            layout="summary-item"
            label=${this.t('page_number')}
            infer=""
            step="1"
            min="1"
            max=${pages}
            .getValue=${() => this.__customPage}
            .setValue=${(value: number) => (this.__customPage = value || 1)}
            @keydown=${(evt: KeyboardEvent) => {
              if (evt.key === 'Enter') {
                this.__page = this.__customPage;
                this.__dialog?.close();
              }
            }}
          >
          </foxy-internal-number-control>
          <div>
            <vaadin-button
              theme="tertiary-inline"
              ?disabled=${this.disabled}
              @click=${() => {
                this.__page = this.__customPage;
                this.__dialog?.close();
              }}
            >
              <foxy-i18n infer="" key="jump"></foxy-i18n>
            </vaadin-button>
          </div>
        </foxy-internal-summary-control>
      </dialog>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);

    const triggerProps = ['__first', '__limit', '__page'] as (keyof this)[];
    if (!triggerProps.some(prop => changes.has(prop))) return;

    try {
      const url = new URL(this.__first);
      const limit = this.__limit;
      const offset = this.__limit * (this.__page - 1);

      url.searchParams.delete('limit');
      url.searchParams.delete('offset');

      if (limit) url.searchParams.set('limit', limit.toString());
      if (offset) url.searchParams.set('offset', offset.toString());
      if (this.__pageElement) this.__pageElement.href = url.toString();
    } catch {
      //
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__disconnectPageElement();
    removeEventListener('scroll', this.__handleScrollAndResize);
    removeEventListener('resize', this.__handleScrollAndResize);
  }

  private get __dialog() {
    return this.renderRoot.querySelector('dialog');
  }

  private __disconnectPageElement() {
    this.__pageElement?.removeEventListener('update', this.__handlePageElementUpdate);
    this.__pageElement = null;
  }

  private __connectPageElement() {
    this.__disconnectPageElement();

    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot');
    const assignedElements = slot?.assignedElements() ?? [];
    const firstNucleonElement = assignedElements.find(el => el instanceof NucleonElement) as
      | NucleonElement<any>
      | undefined;

    if (firstNucleonElement) {
      this.__pageElement = firstNucleonElement;
      this.__pageElement.addEventListener('update', this.__handlePageElementUpdate);
      this.__pageElement.href = this.first;
    }
  }
}
