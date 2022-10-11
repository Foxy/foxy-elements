import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { SelectElement, SelectRenderer } from '@vaadin/vaadin-select';
import type { Option } from './types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, render } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';

/**
 * Internal control wrapper for `vaadin-select` element.
 *
 * @since 1.19.0
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

  /** Same as the "theme" attribute/property of `vaadin-select`. */
  theme: string | null = null;

  private __renderer: SelectRenderer = root => {
    const items = this.options.map(({ label, value }) => {
      return html`
        <vaadin-item value=${value}>
          <foxy-i18n lang=${this.lang} key=${label} ns=${this.ns}></foxy-i18n>
        </vaadin-item>
      `;
    });

    if (!root.firstElementChild) root.appendChild(document.createElement('vaadin-list-box'));
    render(items, root.firstElementChild as Element);
  };

  renderControl(): TemplateResult {
    return html`
      <vaadin-select
        error-message=${ifDefined(this._errorMessage)}
        placeholder=${this.placeholder}
        helper-text=${this.helperText}
        class="w-full -mt-m -mb-xs"
        label=${this.label}
        theme=${ifDefined(this.theme ?? undefined)}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .renderer=${this.__renderer}
        .value=${this._value as string}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as SelectElement;
          this._value = field.value;
        }}
      >
      </vaadin-select>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);

    if (changes.has('ns') || changes.has('lang') || changes.has('options')) {
      this.renderRoot.querySelector<SelectElement>('vaadin-select')?.render();
    }
  }
}
