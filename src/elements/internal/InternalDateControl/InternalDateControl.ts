import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { TemplateResult, html, PropertyDeclarations } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { serializeDate } from '../../../utils/serialize-date';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';

export class InternalDateControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      format: { type: String },
    };
  }

  format = 'unix';

  renderControl(): TemplateResult {
    let value: string;

    if (this.format === 'unix') {
      value = serializeDate(new Date((this._value as number) ?? 0));
    } else {
      value = this._value as string;
    }

    return html`
      <vaadin-date-picker
        error-message=${ifDefined(this._errorMessage)}
        placeholder=${this.placeholder}
        label=${this.label}
        class="w-full"
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${value}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as DatePickerElement;
          const fieldValue = field.value;

          if (this.format === 'unix') {
            this.nucleon?.edit({ [this.property]: new Date(fieldValue).getTime() });
          }
        }}
      >
      </vaadin-date-picker>
    `;
  }
}
