import type { TextFieldElement } from '@vaadin/vaadin-text-field';
import type { TemplateResult } from 'lit-element';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

/**
 * Internal control displaying a basic text box.
 *
 * @since 1.17.0
 * @element foxy-internal-text-control
 */
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
        clear-button-visible
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

  protected get _value(): string {
    return (super._value as string | undefined) ?? '';
  }

  protected set _value(newValue: string) {
    super._value = newValue as unknown | undefined;
  }
}
