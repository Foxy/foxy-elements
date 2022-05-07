import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import get from 'lodash-es/get';
import { InferrableMixin } from '../../../mixins/inferrable';

const NS = 'pagination';
const Base = ResponsiveMixin(
  ConfigurableMixin(ThemeableMixin(TranslatableMixin(InferrableMixin(LitElement), NS)))
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
    };
  }

  private __pageElement: NucleonElement<any> | null = null;

  private __rerender = () => this.requestUpdate();

  private __first = '';

  /** URL of the first page of the colletion. */
  get first(): string {
    return this.__first;
  }

  set first(newValue: string) {
    this.__first = newValue;
    if (this.__pageElement) this.__pageElement.href = newValue;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.__connectPageElement();
  }

  render(): TemplateResult {
    const data = this.__pageElement?.data;
    const { disabled, lang, ns } = this;

    const returnedItemsValue = Number(get(data, 'returned_items'));
    const returnedItems = Number.isNaN(returnedItemsValue) ? 0 : returnedItemsValue;

    const totalItemsValue = Number(get(data, 'total_items'));
    const totalItems = Number.isNaN(totalItemsValue) ? 0 : totalItemsValue;

    const offsetValue = Number(get(data, 'offset'));
    const offset = Number.isNaN(offsetValue) ? 0 : offsetValue;

    const canGoBack = !disabled && offset > 0;
    const canGoForth = !disabled && offset + returnedItems < totalItems;

    const labelClass = 'sr-only sm-not-sr-only';

    return html`
      <slot @slotchange=${this.__connectPageElement}></slot>

      <div class="grid grid-cols-3 gap-s items-center -mx-xs">
        <div class="flex items-center space-x-s">
          <vaadin-button
            data-testid="first"
            theme="contrast tertiary-inline"
            ?disabled=${!canGoBack}
            @click=${() => this.__goTo('first')}
          >
            <iron-icon class="icon-inline text-s" icon="icons:first-page"></iron-icon>
            <foxy-i18n class=${labelClass} lang=${lang} key="first" ns=${ns}></foxy-i18n>
          </vaadin-button>

          <vaadin-button
            data-testid="prev"
            theme="contrast tertiary-inline"
            ?disabled=${!canGoBack}
            @click=${() => this.__goTo('prev')}
          >
            <iron-icon class="icon-inline text-s" icon="icons:chevron-left"></iron-icon>
            <foxy-i18n class=${labelClass} lang=${lang} key="previous" ns=${ns}></foxy-i18n>
          </vaadin-button>
        </div>

        <foxy-i18n
          options=${JSON.stringify({
            total: totalItems,
            from: offset ? offset + 1 : 0,
            to: offset + returnedItems,
          })}
          class=${classMap({
            'flex-1 text-xs text-tertiary text-center leading-xs': true,
            'opacity-0': !data,
          })}
          lang=${lang}
          key="pagination"
          ns=${ns}
        >
        </foxy-i18n>

        <div class="flex items-center justify-end space-x-s">
          <vaadin-button
            data-testid="next"
            theme="contrast tertiary-inline"
            ?disabled=${!canGoForth}
            @click=${() => this.__goTo('next')}
          >
            <foxy-i18n class=${labelClass} lang=${lang} key="next" ns=${ns}></foxy-i18n>
            <iron-icon class="icon-inline text-s" icon="icons:chevron-right"></iron-icon>
          </vaadin-button>

          <vaadin-button
            data-testid="last"
            theme="contrast tertiary-inline"
            ?disabled=${!canGoForth}
            @click=${() => this.__goTo('last')}
          >
            <foxy-i18n class=${labelClass} lang=${lang} key="last" ns=${ns}></foxy-i18n>
            <iron-icon class="icon-inline text-s" icon="icons:last-page"></iron-icon>
          </vaadin-button>
        </div>
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__disconnectPageElement();
  }

  private __goTo(rel: string): void {
    this.__pageElement!.href = String(get(this.__pageElement?.data, `_links.${rel}.href`));
  }

  private __disconnectPageElement() {
    this.__pageElement?.removeEventListener('update', this.__rerender);
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
      this.__pageElement.addEventListener('update', this.__rerender);
      this.__pageElement.href = this.first;
    }
  }
}
