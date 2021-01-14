import { CSSResultArray, PropertyDeclarations, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { I18N } from '../I18N/I18N';
import { RequestEvent } from '../../../events/request';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Themeable } from '../../../mixins/themeable';
import { Translatable } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

class DialogWindow extends Themeable {}
customElements.define('foxy-dialog-window', DialogWindow);

class DialogShowEvent extends CustomEvent<void> {
  constructor() {
    super('show');
  }
}

class DialogHideEvent extends CustomEvent<{ cancelled: boolean }> {
  constructor(cancelled = false) {
    super('hide', { detail: { cancelled } });
  }
}

class DialogSubmitEvent extends CustomEvent<void> {
  constructor() {
    super('submit');
  }
}

export abstract class Dialog extends Translatable {
  static readonly dialogWindowsHost = '#foxy-dialog-windows-host, body';

  static readonly dialogWindows = new WeakMap<Dialog, DialogWindow>();

  static readonly openDialogs: Dialog[] = [];

  static readonly ShowEvent = DialogShowEvent;

  static readonly HideEvent = DialogHideEvent;

  static readonly SubmitEvent = DialogSubmitEvent;

  static get scopedElements(): ScopedElementsMap {
    return {
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __connected: { attribute: false },
      __visible: { attribute: false },
      centered: { type: Boolean },
      closable: { type: Boolean },
      editable: { type: Boolean },
      header: { type: String },
      alert: { type: Boolean },
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

  header = 'Header';

  alert = false;

  private __connected = false;

  private __visible = false;

  get open(): boolean {
    return this.__visible && this.__connected;
  }

  set open(newValue: boolean) {
    newValue === this.open ? void 0 : newValue ? this.show() : this.hide();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    Dialog.dialogWindows.get(this)?.remove();
    Dialog.dialogWindows.delete(this);
  }

  createRenderRoot(): Element | ShadowRoot {
    const dialogWindow = new DialogWindow();
    const dialogWindowsHost = document.querySelector(Dialog.dialogWindowsHost);

    dialogWindow.addEventListener('request', evt => {
      if (evt instanceof RequestEvent) {
        evt.detail.handle((...init) => RequestEvent.emit({ source: this, init }));
      }
    });

    dialogWindowsHost?.appendChild(dialogWindow);
    Dialog.dialogWindows.set(this, dialogWindow);

    return dialogWindow.shadowRoot!;
  }

  render(content?: () => TemplateResult): TemplateResult {
    if (!this.__connected) return html``;

    const isFirst = Dialog.openDialogs[0] === this;
    const isSecond = Dialog.openDialogs[1] === this;
    const isThird = Dialog.openDialogs[2] === this;
    const isForthAndGreater = !isFirst && !isSecond && !isThird;

    return html`
      <div
        class=${classMap({ 'fixed inset-0': true, 'pointer-events-none': !this.__visible })}
        style="z-index: ${50 + Dialog.openDialogs.length - Dialog.openDialogs.indexOf(this)}"
      >
        <div
          id="backdrop"
          class=${classMap({
            'select-none ease-in-out transition duration-500 absolute inset-0 bg-contrast-50 focus:outline-none': true,
            'opacity-100': this.__visible,
            'opacity-0': !this.__visible,
          })}
          tabindex="-1"
          @click=${() => (this.open = this.closable ? false : this.open)}
        ></div>

        <div
          role="dialog"
          aria-labelledby="dialog-title"
          class=${classMap({
            'transform origin-bottom ease-in-out transition duration-500 relative h-full ml-auto sm:origin-center sm:max-w-modal': true,
            'flex justify-center items-end sm:items-center mr-auto': this.alert,
            'translate-y-full sm:translate-y-0': !this.__visible,
            'sm:translate-x-full': !this.alert && !this.__visible,
            'sm:opacity-0 sm:scale-110': this.alert && !this.__visible,
            'translate-y-0 translate-x-0': isFirst && this.__visible,
            'scale-95 -translate-y-s sm:translate-y-0': isSecond && this.__visible,
            'scale-90 -translate-y-m sm:translate-y-0': isThird && this.__visible,
            'opacity-0 scale-85 -translate-y-l sm:translate-y-0':
              isForthAndGreater && this.__visible,
          })}
        >
          <div
            class=${classMap({
              'overflow-hidden flex flex-col bg-base rounded-t-l sm:rounded-b-l': true,
              'absolute inset-0 mt-xl sm:m-xl': !this.alert,
              'shadow-xxl': this.__visible,
            })}
          >
            <div
              class="h-l grid grid-cols-3 text-m font-lumo font-medium border-b border-contrast-10"
            >
              ${this.closable
                ? html`
                    <button
                      class="mr-auto m-s px-s rounded-s text-primary hover:opacity-75 focus:outline-none focus:shadow-outline"
                      @click=${this.hide}
                    >
                      <x-i18n
                        .ns=${this.ns}
                        .lang=${this.lang}
                        .key=${this.editable ? 'cancel' : 'close'}
                      >
                      </x-i18n>
                    </button>
                  `
                : html`<div></div>`}

              <h1 id="dialog-title" class="truncate self-center text-center">
                <x-i18n .ns=${this.ns} .lang=${this.lang} .key=${this.header}></x-i18n>
              </h1>

              ${this.editable
                ? html`
                    <button
                      class="ml-auto m-s px-s rounded-s text-primary hover:opacity-75 focus:outline-none focus:shadow-outline"
                      @click=${this.save}
                    >
                      <x-i18n .ns=${this.ns} .lang=${this.lang} key="save"></x-i18n>
                    </button>
                  `
                : html`<div></div>`}
            </div>

            <div class="relative p-m flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              ${content?.()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async hide(cancelled = false): Promise<void> {
    await this.__setOpenDialogs(Dialog.openDialogs.filter(d => d !== this));
    await this.__setConnected(false);
    this.dispatchEvent(new Dialog.HideEvent(cancelled));
  }

  async show(): Promise<void> {
    await this.__setConnected(true);
    await this.__setOpenDialogs([this, ...Dialog.openDialogs]);
    this.dispatchEvent(new Dialog.ShowEvent());
  }

  async save(): Promise<void> {
    await this.hide(false);
  }

  private async __setOpenDialogs(newValue: Dialog[]) {
    Dialog.openDialogs.length = 0;
    Dialog.openDialogs.push(...newValue);

    await Promise.all([
      // animate dialog stack
      Promise.all(Dialog.openDialogs.map(dialog => dialog.requestUpdate())),

      // trigger exit transition
      new Promise(resolve => {
        const backdrop = this.renderRoot.querySelector('#backdrop') as HTMLDivElement;
        backdrop.addEventListener('transitionend', resolve, { once: true });
        this.__visible = Dialog.openDialogs.includes(this);
      }),
    ]);
  }

  private async __setConnected(newValue: boolean) {
    this.__connected = newValue;
    await this.updateComplete.then(() => this.getBoundingClientRect());
  }
}
