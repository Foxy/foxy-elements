import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { css, CSSResultArray, PropertyDeclarations } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { Translatable } from '../../../mixins/translatable';
import { I18N } from '../I18N/I18N';

export class DialogCloseEvent extends CustomEvent<void> {
  constructor() {
    super('close');
  }
}

export class Dialog extends Translatable {
  public static stacks: Record<string, Dialog[]> = { default: [] };

  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-button': customElements.get('vaadin-button'),
      'x-i18n': I18N,
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          pointer-events: none;
          position: absolute;
          z-index: 9999;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }

        .inset-x-20 {
          left: 20%;
          right: 20%;
        }

        .size-small,
        .size-medium,
        .size-large {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }

        .sliding {
          transition: 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          transform: translateY(0);
        }

        .fading {
          transition: 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 1;
        }

        .sliding.reverse {
          transform: translateY(100vh);
        }

        .fading.reverse {
          opacity: 0;
        }

        @media all and (min-width: 768px) {
          .size-small,
          .size-medium,
          .size-large {
            bottom: auto;
            left: auto;
          }

          .size-small {
            width: 20rem;
            max-height: 30rem;
            top: calc(50% - 15rem);
            right: calc(50% - 10rem);
          }

          .size-medium {
            width: 30rem;
            max-height: 40rem;
            top: calc(50% - 20rem);
            right: calc(50% - 15rem);
          }

          .size-large {
            width: 80%;
            max-height: 90%;
            top: 5%;
            left: 10%;
          }
        }
      `,
    ];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      stack: { type: String, reflect: true },
      size: { type: String, reflect: true },
      __rendered: {},
      __open: {},
    };
  }

  public stack = 'default';

  public size: 'small' | 'medium' | 'large' = 'medium';

  private __rendered = false;

  private __open = false;

  public async open(): Promise<void> {
    this.__rendered = true;

    await this.requestUpdate();
    await new Promise(resolve => setTimeout(resolve, 1));

    this.__open = true;

    if (!Dialog.stacks[this.stack]) Dialog.stacks[this.stack] = [];
    if (!Dialog.stacks[this.stack].includes(this)) {
      Dialog.stacks[this.stack].unshift(this);
      Dialog.stacks[this.stack].forEach(dialog => dialog.requestUpdate());
    }
  }

  public close(noEmit = false): Promise<void> {
    return new Promise(resolve => {
      const listener = (e: TransitionEvent) => {
        if (e.pseudoElement || e.propertyName !== 'transform') return;
        this.__surface?.removeEventListener('transitionend', listener);
        this.__rendered = false;
        if (!noEmit) this.dispatchEvent(new DialogCloseEvent());
        resolve();
      };

      this.__surface?.addEventListener('transitionend', listener);
      this.__open = false;

      if (Dialog.stacks[this.stack]?.includes(this)) {
        Dialog.stacks[this.stack].splice(Dialog.stacks[this.stack].indexOf(this), 1);
        Dialog.stacks[this.stack].forEach(dialog => dialog.requestUpdate());
      }
    });
  }

  public render(): TemplateResult {
    if (!this.__rendered) return html``;

    const size = `size-${this.size}`;
    const index = Dialog.stacks[this.stack].indexOf(this);
    const fading = `fading ${this.__open ? '' : 'reverse'}`;
    const sliding = `sliding ${this.__open ? '' : 'reverse'}`;
    const offset = `-${(0.5 * index).toFixed(2)}rem`;
    const scale = (1 - index * 0.1).toFixed(2);

    return html`
      <div class="absolute inset-0 pointer-events-auto">
        <div class="${fading} absolute inset-0 bg-shade-50" @click=${() => this.close()}></div>

        <article
          id="surface"
          class="${size} ${sliding} mt-l md:mt-0 bg-base overflow-auto origin-top rounded-t-l md:rounded-b-l md:border md:border-contrast-10"
          style="${this.__open ? `transform: translateY(${offset}) scale(${scale})` : ''}"
        >
          <header
            class="px-s py-xs bg-blurred rounded-t-l z-10 border-b border-contrast-10 sticky top-0"
          >
            <h1 class="absolute inset-x-20 inset-y-0 flex justify-center items-center">
              <span class="font-medium font-lumo text-header text-m">
                <slot name="header"></slot>
              </span>
            </h1>

            <vaadin-button
              class="relative px-s h-s my-xs"
              theme="tertiary"
              @click=${() => this.close()}
            >
              <x-i18n ns=${this.ns} lang=${this.lang} key="close"></x-i18n>
            </vaadin-button>
          </header>

          <slot></slot>
        </article>
      </div>
    `;
  }

  private get __surface(): HTMLDivElement | null {
    return this.shadowRoot!.querySelector('#surface');
  }
}
