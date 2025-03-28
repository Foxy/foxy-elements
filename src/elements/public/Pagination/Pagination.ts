import type { PropertyDeclarations, TemplateResult, CSSResultArray } from 'lit-element';

import { LitElement, html, css, svg } from 'lit-element';
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
    if (!limitOptions.includes(this.__limit)) limitOptions.unshift(this.__limit);
    const pages = total && this.__limit ? Math.ceil(total / this.__limit) : 0;

    return html`
      <slot @slotchange=${this.__connectPageElement}></slot>

      <div class="flex gap-m relative mt-s" ?hidden=${pages <= 1}>
        <div class="absolute inset-0 flex items-center justify-center">
          <vaadin-button
            theme="tertiary-inline contrast"
            ?disabled=${this.disabled}
            @click=${(evt: CustomEvent) => {
              const dialog = this.__dialog as HTMLDialogElement;
              const button = evt.currentTarget as HTMLElement;
              const buttonBox = button.getBoundingClientRect();

              dialog.showModal();
              const marginLeft = buttonBox.left + buttonBox.width / 2 - dialog.offsetWidth / 2;
              dialog.style.margin = `calc(var(--lumo-space-xs) + ${
                buttonBox.bottom
              }px) auto auto ${marginLeft.toFixed(2)}px`;

              if (dialog.getBoundingClientRect().bottom > window.innerHeight) {
                dialog.style.margin = `auto auto calc(${(
                  window.innerHeight - buttonBox.top
                ).toFixed(2)}px + var(--lumo-space-xs)) ${marginLeft.toFixed(2)}px`;
              }
            }}
          >
            <foxy-i18n
              infer=""
              class="text-xs leading-none"
              key="pagination"
              .options=${{
                total,
                from: (this.__page - 1) * this.__limit + 1,
                to: (this.__page - 1) * this.__limit + returnedItems,
              }}
            >
            </foxy-i18n>
          </vaadin-button>
        </div>

        <vaadin-button
          theme="tertiary-inline contrast"
          class="relative"
          ?disabled=${this.disabled || this.__page === 1}
          @click=${() => (this.__page = 1)}
        >
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline-block" style="width: 1em; height: 1em; transform: translate(-0.15em, -0.05em) scale(1.5)"><path fill-rule="evenodd" d="M4.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L6.31 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L4.72 9.47Zm9.25-4.25L9.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L11.31 10l3.72-3.72a.75.75 0 0 0-1.06-1.06Z" clip-rule="evenodd" /></svg>`}
          <foxy-i18n infer="" class="leading-none sr-only sm-not-sr-only" key="first"></foxy-i18n>
        </vaadin-button>

        <vaadin-button
          theme="tertiary-inline contrast"
          class="relative"
          ?disabled=${this.disabled || this.__page === 1}
          @click=${() => this.__page--}
        >
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline-block" style="width: 1em; height: 1em; transform: translate(-0.15em, -0.05em) scale(1.5)"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" /></svg>`}
          <foxy-i18n infer="" class="leading-none sr-only sm-not-sr-only" key="previous">
          </foxy-i18n>
        </vaadin-button>

        <div class="flex-1"></div>

        <vaadin-button
          theme="tertiary-inline contrast"
          class="relative"
          ?disabled=${this.disabled || this.__page >= pages}
          @click=${() => this.__page++}
        >
          <foxy-i18n infer="" class="leading-none sr-only sm-not-sr-only" key="next"></foxy-i18n>
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline-block" style="width: 1em; height: 1em; transform: translate(0.15em, -0.05em) scale(1.5)"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>`}
        </vaadin-button>

        <vaadin-button
          theme="tertiary-inline contrast"
          class="relative"
          ?disabled=${this.disabled || this.__page >= pages}
          @click=${() => (this.__page = pages)}
        >
          <foxy-i18n infer="" class="leading-none sr-only sm-not-sr-only" key="last"></foxy-i18n>
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline-block" style="width: 1em; height: 1em; transform: translate(0.15em, -0.05em) scale(1.5)"><path fill-rule="evenodd" d="M15.28 9.47a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L13.69 10 9.97 6.28a.75.75 0 0 1 1.06-1.06l4.25 4.25ZM6.03 5.22l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L8.69 10 4.97 6.28a.75.75 0 0 1 1.06-1.06Z" clip-rule="evenodd" /></svg>`}
        </vaadin-button>
      </div>

      <dialog
        class="p-0 shadow-m bg-transparent focus-outline-none"
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
          <foxy-internal-select-control
            placeholder=${this.t('select')}
            helper-text=""
            layout="summary-item"
            label=${this.t('per_page')}
            infer=""
            .options=${limitOptions.map(value => ({ rawLabel: value, value }))}
            .getValue=${() => this.__limit}
            .setValue=${(value: number) => {
              this.__dialog?.close();
              this.__limit = value;
              this.__page = 1;
            }}
          >
          </foxy-internal-select-control>

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
            @blur=${() => {
              this.__page = this.__customPage;
              this.__dialog?.close();
            }}
            @keydown=${(evt: KeyboardEvent) => {
              if (evt.key === 'Enter') {
                evt.preventDefault();
                this.__page = this.__customPage;
                this.__dialog?.close();
              }
            }}
          >
          </foxy-internal-number-control>
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
