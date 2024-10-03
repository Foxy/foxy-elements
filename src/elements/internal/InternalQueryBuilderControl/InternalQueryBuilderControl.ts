import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { QueryBuilder } from '../../public/QueryBuilder/QueryBuilder';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { Operator } from '../../public/QueryBuilder/types';
import { html } from 'lit-html';

export class InternalQueryBuilderControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disableZoom: { type: Boolean, attribute: 'disable-zoom' },
      disableOr: { type: Boolean, attribute: 'disable-or' },
      operators: { type: Array },
    };
  }

  disableZoom = false;

  disableOr = false;

  operators: Operator[] = Object.values(Operator);

  renderControl(): TemplateResult {
    const { label, helperText, _errorMessage: error } = this;
    const showError = error && !this.disabled && !this.readonly;

    return html`
      <section class="grid gap-s leading-xs">
        <div ?hidden=${!label && !helperText}>
          ${label ? html`<p class="text-l font-medium">${label}</p>` : ''}
          ${helperText ? html`<p class="text-s text-secondary">${helperText}</p>` : ''}
        </div>

        <div
          class="bg-contrast-5 rounded"
          style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px);"
        >
          <foxy-query-builder
            infer="query-builder"
            style="--lumo-border-radius: var(--lumo-border-radius-s); --lumo-border-radius-l: var(--lumo-border-radius-s)"
            .operators=${this.operators}
            .value=${this._value}
            ?disable-zoom=${this.disableZoom}
            ?disable-or=${this.disableOr}
            @change=${(evt: CustomEvent) => {
              const queryBuilder = evt.currentTarget as QueryBuilder;
              this._value = queryBuilder.value ?? '';
            }}
          >
          </foxy-query-builder>
        </div>

        ${showError ? html`<p class="text-s text-error">${error}</p>` : ''}
      </section>
    `;
  }
}
