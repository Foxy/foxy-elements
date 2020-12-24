import { CSSResultArray, PropertyDeclarations, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';

const stack: Modal[] = [];

export class Modal extends Themeable {
  static get properties(): PropertyDeclarations {
    return {
      __open: { attribute: false },
      __visible: { attribute: false },
      closable: { type: Boolean },
      editable: { type: Boolean },
      type: { type: String },
      open: { type: Boolean, noAccessor: true },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .scale-85 {
          --transform-scale-x: 0.85;
          --transform-scale-y: 0.85;
        }
      `,
    ];
  }

  closable = false;

  editable = false;

  private __open = false;

  private __visible = false;

  private __activator: HTMLElement | null = null;

  get open(): boolean {
    return this.__open;
  }

  set open(value: boolean) {
    if (value === this.__open) return;

    this.__open = value;
    stack.forEach(modal => modal.requestUpdate());

    if (value) {
      this.setAttribute('open', 'open');
      stack.unshift(this);
    } else {
      this.removeAttribute('open');
      stack.splice(stack.indexOf(this), 1);
      this.__activator?.focus();
    }
  }

  render(): TemplateResult {
    const isFirst = stack[0] === this;
    const isSecond = stack[1] === this;
    const isThird = stack[2] === this;
    const isForthAndGreater = !isFirst && !isSecond && !isThird;

    return html`
      <slot name="activator"></slot>

      <div
        class=${classMap({ 'fixed inset-0': true, 'pointer-events-none': !this.open })}
        style="z-index: ${50 + stack.length - stack.indexOf(this)}"
      >
        <div
          tabindex="-1"
          class=${classMap({
            'select-none ease-in-out transition duration-700 absolute inset-0 bg-contrast-50 focus:outline-none': true,
            'opacity-100': this.open,
            'opacity-0': !this.open,
          })}
          @click=${() => (this.open = this.closable ? false : this.open)}
          @transitionend=${() => {
            this.dispatchEvent(new CustomEvent(this.__open ? 'open' : 'close'));
          }}
        ></div>

        <div
          role="dialog"
          aria-labelledby="dialog-title"
          class=${classMap({
            'origin-top ease-in-out transition duration-700 relative h-full ml-auto sm:origin-center max-w-modal': true,
            'transform translate-y-full sm:translate-y-0 sm:translate-x-full': !this.open,
            'translate-y-0 translate-x-0': isFirst && this.open,
            'scale-95 -translate-y-s sm:translate-y-0': isSecond && this.open,
            'scale-90 -translate-y-m sm:translate-y-0': isThird && this.open,
            'opacity-0 scale-85 -translate-y-l sm:translate-y-0': isForthAndGreater && this.open,
          })}
        >
          <div
            class=${classMap({
              'overflow-hidden flex flex-col bg-base absolute inset-0 rounded-t-l mt-xl sm:rounded-b-l sm:m-xl': true,
              'shadow-xxl': this.open,
            })}
          >
            <div
              class="h-l grid grid-cols-3 text-m font-lumo font-medium border-b border-contrast-10"
            >
              ${this.closable
                ? html`
                    <button
                      tabindex=${this.open ? 0 : -1}
                      class="mr-auto m-s px-s rounded-s text-primary hover:opacity-75 focus:outline-none focus:shadow-outline"
                      @click=${() => (this.open = false)}
                    >
                      <slot name="close">Close</slot>
                    </button>
                  `
                : html`<div></div>`}

              <h1 id="dialog-title" class="truncate self-center text-center">
                <slot name="header">Header</slot>
              </h1>

              ${this.editable
                ? html`
                    <button
                      tabindex=${this.open ? 0 : -1}
                      class="ml-auto m-s px-s rounded-s text-primary hover:opacity-75 focus:outline-none focus:shadow-outline"
                      @click=${() => (this.open = false)}
                    >
                      <slot name="save">Save</slot>
                    </button>
                  `
                : html`<div></div>`}
            </div>

            <div class="relative p-m flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
