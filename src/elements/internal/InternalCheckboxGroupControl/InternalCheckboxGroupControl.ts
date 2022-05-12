import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CheckboxGroupElement } from '@vaadin/vaadin-checkbox/vaadin-checkbox-group';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalCheckboxGroupControl extends InternalEditableControl {
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
      <vaadin-checkbox-group
        error-message=${ifDefined(this._errorMessage)}
        helper-text=${this.helperText}
        label=${this.label}
        class="w-full"
        theme=${ifDefined(this.theme ?? undefined)}
        ?disabled=${this.disabled || this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${this._value as string[]}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as CheckboxGroupElement;
          this._value = field.value;
        }}
      >
        ${this.options.map(
          option => html`
            <vaadin-checkbox value=${option.value}>
              <foxy-i18n infer="" key=${option.label}></foxy-i18n>
            </vaadin-checkbox>
          `
        )}
      </vaadin-checkbox-group>
    `;
  }
}
