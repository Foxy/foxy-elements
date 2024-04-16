import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CustomFieldElement, CustomFieldI18n } from '@vaadin/vaadin-custom-field';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { css, html } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';

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
      options: { attribute: false },
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
      `,
    ];
  }

  options = [
    { value: 'd', label: 'day' },
    { value: 'w', label: 'week' },
    { value: 'm', label: 'month' },
    { value: 'y', label: 'year' },
  ];

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
          max=${ifDefined(this.max ?? undefined)}
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
}
