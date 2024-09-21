import type { CSSResult, PropertyDeclarations, TemplateResult } from 'lit-element';

import { LitElement, css, html } from 'lit-element';
import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ifDefined } from 'lit-html/directives/if-defined';

const NS = 'copy-to-clipboard';
const Base = ConfigurableMixin(TranslatableMixin(InferrableMixin(LitElement), NS));

/**
 * A simple "click to copy" button that takes the size of the font
 * your text is written in (considering that the font styles are applied to container).
 *
 * @element foxy-copy-to-clipboard
 * @since 1.17.0
 */
export class CopyToClipboard extends Base {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      layout: {},
      theme: {},
      text: { type: String },
      icon: { type: String },
      __state: { attribute: false },
    };
  }

  static get styles(): CSSResult {
    return css`
      .icon-button {
        position: relative;
        appearance: none;
        background: none;
        border: none;
        border-radius: var(--lumo-border-radius-s);
        color: inherit;
        font-size: inherit;
        padding: 0;
        width: 1.5em;
        height: 1.5em;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .icon-button::before {
        position: absolute;
        inset: 0;
        content: ' ';
        display: block;
        background: currentColor;
        opacity: 0.08;
        transition: opacity 0.15s ease;
        border-radius: var(--lumo-border-radius-s);
      }

      .icon-button:focus {
        outline: none;
        box-shadow: 0 0 0 2px currentColor;
      }

      .icon-button:disabled {
        opacity: 0.5;
        cursor: default;
      }

      @media (hover: hover) {
        .icon-button:not(:disabled):hover {
          cursor: pointer;
        }

        .icon-button:not(:disabled):hover::before {
          opacity: 0.16;
        }
      }

      iron-icon {
        --iron-icon-height: 1em;
        --iron-icon-width: 1em;
      }
    `;
  }

  /** Icon or text UI. Icon UI by default. */
  layout: 'text' | 'icon' | null = null;

  /** VaadinButton theme for text layout. */
  theme: string | null = null;

  /** Default icon. */
  icon: string | null = null;

  /** Text to copy. */
  text: string | null = null;

  private __state: 'idle' | 'busy' | 'fail' | 'done' = 'idle';

  render(): TemplateResult {
    const layout = this.layout === 'text' ? 'text' : 'icon';
    let label = '';
    let icon = '';

    if (this.__state === 'busy') {
      label = 'copying';
      icon = 'icons:hourglass-empty';
    } else if (this.__state === 'fail') {
      label = 'failed_to_copy';
      icon = 'icons:error-outline';
    } else if (this.__state === 'done') {
      label = 'done';
      icon = 'icons:done';
    } else {
      label = 'click_to_copy';
      icon = this.icon ?? 'icons:content-copy';
    }

    return html`
      ${layout === 'icon'
        ? html`
            <button
              id="trigger"
              class="icon-button"
              ?disabled=${this.disabled}
              @click=${this.__copy}
            >
              <iron-icon icon=${icon}></iron-icon>
            </button>
            <vcf-tooltip
              position="bottom"
              style="--lumo-base-color: black"
              theme="light"
              for="trigger"
            >
              <span class="text-s" style="color: white">
                <foxy-i18n infer="" key=${label}></foxy-i18n>
              </span>
            </vcf-tooltip>
          `
        : html`
            <vaadin-button
              theme=${ifDefined(this.theme ?? void 0)}
              ?disabled=${this.disabled}
              @click=${this.__copy}
            >
              <foxy-i18n infer="" key=${label}></foxy-i18n>
            </vaadin-button>
          `}
    `;
  }

  private __copy() {
    if (this.__state === 'idle') {
      this.__state = 'busy';

      navigator.clipboard
        .writeText(this.text ?? '')
        .then(() => (this.__state = 'done'))
        .catch(() => (this.__state = 'fail'))
        .then(() => setTimeout(() => (this.__state = 'idle'), 2000));
    }
  }
}
