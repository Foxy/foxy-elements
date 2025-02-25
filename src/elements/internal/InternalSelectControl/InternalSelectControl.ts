import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import type { Option } from './types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';
import { classMap } from '../../../utils/class-map';

/**
 * Internal control wrapper for select elements.
 *
 * @since 1.21.0
 * @element foxy-internal-select-control
 */
export class InternalSelectControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Array },
      layout: {},
      theme: { type: String },
      __isErrorVisible: { attribute: false },
    };
  }

  /** List of radio buttons to render. */
  options: Option[] = [];

  /** Standalone renders Vaadin Combo Box. Summary item renders a special UI for summary control. */
  layout: 'summary-item' | 'standalone' | null = null;

  /** Same as the "theme" attribute/property of `vaadin-combo-box`. */
  theme: string | null = null;

  private __isErrorVisible = false;

  renderControl(): TemplateResult {
    if (this.layout === 'summary-item') return this.__renderSummaryItemLayout();

    return html`
      <vaadin-combo-box
        item-value-path="value"
        item-label-path="label"
        error-message=${ifDefined(this._errorMessage)}
        item-id-path="value"
        helper-text=${this.helperText}
        placeholder=${this.placeholder}
        label=${this.label}
        class="w-full"
        theme=${ifDefined(this.theme ?? undefined)}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        clear-button-visible
        .checkValidity=${this._checkValidity}
        .items=${this.options.map(option => ({
          label: 'label' in option ? this.t(option.label) : option.rawLabel,
          value: option.value,
        }))}
        .value=${this._value}
        @change=${(evt: CustomEvent) => {
          evt.stopPropagation();
          const comboBox = evt.currentTarget as ComboBoxElement;
          this._value = comboBox.value;
          comboBox.validate();
        }}
      >
      </vaadin-combo-box>
    `;
  }

  reportValidity(): void {
    this.__isErrorVisible = true;
    super.reportValidity();
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    const comboBox = this.renderRoot.querySelector('vaadin-combo-box');
    if (comboBox && comboBox.value !== this._value) comboBox.value = this._value as string;
  }

  private __renderSummaryItemLayout() {
    const selection = this.options.find(v => v.value === this._value);

    return html`
      <div class="leading-xs">
        <div class="flex items-center gap-s">
          <label class="text-m text-body flex-1 whitespace-nowrap" for="select">
            ${this.label}
          </label>
          <div
            class=${classMap({
              'relative rounded-s transition-colors transition-opacity min-w-0': true,
              'focus-within-ring-2 focus-within-ring-primary-50': !this.disabled && !this.readonly,
              'text-body hover-opacity-80 cursor-pointer': !this.disabled && !this.readonly,
              'text-secondary': this.readonly,
              'text-disabled': this.disabled,
              'font-medium': !this.readonly,
            })}
          >
            <div class="flex items-center gap-xs min-w-0">
              <div class="truncate min-w-0">
                ${selection
                  ? 'label' in selection
                    ? this.t(selection.label)
                    : selection.rawLabel
                  : this.placeholder}
              </div>
              ${this.readonly
                ? ''
                : svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="flex-shrink-0" style="width: 1em; height: 1em; transform: scale(1.25)"><path fill-rule="evenodd" d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z" clip-rule="evenodd" /></svg>`}
            </div>

            <select
              class=${classMap({
                'absolute inset-0 opacity-0': true,
                'cursor-pointer': !this.disabled && !this.readonly,
              })}
              id="select"
              ?disabled=${this.disabled}
              ?hidden=${this.readonly}
              @blur=${() => (this.__isErrorVisible = true)}
              @change=${(evt: Event) => {
                evt.stopPropagation();
                this._value = (evt.target as HTMLSelectElement).value;
              }}
            >
              <option value="" ?selected=${!selection} disabled hidden>${this.placeholder}</option>
              ${this.options.map(
                option =>
                  html`
                    <option
                      value=${option.value}
                      ?selected=${selection && option.value === this._value}
                    >
                      ${'label' in option ? this.t(option.label) : option.rawLabel}
                    </option>
                  `
              )}
            </select>
          </div>
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
