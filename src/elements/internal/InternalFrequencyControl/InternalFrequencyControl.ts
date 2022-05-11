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

  private __getItems = memoize((value: string) => {
    const count = parseDuration(value).count;

    return [
      { value: 'd', label: this.t('day', { count }) },
      { value: 'w', label: this.t('week', { count }) },
      { value: 'm', label: this.t('month', { count }) },
      { value: 'y', label: this.t('year', { count }) },
    ];
  });

  renderControl(): TemplateResult {
    const value = (this._value ?? '') as string;

    return html`
      <vaadin-custom-field
        data-testid="field"
        .i18n=${this.__i18n}
        .label=${this.label}
        .value=${value}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .errorMessage=${this._errorMessage}
        .checkValidity=${this._checkValidity}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as CustomFieldElement;
          this._value = field.value as string;
        }}
      >
        <vaadin-integer-field
          data-testid="value"
          min="1"
          max="999"
          has-controls
          prevent-invalid-input
          ?invalid=${!!this._error}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
        >
        </vaadin-integer-field>

        <vaadin-combo-box
          data-testid="units"
          item-value-path="value"
          item-label-path="label"
          .items=${this.__getItems(value)}
          ?invalid=${!!this._error}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
        >
        </vaadin-combo-box>
      </vaadin-custom-field>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);

    const field = this.renderRoot.firstElementChild as CustomFieldElement;
    const value = this.nucleon?.form[this.property];

    if (field.value !== value) field.value = value;
  }
}
