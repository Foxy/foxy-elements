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
    };
  }

  operators: Operator[] = Object.values(Operator);

  disableOr = false;

  renderControl(): TemplateResult {
    const { label, helperText, _errorMessage: error } = this;
    const showError = error && !this.disabled && !this.readonly;

    return html`
      <section
        class=${classMap({
          'grid gap-xs leading-xs transition-colors': true,
          'text-secondary hover-text-body': !this.disabled && !this.readonly,
          'text-disabled': this.disabled,
          'text-body': this.readonly,
        })}
      >
        ${label ? html`<p class="text-s font-medium">${label}</p>` : ''}

        <foxy-query-builder
          infer="query-builder"
          .operators=${this.operators}
          .value=${this._value}
          ?disable-or=${this.disableOr}
          @change=${(evt: CustomEvent) => {
            const queryBuilder = evt.currentTarget as QueryBuilder;
            this._value = queryBuilder.value ?? '';
          }}
        >
        </foxy-query-builder>

        ${helperText ? html`<p class="text-xs">${helperText}</p>` : ''}
        ${showError ? html`<p class="text-xs text-error">${error}</p>` : ''}
      </section>
    `;
  }
}
