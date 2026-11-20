import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { ProductDefinition } from '../../types';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { css, html } from 'lit-element';
import { render } from 'lit-html';

export type DescriptionLayout = 'auto' | 'none' | 'tabs' | 'accordion';

/** The `description-preview` event's detail. */
export interface DescriptionPreview {
  /** The product as the storefront's catalog would list it, with the edits not yet saved. */
  product: {
    sku: string;
    product_type: string;
    definition: ProductDefinition;
    is_in_stock: boolean;
  };
  /** How the storefront's product page is to show the description's top-level headings. */
  layout: DescriptionLayout;
}

const LAYOUTS: DescriptionLayout[] = ['auto', 'none', 'tabs', 'accordion'];

const OPEN_KEY = 'foxy-product-form-description-preview';

// Each keystroke changes the product, and each preview draws a whole page.
const DELAY = 300;

function storedOpen(): boolean {
  try {
    return localStorage.getItem(OPEN_KEY) === 'open';
  } catch {
    return false;
  }
}

/**
 * A collapsible panel for a preview of the description as the storefront
 * shows it. The host draws the preview: it puts an element in the form's
 * `description-preview` slot, and hears a `description-preview` event (with
 * a `DescriptionPreview`) while the panel is open, a moment after each
 * change. The panel starts as it was last left.
 *
 * @element foxy-internal-product-form-description-preview-control
 */
export class InternalProductFormDescriptionPreviewControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      product: { attribute: false },
      open: { type: Boolean, reflect: true },
      __layout: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        /* Its toggle and its body go where the form's layout puts them. */
        :host {
          display: contents;
        }

        /* On the description's label row, at its end. */
        .head {
          grid-area: text;
          justify-self: end;
          align-self: start;
          position: relative;
        }

        select {
          -webkit-appearance: none;
          appearance: none;
          height: 2rem;
          padding: 0 1.875rem 0 0.5rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.625rem center;
        }

        .body {
          grid-area: body;
          min-width: 0;
        }

        button:focus-visible,
        select:focus-visible {
          outline: 2px solid var(--lumo-primary-color-50pct);
          outline-offset: 1px;
        }

        .chevron {
          transition: transform 0.15s;
        }

        [aria-expanded='true'] > .chevron {
          transform: rotate(90deg);
        }
      `,
    ];
  }

  product: DescriptionPreview['product'] | null = null;

  open = storedOpen();

  private __layout: DescriptionLayout = 'auto';

  private __sent = '';

  /** The product last seen while open, as JSON. */
  private __productJson = '';

  private __timer = 0;

  renderLightDom(): void {
    render(html`<slot name="description-preview"></slot>`, this);
  }

  renderControl(): TemplateResult {
    return html`
      <button
        type="button"
        class="head inline-flex items-center rounded-s text-s font-medium text-body cursor-pointer"
        style="gap: 0.375rem; height: 1.375rem; padding: 0 0.25rem 0 0.5rem"
        aria-expanded=${this.open ? 'true' : 'false'}
        data-testid="description-preview-toggle"
        @click=${() => this.__setOpen(!this.open)}
      >
        <svg class="chevron" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.8" />
        </svg>
        ${this.t('label')}
      </button>
      ${this.open
        ? html`
            <div class="body grid gap-s">
              <div class="flex items-center justify-end" style="gap: 0.5rem">
                <label class="inline-flex items-center text-s text-secondary" style="gap: 0.5rem">
                  ${this.t('layout_label')}
                  <select
                    class="rounded-s border border-contrast-30 bg-base text-s text-body"
                    data-testid="description-preview-layout"
                    @change=${(evt: Event) => {
                      const value = (evt.currentTarget as HTMLSelectElement).value;
                      this.__layout = value as DescriptionLayout;
                    }}
                  >
                    ${LAYOUTS.map(
                      layout => html`
                        <option value=${layout} ?selected=${layout === this.__layout}>
                          ${this.t(`layout_${layout}`)}
                        </option>
                      `
                    )}
                  </select>
                </label>
                <foxy-internal-product-form-help
                  data-testid="description-preview-help"
                  .text=${this.t('helper_text')}
                >
                </foxy-internal-product-form-help>
              </div>
              <slot></slot>
            </div>
          `
        : ''}
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (!this.open) return;
    if (changes.has('open') || changes.has('__layout' as keyof this)) {
      window.clearTimeout(this.__timer);
      this.__send();
    } else if (changes.has('product')) {
      // The form gives a new product object on every render, changed or not.
      const product = JSON.stringify(this.product);
      if (product === this.__productJson) return;
      this.__productJson = product;
      window.clearTimeout(this.__timer);
      this.__timer = window.setTimeout(() => this.__send(), DELAY);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.__timer);
  }

  private __setOpen(open: boolean) {
    this.open = open;
    try {
      localStorage.setItem(OPEN_KEY, open ? 'open' : 'closed');
    } catch {
      // Only the next visit loses it.
    }
  }

  private __send() {
    if (!this.product) return;
    const detail: DescriptionPreview = { product: this.product, layout: this.__layout };
    const key = JSON.stringify(detail);
    if (key === this.__sent) return;
    this.__sent = key;
    this.dispatchEvent(
      new CustomEvent<DescriptionPreview>('description-preview', {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }
}
