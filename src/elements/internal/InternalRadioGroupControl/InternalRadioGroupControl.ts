import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { RadioGroupElement } from '@vaadin/vaadin-radio-button/vaadin-radio-group';
import type { Option } from './types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';
import { classMap } from '../../../utils/class-map';

import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';
import { css } from 'lit-element';

registerStyles(
  'vaadin-radio-group',
  css`
    :host([theme~='list']) label {
      padding-bottom: var(--lumo-space-xs);
    }

    :host([theme~='list']) [part='group-field'] {
      display: flex;
      border: thin solid var(--lumo-contrast-10pct);
      border-radius: var(--lumo-border-radius);
      transition: border-color 0.15s ease;
    }

    :host([theme~='list']:not([disabled]):not([readonly]):hover) [part='group-field'] {
      border-color: var(--lumo-contrast-20pct);
    }
  `
);

/**
 * Internal control wrapper for `vaadin-radio-group` element.
 *
 * @since 1.17.0
 * @element foxy-internal-radio-group-control
 */
export class InternalRadioGroupControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Array },
      theme: { type: String },
    };
  }

  /** List of radio buttons to render. */
  options: Option[] = [];

  /** Same as the "theme" attribute/property of `vaadin-radio-group`. */
  theme: string | null = null;

  renderControl(): TemplateResult {
    const isList = !!this.theme?.includes('list');

    return html`
      <vaadin-radio-group
        error-message=${ifDefined(this._errorMessage)}
        helper-text=${this.helperText}
        label=${this.label}
        class=${classMap({
          'w-full': true,
          'group divide-y divide-contrast-10': isList,
        })}
        theme=${ifDefined(this.theme ?? undefined)}
        ?disabled=${this.disabled || this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${this._value as string | null}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as RadioGroupElement;
          this._value = field.value;
        }}
      >
        ${this.options.map(
          option => html`
            <vaadin-radio-button
              value=${option.value}
              class=${classMap({
                'block p-s transition-colors': isList,
                'group-hover-divide-contrast-20': isList && !this.disabled && !this.readonly,
              })}
            >
              <foxy-i18n infer="" key=${option.label}></foxy-i18n>
            </vaadin-radio-button>
          `
        )}
      </vaadin-radio-group>
    `;
  }
}
