import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';

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
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      prefix: {},
      suffix: {},
    };
  }

  prefix: string | null = null;

  suffix: string | null = null;

  renderControl(): TemplateResult {
    return html`
      <vaadin-text-field
        error-message=${ifDefined(this._errorMessage)}
        helper-text=${this.helperText}
        placeholder=${this.placeholder}
        label=${this.label}
        class="w-full"
        ?clear-button-visible=${!this.suffix}
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
        ${this.prefix ? html`<div slot="prefix">${this.prefix}</div>` : ''}
        ${this.suffix ? html`<div class="pr-s font-medium" slot="suffix">${this.suffix}</div>` : ''}
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
