import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CheckboxGroupElement } from '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { Option } from './types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

/**
 * Internal control wrapper for `vaadin-checkbox-group` element.
 *
 * @since 1.17.0
 * @element foxy-internal-checkbox-group-control
 */
export class InternalCheckboxGroupControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Array },
      theme: { type: String },
    };
  }

  /** List of checkboxes to render. */
  options: Option[] = [];

  /** Same as the "theme" attribute/property of `vaadin-checkbox-group`. */
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
      >
        ${this.options.map(
          option => html`
            <vaadin-checkbox
              value=${option.value}
              @change=${(evt: CustomEvent) => {
                const box = evt.currentTarget as CheckboxElement;
                const field = box.closest('vaadin-checkbox-group') as CheckboxGroupElement;
                const boxes = field.querySelectorAll<CheckboxElement>('vaadin-checkbox');

                this._value = Array.from(boxes).reduce((value, box) => {
                  return box.checked ? [...value, box.value as string] : value;
                }, [] as string[]);
              }}
            >
              <foxy-i18n infer="" key=${option.label}></foxy-i18n>
            </vaadin-checkbox>
          `
        )}
      </vaadin-checkbox-group>
    `;
  }
}
