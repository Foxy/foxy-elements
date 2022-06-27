import {
  CSSResult,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { InferrableMixin } from '../../../mixins/inferrable';
import { TranslatableMixin } from '../../../mixins/translatable';

const Base = ConfigurableMixin(TranslatableMixin(InferrableMixin(LitElement), 'copy-to-clipboard'));

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
      text: { type: String },
      __state: { attribute: false },
    };
  }

  static get styles(): CSSResult {
    return css`
      button {
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

      button::before {
        position: absolute;
        inset: 0;
        content: ' ';
        display: block;
        background: currentColor;
        opacity: 0.08;
        transition: opacity 0.15s ease;
        border-radius: var(--lumo-border-radius-s);
      }

      button:focus {
        outline: none;
        box-shadow: 0 0 0 2px currentColor;
      }

      button:disabled {
        opacity: 0.5;
        cursor: default;
      }

      @media (hover: hover) {
        button:not(:disabled):hover {
          cursor: pointer;
        }

        button:not(:disabled):hover::before {
          opacity: 0.16;
        }
      }

      iron-icon {
        --iron-icon-height: 1em;
        --iron-icon-width: 1em;
      }
    `;
  }

  /** Text to copy. */
  text: string | null = null;

  private __state: 'idle' | 'busy' | 'fail' | 'done' = 'idle';

  render(): TemplateResult {
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
      icon = 'icons:content-copy';
    }

    return html`
      <button
        title=${this.t(label)}
        ?disabled=${this.disabled}
        @click=${() => {
          if (this.__state === 'idle') {
            this.__state = 'busy';

            navigator.clipboard
              .writeText(this.text ?? '')
              .then(() => (this.__state = 'done'))
              .catch(() => (this.__state = 'fail'))
              .then(() => setTimeout(() => (this.__state = 'idle'), 2000));
          }
        }}
      >
        <iron-icon icon=${icon}></iron-icon>
      </button>
    `;
  }
}
