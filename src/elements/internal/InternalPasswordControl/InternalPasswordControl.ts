import type { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';
import type { TemplateResult } from 'lit-element';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

/**
 * Internal control displaying a basic password box.
 *
 * @since 1.17.0
 * @element foxy-internal-password-field-control
 */
export class InternalPasswordControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    return html`
      <vaadin-password-field
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
          const area = evt.currentTarget as PasswordFieldElement;
          this._value = area.value;
        }}
      >
      </vaadin-password-field>
    `;
  }

  protected get _value(): string {
    return (super._value as string | undefined) ?? '';
  }

  protected set _value(newValue: string) {
    super._value = newValue as unknown | undefined;
  }
}
