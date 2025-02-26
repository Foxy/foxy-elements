import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, css, svg } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { live } from 'lit-html/directives/live';

/**
 * Internal control displaying a basic text box.
 *
 * @since 1.17.0
 * @element foxy-internal-text-control
 */
export class InternalTextControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      layout: {},
      prefix: {},
      suffix: {},
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

  layout: 'summary-item' | 'standalone' | null = null;

  prefix: string | null = null;

  suffix: string | null = null;

  private __isErrorVisible = false;

  reportValidity(): void {
    this.__isErrorVisible = true;
    super.reportValidity();
  }

  renderControl(): TemplateResult {
    if (this.layout === 'summary-item') return this.__renderSummaryItemLayout();

    return html`
      <vaadin-text-field
        error-message=${ifDefined(this._errorMessage)}
        helper-text=${this.helperText}
        placeholder=${this.placeholder}
        label=${this.label}
        class="w-full"
        ?clear-button-visible=${!this.suffix}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${this._value}
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        @input=${(evt: CustomEvent) => {
          const field = evt.currentTarget as TextFieldElement;
          this._value = field.value;
        }}
      >
        ${this.prefix ? html`<div slot="prefix">${this.prefix}</div>` : ''}
        ${this.suffix ? html`<div class="pr-s font-medium" slot="suffix">${this.suffix}</div>` : ''}
      </vaadin-text-field>
    `;
  }

  protected get _value(): string {
    return (super._value as string | undefined) ?? '';
  }

  protected set _value(newValue: string) {
    super._value = newValue as unknown | undefined;
  }

  private __renderSummaryItemLayout() {
    return html`
      <div class="leading-xs">
        <div class="flex items-center gap-xs">
          <label class="text-m text-body flex-1 whitespace-nowrap" for="input">${this.label}</label>

          ${this.prefix ? html`<div>${this.prefix}</div>` : ''}

          <input
            placeholder=${this.placeholder}
            class=${classMap({
              'w-full appearance-none text-right bg-transparent transition-colors': true,
              'text-m rounded-s focus-outline-none': true,
              'text-secondary': this.readonly,
              'text-disabled': this.disabled,
              'font-medium': !this.readonly,
            })}
            type="text"
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

          ${this.suffix ? html`<div class="font-medium text-secondary">${this.suffix}</div>` : ''}

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
}
