import '@polymer/iron-icon';
import '@vaadin/vaadin-lumo-styles/icons';

import {
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { CheckboxChangeEvent } from './CheckboxChangeEvent';
import { ThemeableMixin } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';

/** @deprecated – use internal controls instead */
export class Checkbox extends ThemeableMixin(LitElement) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      readonly: { type: Boolean },
      disabled: { type: Boolean },
      checked: { type: Boolean },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          --check-size: 1.125rem;
        }

        label {
          margin: calc(((1rem * var(--lumo-line-height-s)) - var(--check-size)) / -2) 0;
        }

        label > :first-child {
          height: calc(1rem * var(--lumo-line-height-s));
        }

        .ml-xxl {
          margin-left: calc(var(--lumo-space-m) + var(--check-size));
        }

        .check {
          height: var(--check-size);
          width: var(--check-size);
        }
      `,
    ];
  }

  readonly = false;

  disabled = false;

  checked = false;

  render(): TemplateResult {
    return html`
      <label
        class=${classMap({
          'flex items-start group transition-colors': true,
          'cursor-default': this.disabled || this.readonly,
          'text-disabled': this.disabled,
          'text-secondary': this.readonly,
          'cursor-pointer': !this.disabled,
        })}
      >
        <div class="flex items-center">
          <div
            class=${classMap({
              'flex-shrink-0 check transition-colors rounded-s border': true,
              'focus-within-shadow-outline': true,
              'bg-primary text-primary-contrast': !this.readonly && this.checked,
              'border-dashed border-contrast-30': this.readonly,
              'border-transparent': !this.readonly,
              'opacity-50': this.disabled,
              'text-secondary bg-contrast-20': !this.readonly && !this.checked,
              'group-hover-bg-contrast-30': !this.readonly && !this.checked,
            })}
          >
            <iron-icon
              icon="lumo:checkmark"
              class=${classMap({
                'block w-full h-full transition-transform transform': true,
                'scale-100': this.checked,
                'scale-0': !this.checked,
              })}
            >
            </iron-icon>

            <input
              type="checkbox"
              class="sr-only"
              .checked=${this.checked}
              ?disabled=${this.disabled}
              data-testid="input"
              @change=${(evt: Event) => {
                if (this.readonly) return evt.preventDefault();

                evt.stopPropagation();
                this.checked = !this.checked;
                this.dispatchEvent(new CheckboxChangeEvent(this.checked));
              }}
            />
          </div>
        </div>

        <div class="flex-1 font-lumo leading-s ml-m">
          <slot></slot>
        </div>
      </label>

      <div
        class=${classMap({
          'font-lumo ml-xxl transition-colors': true,
          'text-disabled': this.disabled,
        })}
      >
        <slot name="content"></slot>
      </div>
    `;
  }
}
