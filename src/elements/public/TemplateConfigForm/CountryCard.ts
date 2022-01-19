import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const Base = ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement)));

export class CountryCard extends Base<Resource<Rels.Regions>> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __newRegion: { attribute: false },
      regions: { type: Array },
      name: { type: String },
      code: { type: String },
    };
  }

  regions: string[] = [];

  name = '';

  code = '';

  private __newRegion = '';

  render(): TemplateResult {
    return html`
      <div
        class=${classMap({
          'border border-contrast-10 rounded text-s': true,
          'text-disabled': this.disabled,
        })}
      >
        <div
          data-testid="country"
          class="h-m flex justify-between items-center border-b border-contrast-10"
        >
          <div class="ml-m">
            <span>${this.name || this.code}</span>
            ${this.name ? html`<span class="text-secondary">${this.code}</span>` : ''}
          </div>

          <button
            aria-label=${this.t('delete')}
            class=${classMap({
              'mr-xs items-center justify-center rounded-full transition-colors': true,
              'hover-bg-error-10 hover-text-error': !this.disabled,
              'focus-outline-none focus-ring-2 ring-inset ring-error-50': !this.disabled,
              'cursor-default': this.disabled,
              'flex': !this.readonly,
              'hidden': this.readonly,
            })}
            style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
            ?disabled=${this.disabled}
            @click=${() => this.dispatchEvent(new CustomEvent('delete'))}
          >
            <iron-icon icon="icons:close" class="icon-inline text-m"></iron-icon>
          </button>
        </div>

        <div data-testid="regions" class="flex flex-wrap p-xs">
          ${this.regions.map(region => {
            const name = this.data?.values[region]?.default;
            const code = region;

            return html`
              <div
                class="flex items-center border border-contrast-10 h-s m-xs"
                style="border-radius: var(--lumo-size-s)"
              >
                <span class="mx-s">
                  <span>${name || code}</span>
                  ${name ? html`<span class="text-secondary">${code}</span>` : ''}
                </span>

                <button
                  aria-label=${this.t('delete')}
                  class=${classMap({
                    'items-center justify-center rounded-full transition-colors': true,
                    'hover-bg-error-10 hover-text-error': !this.disabled,
                    'focus-outline-none focus-ring-2 ring-inset ring-error-50': !this.disabled,
                    'cursor-default': this.disabled,
                    'flex': !this.readonly,
                    'hidden': this.readonly,
                  })}
                  style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
                  ?disabled=${this.disabled}
                  @click=${() => {
                    this.regions = this.regions.filter(value => value !== region);
                    this.dispatchEvent(new CustomEvent('update:regions'));
                  }}
                >
                  <iron-icon icon="icons:close" class="icon-inline text-m"></iron-icon>
                </button>
              </div>
            `;
          })}

          <div
            data-testid="new-region"
            style="border-radius: var(--lumo-size-s)"
            class=${classMap({
              'h-s m-xs items-center transition-colors border border-contrast-10': true,
              'hover-border-contrast-40': !this.disabled,
              'focus-within-ring-1 ring-primary-50 focus-within-border-primary-50': !this.disabled,
              'flex': !this.readonly,
              'hidden': this.readonly,
            })}
          >
            <input
              placeholder=${this.t('add_region')}
              class="bg-transparent appearance-none h-s text-s px-s focus-outline-none"
              style="width: 8rem"
              list="list"
              .value=${this.__newRegion}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              @keydown=${(evt: KeyboardEvent) => {
                if (evt.key === 'Enter' && this.__newRegion) this.__addRegion();
              }}
              @input=${(evt: InputEvent) => {
                const target = evt.currentTarget as HTMLInputElement;
                this.__newRegion = target.value;
              }}
            />

            <button
              style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
              class=${classMap({
                'flex-shrink-0': true,
                'flex items-center justify-center rounded-full transition-colors': true,
                'bg-contrast-5 text-disabled cursor-default': !this.__newRegion,
                'bg-success-10 text-success cursor-pointer': !!this.__newRegion,
                'hover-bg-success hover-text-success-contrast': !!this.__newRegion,
                'focus-outline-none focus-ring-2 ring-inset ring-success-50': !!this.__newRegion,
              })}
              ?disabled=${this.disabled || !this.__newRegion}
              @click=${this.__addRegion}
            >
              <iron-icon icon="icons:add" class="icon-inline text-m"></iron-icon>
            </button>
          </div>

          <datalist id="list">
            ${Object.values(this.data?.values ?? {}).map(region => {
              return html`<option value=${region.code}>${region.default}</option>`;
            })}
          </datalist>
        </div>
      </div>
    `;
  }

  private __addRegion() {
    this.regions = [...new Set([...this.regions, this.__newRegion])];
    this.__newRegion = '';
    this.dispatchEvent(new CustomEvent('update:regions'));
  }
}
