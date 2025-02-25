import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CustomFieldElement, CustomFieldI18n } from '@vaadin/vaadin-custom-field';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { css, html, svg } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';

/**
 * Internal control displaying a custom field for frequency input.
 *
 * @since 1.17.0
 * @element foxy-internal-frequency-control
 */
export class InternalFrequencyControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      allowTwiceAMonth: { type: Boolean, attribute: 'allow-twice-a-month' },
      options: { attribute: false },
      layout: {},
      max: { type: Number },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          display: block;
        }

        vaadin-custom-field {
          width: 100%;
          font-size: 0;
          line-height: 0;
          padding-top: 0 !important;
        }

        vaadin-custom-field::part(label) {
          padding-bottom: var(--lumo-space-s);
        }

        vaadin-custom-field::part(error-message)[aria-hidden='false'] {
          padding-top: var(--lumo-space-xs);
        }

        vaadin-integer-field,
        vaadin-combo-box {
          width: calc(50% - (var(--lumo-space-s) / 2));
        }

        vaadin-integer-field {
          margin-right: var(--lumo-space-s);
          padding: 0;
        }

        vaadin-combo-box::part(text-field) {
          padding: 0;
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

  allowTwiceAMonth = false;

  options = [
    { value: 'd', label: 'day' },
    { value: 'w', label: 'week' },
    { value: 'm', label: 'month' },
    { value: 'y', label: 'year' },
  ];

  layout: 'summary-item' | 'standalone' | null = null;

  max: number | null = 999;

  private __i18n: CustomFieldI18n = {
    formatValue: inputValues => inputValues.join(''),
    parseValue: value => {
      const normalizedValue = value.startsWith('.') ? `0${value}` : value;
      const count = parseFloat(value.substring(0, Math.max(normalizedValue.length - 1, 0)));
      const units = normalizedValue[normalizedValue.length - 1] ?? '';

      return isNaN(count) ? ['0', ''] : [count.toString(), units];
    },
  };

  renderControl(): TemplateResult {
    if (this.layout === 'summary-item') return this.__renderSummaryItemLayout();

    const value = (this._value ?? '') as string;
    const count = parseFloat(this.__i18n.parseValue(value)[0] as string);
    const items = this.options.map(({ value, label }) => ({
      label: this.t(label, { count }),
      value,
    }));

    return html`
      <vaadin-custom-field
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .errorMessage=${this._errorMessage ?? ''}
        .helperText=${this.helperText}
        .label=${this.label}
        .value=${value}
        .i18n=${this.__i18n}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as CustomFieldElement;
          this._value = field.value as string;
        }}
      >
        <vaadin-integer-field
          max=${ifDefined(this.max || undefined)}
          min="1"
          prevent-invalid-input
          has-controls
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?invalid=${!this._checkValidity()}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        >
        </vaadin-integer-field>

        <vaadin-combo-box
          item-value-path="value"
          item-label-path="label"
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?invalid=${!this._checkValidity()}
          .items=${items}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        >
        </vaadin-combo-box>
      </vaadin-custom-field>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    const field = this.renderRoot.querySelector('vaadin-custom-field');
    if (field && field.value !== this._value) field.value = (this._value ?? '') as string;
  }

  private __renderSummaryItemLayout() {
    const value = (this._value ?? '') as string;
    const [strCount, units] = this.__i18n.parseValue(value);
    const count = parseFloat(strCount as string);
    const selection =
      this._value === '.5m' && !this.allowTwiceAMonth
        ? undefined
        : this.options.find(v => v.value === units);

    return html`
      <div class="leading-xs">
        <div class="flex items-center gap-xs">
          <label class="text-m text-body flex-1 whitespace-nowrap" for="input">${this.label}</label>

          <input
            placeholder=${this.placeholder}
            inputmode="numeric"
            style="min-width: 10ch"
            class=${classMap({
              'w-full appearance-none text-right bg-transparent transition-colors': true,
              'text-m rounded-s focus-outline-none': true,
              'text-secondary': this.readonly,
              'text-disabled': this.disabled,
              'font-medium': !this.readonly,
            })}
            type="number"
            step="1"
            min="1"
            max=${ifDefined(this.max ?? void 0)}
            id="input"
            .value=${value === '.5m' ? (this.allowTwiceAMonth ? 2 : '') : count}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
            @input=${(evt: Event) => {
              evt.stopPropagation();
              const input = evt.currentTarget as HTMLInputElement;
              this._value = this.__i18n.formatValue([input.value, units]);
            }}
          />

          <div
            class=${classMap({
              'relative rounded-s transition-colors transition-opacity': true,
              'focus-within-ring-2 focus-within-ring-primary-50': !this.disabled && !this.readonly,
              'text-body hover-opacity-80 cursor-pointer': !this.disabled && !this.readonly,
              'text-secondary': this.readonly,
              'text-disabled': this.disabled,
              'font-medium': !this.readonly,
            })}
          >
            <div class="flex items-center gap-xs">
              <div class="whitespace-nowrap">
                ${value === '.5m'
                  ? this.t('times_a_month')
                  : selection
                  ? this.t(selection.label, { count })
                  : this.t('select')}
              </div>
              ${this.readonly
                ? ''
                : svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1em; height: 1em; transform: scale(1.25)"><path fill-rule="evenodd" d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z" clip-rule="evenodd" /></svg>`}
            </div>

            <select
              class=${classMap({
                'absolute inset-0 opacity-0': true,
                'cursor-pointer': !this.disabled && !this.readonly,
              })}
              id="select"
              ?disabled=${this.disabled}
              ?hidden=${this.readonly}
              @change=${(evt: Event) => {
                evt.stopPropagation();
                const value = (evt.currentTarget as HTMLSelectElement).value;
                if (value === 'times_a_month') {
                  this._value = '.5m';
                } else {
                  this._value = this.__i18n.formatValue([count, value]);
                }
              }}
            >
              <option value="" ?selected=${!selection} disabled hidden>${this.t('select')}</option>
              ${this.allowTwiceAMonth && (count === 2 || value === '.5m')
                ? html`
                    <option value="times_a_month" ?selected=${value === '.5m'}>
                      ${this.t('times_a_month')}
                    </option>
                  `
                : ''}
              ${this.options.map(
                option =>
                  html`
                    <option
                      value=${option.value}
                      ?selected=${value !== '.5m' && option.value === selection?.value}
                    >
                      ${this.t(option.label, { count })}
                    </option>
                  `
              )}
            </select>
          </div>
        </div>

        <div style="max-width: 32rem">
          <p class="text-xs text-secondary">${this.helperText}</p>
          <p class="text-xs text-error" ?hidden=${this.disabled || this.readonly}>
            ${this._errorMessage}
          </p>
        </div>
      </div>
    `;
  }
}
