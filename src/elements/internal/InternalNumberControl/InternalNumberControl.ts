import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NumberFieldElement } from '@vaadin/vaadin-text-field/vaadin-number-field';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, css } from 'lit-element';
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
      step: { type: Number },
      min: { type: Number },
      max: { type: Number },
      __isErrorVisible: { attribute: false },
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

  step: number | null = null;

  min: number | null = null;

  max: number | null = null;

  private __isErrorVisible = false;

  reportValidity(): void {
    this.__isErrorVisible = true;
    super.reportValidity();
  }

  renderControl(): TemplateResult {
    if (this.layout === 'summary-item') return this.__renderSummaryItemLayout();

    return html`
      <vaadin-number-field
        error-message=${ifDefined(this._errorMessage)}
        placeholder=${this.placeholder}
        helper-text=${this.helperText}
        label=${this.label}
        class="w-full"
        step=${ifDefined(this.step ?? undefined)}
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
    return html`
      <div class="leading-xs">
        <div class="flex items-center gap-xs">
          <label class="text-m text-body flex-1 whitespace-nowrap" for="input">${this.label}</label>

          ${this.prefix ? html`<div>${this.prefix}</div>` : ''}

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
            step=${ifDefined(this.step ?? void 0)}
            min=${ifDefined(this.min ?? void 0)}
            max=${ifDefined(this.max ?? void 0)}
            id="input"
            .value=${this._value}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
            @blur=${() => (this.__isErrorVisible = true)}
            @input=${(evt: Event) => {
              evt.stopPropagation();
              const newValue = parseFloat((evt.target as HTMLInputElement).value);
              if (!isNaN(newValue)) this._value = newValue;
            }}
          />

          ${this.suffix ? html`<div class="font-medium text-secondary">${this.suffix}</div>` : ''}
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
