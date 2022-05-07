import { NumberFieldElement } from '@vaadin/vaadin-text-field/vaadin-number-field';
import { TemplateResult, html } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';

export class InternalNumberControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    return html`
      <vaadin-number-field
        error-message=${ifDefined(this._errorMessage)}
        placeholder=${this.placeholder}
        helper-text=${this.helperText}
        label=${this.label}
        class="w-full"
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${this._value}
        has-controls
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as NumberFieldElement;
          this._value = parseFloat(field.value);
        }}
      >
      </vaadin-number-field>
    `;
  }
}
