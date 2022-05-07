import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { TemplateResult, html } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';

export class InternalTextControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    return html`
      <vaadin-text-field
        error-message=${ifDefined(this._errorMessage)}
        helper-text=${this.helperText}
        placeholder=${this.placeholder}
        label=${this.label}
        class="w-full"
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${this._value}
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        @input=${(evt: CustomEvent) => {
          const field = evt.currentTarget as TextFieldElement;
          this._value = field.value;
        }}
      >
      </vaadin-text-field>
    `;
  }
}
