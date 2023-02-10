import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import type { Option } from './types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

/**
 * Internal control wrapper for `vaadin-select` element.
 *
 * @since 1.21.0
 * @element foxy-internal-select-control
 */
export class InternalSelectControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Array },
      theme: { type: String },
    };
  }

  /** List of radio buttons to render. */
  options: Option[] = [];

  /** Same as the "theme" attribute/property of `vaadin-combo-box`. */
  theme: string | null = null;

  renderControl(): TemplateResult {
    return html`
      <vaadin-combo-box
        item-value-path="value"
        item-label-path="label"
        error-message=${ifDefined(this._errorMessage)}
        item-id-path="value"
        helper-text=${this.helperText}
        placeholder=${this.placeholder}
        label=${this.label}
        class="w-full"
        theme=${ifDefined(this.theme ?? undefined)}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        clear-button-visible
        .checkValidity=${this._checkValidity}
        .items=${this.options.map(({ value, label }) => ({ value, label: this.t(label) }))}
        .value=${this._value}
        @change=${(evt: CustomEvent) => {
          evt.stopPropagation();
          const comboBox = evt.currentTarget as ComboBoxElement;
          this._value = comboBox.value;
          comboBox.validate();
        }}
      >
      </vaadin-combo-box>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    const comboBox = this.renderRoot.querySelector('vaadin-combo-box');
    if (comboBox && comboBox.value !== this._value) comboBox.value = this._value as string;
  }
}
