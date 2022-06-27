import type { TextAreaElement } from '@vaadin/vaadin-text-field/vaadin-text-area';
import type { TemplateResult } from 'lit-element';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

/**
 * Internal control displaying a basic text area box.
 *
 * @since 1.17.0
 * @element foxy-internal-text-area-control
 */
export class InternalTextAreaControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    return html`
      <vaadin-text-area
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
          const area = evt.currentTarget as TextAreaElement;
          this._value = area.value;
        }}
      >
      </vaadin-text-area>
    `;
  }

  protected get _value(): string {
    return (super._value as string | undefined) ?? '';
  }

  protected set _value(newValue: string) {
    super._value = newValue as unknown | undefined;
  }
}
