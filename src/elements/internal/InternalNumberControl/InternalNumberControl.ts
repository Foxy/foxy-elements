import type { NumberFieldElement } from '@vaadin/vaadin-text-field/vaadin-number-field';
import type { TemplateResult } from 'lit-element';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

/**
 * Internal control displaying a basic number box.
 *
 * @since 1.17.0
 * @tag foxy-internal-number-control
 */
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
        .value=${String(this._value)}
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

  protected get _value(): number {
    return (super._value as number | undefined) ?? 0;
  }

  protected set _value(newValue: number) {
    super._value = newValue as unknown | undefined;
  }
}