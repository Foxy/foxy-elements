import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NumberFieldElement } from '@vaadin/vaadin-text-field/vaadin-number-field';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

/**
 * Internal control displaying a basic number box.
 *
 * @since 1.17.0
 * @element foxy-internal-number-control
 */
export class InternalNumberControl extends InternalEditableControl {
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
      <vaadin-number-field
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
        .value=${String(this._value)}
        clear-button-visible
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as NumberFieldElement;
          this._value = parseFloat(field.value);
        }}
      >
        ${this.prefix ? html`<div slot="prefix">${this.prefix}</div>` : ''}
        ${this.suffix ? html`<div class="pr-s font-medium" slot="suffix">${this.suffix}</div>` : ''}
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
