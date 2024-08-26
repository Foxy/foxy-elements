import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { QueryBuilder } from '../../public/QueryBuilder/QueryBuilder';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { Operator } from '../../public/QueryBuilder/types';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

export class InternalQueryBuilderControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      operators: { type: Array },
      disableOr: { type: Boolean, attribute: 'disable-or' },
      layout: {},
    };
  }

  operators: Operator[] = Object.values(Operator);

  disableOr = false;

  layout: 'standalone' | 'summary-item' | null = null;

  renderControl(): TemplateResult {
    const { label, helperText, _errorMessage: error } = this;
    const showError = error && !this.disabled && !this.readonly;
    const layout = this.layout ?? 'standalone';
    const builder = html`
      <foxy-query-builder
        infer="query-builder"
        class=${classMap({ 'mt-xs': layout === 'summary-item' })}
        style=${layout === 'summary-item'
          ? '--lumo-border-radius: var(--lumo-border-radius-s)'
          : ''}
        .operators=${this.operators}
        .value=${this._value}
        ?disable-or=${this.disableOr}
        @change=${(evt: CustomEvent) => {
          const queryBuilder = evt.currentTarget as QueryBuilder;
          this._value = queryBuilder.value ?? '';
        }}
      >
      </foxy-query-builder>
    `;

    return html`
      <section
        class=${classMap({
          'grid gap-xs leading-xs transition-colors text-secondary': true,
          'hover-text-body': layout === 'standalone' && !this.disabled && !this.readonly,
          'text-disabled': this.disabled,
          'text-body': this.readonly,
        })}
      >
        ${label
          ? html`
              <p
                class=${classMap({
                  'text-s font-medium': layout === 'standalone',
                  'text-m text-body': layout === 'summary-item',
                  'hidden': !label,
                })}
              >
                ${label}
              </p>
            `
          : ''}
        ${layout === 'standalone' ? builder : ''}
        ${helperText ? html`<p class="text-xs">${helperText}</p>` : ''}
        ${showError ? html`<p class="text-xs text-error">${error}</p>` : ''}
        ${layout === 'summary-item' ? builder : ''}
      </section>
    `;
  }
}
