import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { generateRandomPassword } from './generateRandomPassword';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-element';
import { classMap } from '../../../utils/class-map';

/**
 * Internal control displaying a basic password box.
 *
 * @since 1.17.0
 * @element foxy-internal-password-field-control
 */
export class InternalPasswordControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      generatorOptions: { type: Object, attribute: 'generator-options' },
      showGenerator: { type: Boolean, attribute: 'show-generator' },
    };
  }

  generatorOptions: null | { length?: number; charset?: string } = null;

  /** If true, renders the password generator button. */
  showGenerator = false;

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
        ${this.showGenerator ? this.__renderGenerator() : ''}
      </vaadin-password-field>
    `;
  }

  protected get _value(): string {
    return (super._value as string | undefined) ?? '';
  }

  protected set _value(newValue: string) {
    super._value = newValue as unknown | undefined;
  }

  private __renderGenerator(): TemplateResult {
    return html`
      <div
        data-testid="generator"
        class=${classMap({
          'w-s h-s flex items-center justify-center cursor-default transition-colors': true,
          'text-contrast-60 hover-text-contrast-80': !this.disabled && !this.readonly,
          'text-contrast-20': this.disabled || this.readonly,
        })}
        slot="suffix"
        @click=${() => {
          this._value = generateRandomPassword(this.generatorOptions ?? void 0);
          const field = this.renderRoot.querySelector('vaadin-password-field');
          // @ts-expect-error: this is a private method but it's ok since the version is fixed
          field?._setPasswordVisible(true);
        }}
      >
        ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1.15em; height: 1.15em"><path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" /></svg>`}
      </div>
    `;
  }
}
