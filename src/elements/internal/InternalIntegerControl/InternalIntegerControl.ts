import type { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';
import type { PropertyDeclarations, TemplateResult } from 'lit-element';

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
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      prefix: {},
      suffix: {},
      min: { type: Number },
      max: { type: Number },
    };
  }

  prefix: string | null = null;

  suffix: string | null = null;

  min: number | null = null;

  max: number | null = null;

  renderControl(): TemplateResult {
    return html`
      <vaadin-integer-field
        error-message=${ifDefined(this._errorMessage)}
        placeholder=${this.placeholder}
        helper-text=${this.helperText}
        label=${this.label}
        class="w-full"
        min=${ifDefined(this.min ?? undefined)}
        max=${ifDefined(this.max ?? undefined)}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${this._value}
        clear-button-visible
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as IntegerFieldElement;
          this._value = parseInt(field.value);
        }}
      >
        ${this.prefix ? html`<div slot="prefix">${this.prefix}</div>` : ''}
        ${this.suffix ? html`<div class="pr-s font-medium" slot="suffix">${this.suffix}</div>` : ''}
      </vaadin-integer-field>
    `;
  }
}
