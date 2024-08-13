import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NumberFieldElement } from '@vaadin/vaadin-text-field/vaadin-number-field';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, css, svg } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';

/**
 * Internal control displaying a basic number box.
 *
 * @since 1.17.0
 * @element foxy-internal-number-control
 */
export class InternalNumberControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      layout: {},
      prefix: {},
      suffix: {},
      min: { type: Number },
      max: { type: Number },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        input::-webkit-contacts-auto-fill-button {
          visibility: hidden;
          display: none !important;
          pointer-events: none;
          position: absolute;
          right: 0;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input {
          -moz-appearance: textfield;
        }
      `,
    ];
  }

  layout: 'summary-item' | 'standalone' | null = null;

  prefix: string | null = null;

  suffix: string | null = null;

  min: number | null = null;

  max: number | null = null;

  renderControl(): TemplateResult {
    if (this.layout === 'summary-item') return this.__renderSummaryItemLayout();

    return html`
      <vaadin-number-field
        error-message=${ifDefined(this._errorMessage)}
        placeholder=${this.placeholder}
        helper-text=${this.helperText}
        label=${this.label}
        class="w-full"
        min=${ifDefined(this.min ?? undefined)}
        max=${ifDefined(this.max ?? undefined)}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${this._value}
        clear-button-visible
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as NumberFieldElement;
          this._value = parseFloat(field.value);
        }}
      >
        ${this.prefix ? html`<div slot="prefix">${this.prefix}</div>` : ''}
        ${this.suffix ? html`<div class="pr-s font-medium" slot="suffix">${this.suffix}</div>` : ''}
      </vaadin-number-field>
    `;
  }

  private __renderSummaryItemLayout() {
    const sharedTextStyles = {
      'text-disabled': this.disabled,
      'text-tertiary': !this.readonly && !this.disabled,
      'font-medium': !this.readonly,
    };
    return html`
      <div class="flex items-start gap-m leading-xs">
        <div>
          <label class="text-m text-body" for="input">${this.label}</label>
          <p class="text-xs text-secondary">${this.helperText}</p>
          <p class="text-xs text-error" ?hidden=${this.disabled || this.readonly}>
            ${this._errorMessage}
          </p>
        </div>

        <div class="flex-1 flex items-center gap-xs">
          <span class=${classMap({ 'text-secondary': this.readonly, ...sharedTextStyles })}>
            ${this.prefix}
          </span>

          <input
            placeholder=${this.placeholder}
            style="min-width: 10ch"
            class=${classMap({
              'w-full appearance-none text-right bg-transparent transition-colors': true,
              'text-m rounded-s focus-outline-none': true,
              'text-secondary': this.readonly,
              'text-disabled': this.disabled,
              'font-medium': !this.readonly,
            })}
            type="number"
            min=${ifDefined(this.min ?? void 0)}
            max=${ifDefined(this.max ?? void 0)}
            id="input"
            .value=${this._value === 0 ? '' : this._value}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
            @input=${(evt: Event) => {
              evt.stopPropagation();
              const newValue = parseFloat((evt.target as HTMLInputElement).value);
              this._value = isNaN(newValue) ? 0 : newValue;
            }}
          />

          <span class=${classMap({ 'text-secondary': this.readonly, ...sharedTextStyles })}>
            ${this.suffix}
          </span>

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
              this._value = 0;
              this.dispatchEvent(new CustomEvent('clear'));
            }}
          >
            ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1em; height: 1em; transform: scale(1.25); margin-right: -0.16em"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>`}
          </button>
        </div>
      </div>
    `;
  }
}
