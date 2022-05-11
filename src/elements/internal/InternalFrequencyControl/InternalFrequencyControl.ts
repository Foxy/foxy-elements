import type { CustomFieldElement, CustomFieldI18n } from '@vaadin/vaadin-custom-field';
import type { CSSResultArray, TemplateResult } from 'lit-element';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { parseDuration } from '../../../utils/parse-duration';
import { css, html } from 'lit-element';

/**
 * Internal control displaying a custom field for frequency input.
 *
 * @since 1.17.0
 * @tag foxy-internal-frequency-control
 */
export class InternalFrequencyControl extends InternalEditableControl {
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

  private __i18n: CustomFieldI18n = {
    formatValue: inputValues => inputValues.join(''),
    parseValue: value => {
      const { count, units } = parseDuration(value);
      return [count.toString(), units];
    },
  };

  renderControl(): TemplateResult {
    const value = (this._value ?? '') as string;
    const count = parseDuration(value).count;

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
          max="999"
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
          .items=${[
            { value: 'd', label: this.t('day', { count }) },
            { value: 'w', label: this.t('week', { count }) },
            { value: 'm', label: this.t('month', { count }) },
            { value: 'y', label: this.t('year', { count }) },
          ]}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        >
        </vaadin-combo-box>
      </vaadin-custom-field>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    const field = this.renderRoot.firstElementChild as CustomFieldElement;
    if (field.value !== this._value) field.value = this._value as string;
  }
}
