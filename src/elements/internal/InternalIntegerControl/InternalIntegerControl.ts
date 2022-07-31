import type { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';
import type { TemplateResult } from 'lit-element';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

/**
 * Internal control displaying a basic integer box.
 *
 * @since 1.17.0
 * @element foxy-internal-integer-control
 */
export class InternalIntegerControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    return html`
      <vaadin-integer-field
        error-message=${ifDefined(this._errorMessage)}
        placeholder=${this.placeholder}
        helper-text=${this.helperText}
        label=${this.label}
        class="w-full"
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${String(this._value)}
        clear-button-visible
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as IntegerFieldElement;
          this._value = parseInt(field.value);
        }}
      >
      </vaadin-integer-field>
    `;
  }

  protected get _value(): number {
    return (super._value as number | undefined) ?? 0;
  }

  protected set _value(newValue: number) {
    super._value = newValue as unknown | undefined;
  }
}
