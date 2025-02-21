import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { getResourceId } from '@foxy.io/sdk/core';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-element';
import { classMap } from '../../../../../utils/class-map';

export class InternalNativeIntegrationFormCodeMapControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      itemCategoryBase: { attribute: 'item-category-base' },
      itemCategories: { attribute: 'item-categories' },
    };
  }

  itemCategoryBase: string | null = null;

  itemCategories: string | null = null;

  private readonly __newMappingGetValue = () => void 0;

  private readonly __newMappingSetValue = (value: string) => {
    const id = getResourceId(value);

    if (typeof id === 'string' || typeof id === 'number') {
      if (this._value && id in this._value) {
        const entry = this.renderRoot.querySelector(`#category-${id}`);
        entry?.animate(
          [
            { background: '' },
            { background: 'var(--lumo-primary-color-50pct)' },
            { background: '' },
          ],
          {
            duration: 2000,
            easing: 'ease',
          }
        );
      } else {
        this._value = { ...this._value, [id]: '' };
      }
    }
  };

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-summary-control infer="existing-mappings" unsafe-helper-text>
        ${Object.entries(this._value ?? {}).map(([id, taxCode]) => {
          let categoryHref: string | undefined;

          try {
            categoryHref = new URL(id, this.itemCategoryBase ?? void 0).toString();
          } catch {
            categoryHref = undefined;
          }

          type Loader = NucleonElement<Resource<Rels.ItemCategory>>;
          const loader = this.renderRoot.querySelector<Loader>(`#category${id}Loader`);
          const status = loader?.in('fail')
            ? this.t('existing-mappings.status_fail')
            : loader?.in('busy')
            ? this.t('existing-mappings.status_busy')
            : null;

          return html`
            <div class="flex items-center gap-xs" id="category-${id}">
              <foxy-nucleon
                parent=${ifDefined(this.itemCategories ?? void 0)}
                class="hidden"
                infer=""
                href=${ifDefined(categoryHref)}
                id="category${id}Loader"
                @update=${() => this.requestUpdate()}
              >
              </foxy-nucleon>

              <foxy-internal-text-control
                helper-text=""
                layout="summary-item"
                label=${loader?.data?.name ?? status ?? id}
                infer=""
                class="flex-1"
                .getValue=${() => taxCode}
                .setValue=${(v: string) => (this._value = { ...this._value, [id]: v })}
              >
              </foxy-internal-text-control>

              <button
                aria-label=${this.t('delete')}
                class=${classMap({
                  'flex-shrink-0 rounded-full transition-colors': true,
                  'focus-outline-none focus-ring-2 focus-ring-primary-50': true,
                  'cursor-pointer text-tertiary hover-text-body': !this.disabled,
                  'cursor-default text-disabled': this.disabled,
                })}
                style="width: 1em; height: 1em;"
                ?disabled=${this.disabled}
                ?hidden=${this.readonly || !!taxCode}
                @click=${() => {
                  const newValue = { ...this._value };
                  delete newValue[id];
                  this._value = newValue;
                }}
              >
                ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1em; height: 1em; transform: translate(0.1em, 0.1em) scale(1.3);"><path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clip-rule="evenodd" />                  </svg>`}
              </button>
            </div>
          `;
        })}
      </foxy-internal-summary-control>

      <foxy-internal-summary-control helper-text="" label="" infer="new-mapping" class="mt-s">
        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this.itemCategories ?? void 0)}
          infer=""
          item="foxy-item-category-card"
          .getValue=${this.__newMappingGetValue}
          .setValue=${this.__newMappingSetValue}
        >
        </foxy-internal-resource-picker-control>
      </foxy-internal-summary-control>
    `;
  }

  protected get _value(): Record<string, string> | undefined {
    return super._value as Record<string, string> | undefined;
  }

  protected set _value(newValue: Record<string, string> | undefined) {
    super._value = newValue;
  }
}
