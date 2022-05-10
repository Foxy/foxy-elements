import type { TemplateResult, PropertyDeclarations } from 'lit-element';
import type { DatePickerElement } from '@vaadin/vaadin-date-picker';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { serializeDate } from '../../../utils/serialize-date';
import { parseDate } from '../../../utils/parse-date';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

/**
 * Internal control displaying a basic date picker box.
 *
 * @since 1.17.0
 * @tag foxy-internal-date-control
 */
export class InternalDateControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      format: { type: String },
    };
  }

  /** Date format. If `unix`, expects and outputs a UNIX timestamp (number), otherwise defaults to ISO 8601 date. */
  format: 'unix' | null = null;

  renderControl(): TemplateResult {
    let value: string;

    if (this.format === 'unix') {
      value = serializeDate(new Date(((this._value as number) ?? 0) * 1000));
    } else {
      value = this._value as string;
    }

    return html`
      <vaadin-date-picker
        error-message=${ifDefined(this._errorMessage)}
        placeholder=${this.placeholder}
        helper-text=${this.helperText}
        label=${this.label}
        class="w-full"
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${value}
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as DatePickerElement;

          if (this.format === 'unix') {
            this._value = Math.floor((parseDate(field.value)?.getTime() ?? 0) / 1000);
          } else {
            this._value = field.value;
          }
        }}
      >
      </vaadin-date-picker>
    `;
  }
}
