import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { RadioGroupElement } from '@vaadin/vaadin-radio-button/vaadin-radio-group';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalRadioGroupControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Array },
      theme: { type: String },
    };
  }

  options: { label: string; value: string }[] = [];

  theme: string | null = null;

  renderControl(): TemplateResult {
    return html`
      <vaadin-radio-group
        error-message=${ifDefined(this._errorMessage)}
        helper-text=${this.helperText}
        label=${this.label}
        class="w-full"
        theme=${ifDefined(this.theme ?? undefined)}
        ?disabled=${this.disabled || this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${String(this._value)}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as RadioGroupElement;
          this._value = field.value;
        }}
      >
        ${this.options.map(
          option => html`
            <vaadin-radio-button value=${option.value}>
              <foxy-i18n infer="" key=${option.label}></foxy-i18n>
            </vaadin-radio-button>
          `
        )}
      </vaadin-radio-group>
    `;
  }
}
