import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';

import { LitElement, css, html, svg } from 'lit-element';

type Popover = HTMLElement & { showPopover(): void; hidePopover(): void };

const GAP = 6;
const MARGIN = 8;

// Time to cross the gap from the "?" to the text without the text closing.
const HIDE_DELAY = 300;

/**
 * A "?" that shows `text` while it, or the text, is hovered, or while it is
 * focused; Escape closes it. The text is a popover, in the page's top layer,
 * so no scrolling or clipped container cuts it off; it opens below the "?",
 * or above it when there's no room below, and stays inside the window.
 *
 * With `after-label`, it puts `--pd-help-x` and `--pd-help-y` on itself: where
 * the label of the control just before it ends and is centred, from its
 * parent's top left corner. A vaadin field draws its label inside itself, with
 * no slot for anything after it, so the label is measured, again whenever it,
 * its control or its text changes size: an inline label reports no size.
 *
 * @element foxy-internal-product-form-help
 */
export class InternalProductFormHelp extends LitElement {
  static get properties(): PropertyDeclarations {
    return { text: {}, afterLabel: { type: Boolean, attribute: 'after-label' } };
  }

  static get styles(): CSSResultArray {
    return [
      css`
        :host {
          display: inline-flex;
          vertical-align: middle;
        }

        button {
          display: flex;
          width: 1.125rem;
          height: 1.125rem;
          padding: 0;
          border: 0;
          background: none;
          color: var(--lumo-tertiary-text-color);
          cursor: help;
        }

        button:hover,
        button:focus-visible {
          color: var(--lumo-body-text-color);
        }

        button:focus-visible {
          outline: 2px solid var(--lumo-primary-color-50pct);
          outline-offset: 1px;
          border-radius: 50%;
        }

        svg {
          width: 100%;
          height: 100%;
        }

        /* Where popovers aren't supported, the text is only the button's label. */
        #tip {
          display: none;
        }

        #tip:popover-open {
          display: block;
        }

        [popover] {
          position: fixed;
          inset: auto;
          box-sizing: border-box;
          max-width: min(20rem, calc(100vw - 16px));
          margin: 0;
          padding: 0.5rem 0.75rem;
          border: 0;
          border-radius: var(--lumo-border-radius-m);
          background: rgba(0, 0, 0, 0.88);
          color: white;
          font-family: var(--lumo-font-family);
          font-size: var(--lumo-font-size-s);
          line-height: var(--lumo-line-height-s);
          white-space: normal;
        }
      `,
    ];
  }

  text = '';

  afterLabel = false;

  private __labelObserver: ResizeObserver | null = null;

  private __textObserver: MutationObserver | null = null;

  private __hideTimer = 0;

  render(): TemplateResult {
    // The text is the button's name, so it is read once; the popover only shows it.
    return html`
      <button
        type="button"
        aria-label=${this.text}
        @pointerenter=${this.__show}
        @pointerleave=${this.__hideSoon}
        @focus=${this.__show}
        @blur=${this.__hide}
      >
        ${svg`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>`}
      </button>
      <div
        id="tip"
        popover="manual"
        aria-hidden="true"
        @pointerenter=${() => window.clearTimeout(this.__hideTimer)}
        @pointerleave=${this.__hideSoon}
      >
        ${this.text}
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.afterLabel) this.__followLabel();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__labelObserver?.disconnect();
    this.__labelObserver = null;
    this.__textObserver?.disconnect();
    this.__textObserver = null;
    this.__hide();
  }

  private async __followLabel() {
    const control = this.previousElementSibling as LitElement | null;
    await control?.updateComplete;
    if (!control || !this.isConnected || this.__labelObserver) return;
    const field = control.renderRoot.querySelector('vaadin-text-field, vaadin-number-field');
    const label =
      field?.shadowRoot?.querySelector('[part="label"]') ??
      control.renderRoot.querySelector('[part="label"]');
    if (!label) return;
    const place = () => this.__placeAfter(label);
    this.__labelObserver = new ResizeObserver(place);
    this.__labelObserver.observe(label);
    this.__labelObserver.observe(control);
    this.__textObserver = new MutationObserver(place);
    this.__textObserver.observe(label, { childList: true, characterData: true, subtree: true });
  }

  private __placeAfter(label: Element) {
    const range = document.createRange();
    range.selectNodeContents(label);
    const text = range.getBoundingClientRect();
    const box = this.parentElement?.getBoundingClientRect();
    if (!text.width || !box) return;
    // A label cut short ends at its own box, not at its text's.
    const end = Math.min(text.right, label.getBoundingClientRect().right);
    this.style.setProperty('--pd-help-x', `${end - box.left + 4}px`);
    this.style.setProperty('--pd-help-y', `${text.top + text.height / 2 - box.top}px`);
  }

  /** The popover, where the browser has popovers. */
  private get __tip(): Popover | null {
    const tip = this.renderRoot.querySelector('#tip');
    return tip && 'showPopover' in tip ? (tip as Popover) : null;
  }

  private __show = () => {
    const tip = this.__tip;
    const button = this.renderRoot.querySelector('button');
    window.clearTimeout(this.__hideTimer);
    if (!tip || !button) return;
    if (!tip.matches(':popover-open')) {
      tip.showPopover();
      document.addEventListener('keydown', this.__handleKeydown);
    }

    const anchor = button.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    const below = anchor.bottom + GAP;
    const top =
      below + box.height <= innerHeight - MARGIN || anchor.top - GAP - box.height < MARGIN
        ? below
        : anchor.top - GAP - box.height;
    const centered = anchor.left + anchor.width / 2 - box.width / 2;
    const left = Math.min(Math.max(MARGIN, centered), innerWidth - MARGIN - box.width);
    tip.style.top = `${Math.max(MARGIN, top)}px`;
    tip.style.left = `${left}px`;
  };

  private __hideSoon = () => {
    window.clearTimeout(this.__hideTimer);
    this.__hideTimer = window.setTimeout(this.__hide, HIDE_DELAY);
  };

  private __hide = () => {
    const tip = this.__tip;
    window.clearTimeout(this.__hideTimer);
    document.removeEventListener('keydown', this.__handleKeydown);
    if (tip?.matches(':popover-open')) tip.hidePopover();
  };

  private __handleKeydown = (evt: KeyboardEvent) => {
    if (evt.key === 'Escape') this.__hide();
  };
}
