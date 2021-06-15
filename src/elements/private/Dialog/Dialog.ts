import { CSSResultArray, LitElement, PropertyDeclarations, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { API } from '../../public/NucleonElement/API';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from './DialogHideEvent';
import { DialogShowEvent } from './DialogShowEvent';
import { DialogWindow } from './DialogWindow';
import { FetchEvent } from '../../public/NucleonElement/FetchEvent';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

export abstract class Dialog extends TranslatableMixin(
  ConfigurableMixin(ThemeableMixin(LitElement))
) {
  /**
   * Selector of an element that will serve as a mounting point to all dialog windows.
   * It's `<body>` by default, but you can add your own element with `id="foxy-dialog-windows-host"`
   * anywhere in the light DOM to render dialogs there.
   */
  static readonly dialogWindowsHost = '#foxy-dialog-windows-host, body';

  /** Map of all dialog windows linked to their dialog elements. */
  static readonly dialogWindows = new WeakMap<Dialog, DialogWindow>();

  /** List of all currently open dialogs. */
  static readonly openDialogs: Dialog[] = [];

  /**
   * Instance of this event will be dispatched on a dialog when it finishes entering the screen.
   * This event does not bubble and can't cross shadow DOM boundary.
   */
  static readonly ShowEvent = DialogShowEvent;

  /**
   * Instance of this event will be dispatched on a dialog when it finishes leaving the screen.
   * This event does not bubble and can't cross shadow DOM boundary.
   */
  static readonly HideEvent = DialogHideEvent;

  /** @readonly */
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

  /** @readonly */
  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .scale-85 {
          --tw-scale-x: 0.85;
          --tw-scale-y: 0.85;
        }
      `,
    ];
  }

  /** When true, renders Close button in the header. */
  closable = false;

  /** When true, renders Save button in the header. */
  editable = false;

  /** Header text or a i18next key for it. */
  header = '';

  /** When true, centers a dialog on the screen and does not animate the stack under. */
  alert = false;

  private __returnFocusTo?: HTMLElement;

  private __handleKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Escape' && Dialog.openDialogs[0] === this && this.closable)
      this.hide(this.editable);
  };

  private __connected = false;

  private __visible = false;

  /** True if dialog is mounted and has finished entering the screen. */
  get open(): boolean {
    return this.__visible && this.__connected;
  }

  set open(newValue: boolean) {
    newValue === this.open ? void 0 : newValue ? this.show() : this.hide(this.editable);
  }

  /** @readonly */
  connectedCallback(): void {
    super.connectedCallback();
    addEventListener('keydown', this.__handleKeyDown);
  }

  /** @readonly */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    removeEventListener('keydown', this.__handleKeyDown);

    Dialog.dialogWindows.get(this)?.remove();
    Dialog.dialogWindows.delete(this);
  }

  /** @readonly */
  createRenderRoot(): Element | ShadowRoot {
    const dialogWindow = new DialogWindow();
    const dialogWindowsHost = document.querySelector(Dialog.dialogWindowsHost);

    dialogWindow.addEventListener('fetch', (evt: Event) => {
      if (evt instanceof FetchEvent) {
        evt.stopImmediatePropagation();
        evt.preventDefault();
        evt.respondWith(new API(this).fetch(evt.request));
      }
    });

    dialogWindowsHost?.appendChild(dialogWindow);
    Dialog.dialogWindows.set(this, dialogWindow);

    return dialogWindow.shadowRoot!;
  }

  /**
   * @param content
   * @readonly
   */
  render(content?: () => TemplateResult): TemplateResult {
    if (!this.__connected) return html``;

    const isFirst = Dialog.openDialogs[0] === this;
    const isSecond = Dialog.openDialogs[1] === this;
    const isThird = Dialog.openDialogs[2] === this;
    const isForthAndGreater = !isFirst && !isSecond && !isThird;

    return html`
      <div
        class=${classMap({ 'z-50 fixed inset-0': true, 'pointer-events-none': !this.__visible })}
      >
        <div
          id="backdrop"
          class=${classMap({
            'select-none ease-in-out transition duration-500 absolute inset-0 bg-contrast-50 focus-outline-none':
              true,
            'opacity-100': this.__visible,
            'opacity-0': !this.__visible,
          })}
          tabindex="-1"
          @click=${() => this.hide(this.editable)}
        ></div>

        <div
          role="dialog"
          aria-labelledby="dialog-title"
          class=${classMap({
            'transform origin-bottom ease-in-out transition duration-500 relative h-full ml-auto sm-origin-center sm-max-w-modal':
              true,
            'flex justify-center items-end sm-items-center mr-auto': this.alert,
            'translate-y-full sm-translate-y-0': !this.__visible,
            'sm-translate-x-full': !this.alert && !this.__visible,
            'sm-opacity-0 sm-scale-110': this.alert && !this.__visible,
            'translate-y-0 translate-x-0': isFirst && this.__visible,
            'scale-95 -translate-y-s sm-translate-y-0': isSecond && this.__visible,
            'scale-90 -translate-y-m sm-translate-y-0': isThird && this.__visible,
            'opacity-0 scale-85 -translate-y-l sm-translate-y-0':
              isForthAndGreater && this.__visible,
          })}
        >
          <div
            class=${classMap({
              'overflow-hidden flex flex-col bg-base rounded-t-l sm-rounded-b-l': true,
              'absolute inset-0 mt-xl sm-m-xl': !this.alert,
              'shadow-xxl': this.__visible,
            })}
          >
            <div
              class="h-l grid grid-cols-3 text-m font-lumo font-medium border-b border-contrast-10"
            >
              ${this.closable && !this.hiddenSelector.matches('close-button', true)
                ? html`
                    <vaadin-button
                      id="close-button"
                      theme="tertiary-inline"
                      class="mr-auto m-s px-s"
                      ?disabled=${this.disabledSelector.matches('close-button', true)}
                      @click=${() => this.hide(this.editable)}
                    >
                      <foxy-i18n
                        lang=${this.lang}
                        key=${this.editable ? 'cancel' : 'close'}
                        ns=${this.ns}
                      >
                      </foxy-i18n>
                    </vaadin-button>
                  `
                : html`<div></div>`}

              <h1 id="dialog-title" class="truncate self-center text-center">
                <foxy-i18n ns=${this.ns} lang=${this.lang} key=${this.header}></foxy-i18n>
              </h1>

              ${this.editable && !this.hiddenSelector.matches('save-button', true)
                ? html`
                    <vaadin-button
                      data-testid="save-button"
                      ?disabled=${this.disabledSelector.matches('save-button', true)}
                      theme="primary"
                      class="ml-auto h-auto min-h-0 min-w-0 m-xs px-m"
                      @click=${this.save}
                    >
                      <foxy-i18n ns=${this.ns} lang=${this.lang} key="save"></foxy-i18n>
                    </vaadin-button>
                  `
                : html`<div></div>`}
            </div>

            <div class="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
              <div class="p-m relative">${content?.()}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Hides the dialog. Returns a promise that resolves when the dialog
   * finishes leaving the screen.
   *
   * @param cancelled Set this to `true` if closing an editable dialog without saving changes.
   */
  async hide(cancelled = false): Promise<void> {
    this.__returnFocusTo?.focus();

    await this.__setOpenDialogs(Dialog.openDialogs.filter(d => d !== this));
    await this.__setConnected(false);

    this.dispatchEvent(new Dialog.HideEvent(!!cancelled));
  }

  /**
   * Shows the dialog. Returns a promise that resolves when the dialog
   * finishes entering the screen.
   *
   * @param returnFocusTo If provided, the dialog will call `.focus()` on that element once it's closed.
   */
  async show(returnFocusTo?: HTMLElement): Promise<void> {
    this.__returnFocusTo = returnFocusTo;

    await this.__setConnected(true);
    await this.__setOpenDialogs([this, ...Dialog.openDialogs]);

    const closeButton = this.renderRoot.querySelector('#close-button') as HTMLButtonElement;
    closeButton?.focus();

    this.dispatchEvent(new Dialog.ShowEvent());
  }

  /** Alias for `dialog.hide(false)`. */
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

customElements.define('foxy-dialog-window', DialogWindow);
