import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, css, svg } from 'lit-element';
import { classMap } from '../../../utils/class-map';
import { live } from 'lit-html/directives/live';

/**
 * Internal control displaying a basic text box with date input.
 *
 * @since 1.51.0
 * @element foxy-internal-native-date-control
 */
export class InternalNativeDateControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      format: {},
      __isErrorVisible: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        input::-webkit-contacts-auto-fill-button {
          visibility: hidden;
          display: none !important;
          pointer-events: none;
          position: absolute;
          right: 0;
        }
      `,
    ];
  }

  format: 'date' | 'datetime-local' = 'date';

  private __isErrorVisible = false;

  reportValidity(): void {
    this.__isErrorVisible = true;
    super.reportValidity();
  }

  renderControl(): TemplateResult {
    return html`
      <div class="leading-xs">
        <div class="flex items-center gap-xs">
          <label class="text-m text-body flex-1 whitespace-nowrap" for="input">${this.label}</label>

          <input
            placeholder=${this.placeholder}
            class=${classMap({
              'appearance-none text-right bg-transparent transition-colors': true,
              'text-m rounded-s focus-outline-none': true,
              'text-secondary': this.readonly,
              'text-disabled': this.disabled,
              'font-medium': !this.readonly,
            })}
            type=${this.format}
            id="input"
            .value=${live(this._value)}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
            @blur=${() => (this.__isErrorVisible = true)}
            @input=${(evt: Event) => {
              evt.stopPropagation();
              this._value = (evt.target as HTMLInputElement).value;
            }}
          />

          <button
            aria-label=${this.t('clear')}
            class=${classMap({
              'flex-shrink-0 rounded-full transition-colors': true,
              'focus-outline-none focus-ring-2 focus-ring-primary-50': true,
              'cursor-pointer text-tertiary hover-text-body': !this.disabled,
              'cursor-default text-disabled': this.disabled,
            })}
            style="width: 1em; height: 1em;"
            ?disabled=${this.disabled}
            ?hidden=${this.readonly || !this._value}
            @click=${() => {
              this._value = '';
              this.dispatchEvent(new CustomEvent('clear'));
            }}
          >
            ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1em; height: 1em; transform: scale(1.25); margin-right: -0.16em"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>`}
          </button>
        </div>

        <div style="max-width: 32rem">
          <p class="text-xs text-secondary">${this.helperText}</p>
          <p
            class="text-xs text-error"
            ?hidden=${!this.__isErrorVisible || this.disabled || this.readonly}
          >
            ${this._errorMessage}
          </p>
        </div>
      </div>
    `;
  }

  protected get _value(): string {
    return (super._value as string | undefined) ?? '';
  }

  protected set _value(newValue: string) {
    super._value = newValue as unknown | undefined;
  }
}
