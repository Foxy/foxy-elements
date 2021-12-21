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
      regions: { type: Array },
      region: { type: String },
      name: { type: String },
      code: { type: String },
    };
  }

  regions: string[] = [];

  region = '';

  name = '';

  code = '';

  render(): TemplateResult {
    return html`
      <div class="border border-contrast-10 rounded text-s">
        <div class="h-m flex justify-between items-center border-b border-contrast-10">
          <div class="ml-m">
            <span>${this.name || this.code}</span>
            ${this.name ? html`<span class="text-secondary">${this.code}</span>` : ''}
          </div>

          <button
            class="mr-xs flex items-center justify-center rounded-full transition-colors hover-bg-error-10 hover-text-error focus-outline-none focus-ring-2 focus-ring-inset focus-ring-error-50"
            style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
            @click=${() => this.dispatchEvent(new CustomEvent('delete'))}
          >
            <iron-icon icon="icons:close" class="icon-inline text-m"></iron-icon>
          </button>
        </div>

        <div class="flex flex-wrap p-xs">
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
                  class="flex items-center justify-center rounded-full transition-colors hover-bg-error-10 hover-text-error focus-outline-none focus-ring-2 focus-ring-inset focus-ring-error-50"
                  style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
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
            class="h-s m-xs flex items-center transition-colors border border-contrast-10 hover-border-contrast-40 focus-within-ring-1 focus-within-ring-primary-50 focus-within-border-primary-50"
            style="border-radius: var(--lumo-size-s)"
          >
            <input
              placeholder=${this.t('add_region')}
              class="bg-transparent appearance-none h-s text-s px-s focus-outline-none"
              style="width: 8rem"
              list="list"
              .value=${this.region}
              @keydown=${(evt: KeyboardEvent) => {
                if (evt.key === 'Enter' && this.region) this.__addRegion();
              }}
              @input=${(evt: InputEvent) => {
                const target = evt.currentTarget as HTMLInputElement;
                this.region = target.value;
              }}
            />

            <button
              style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
              class=${classMap({
                'flex-shrink-0': true,
                'flex items-center justify-center rounded-full transition-colors': true,
                'bg-contrast-5 text-disabled cursor-default': !this.region,
                'bg-success-10 text-success cursor-pointer': !!this.region,
                'hover-bg-success hover-text-success-contrast': !!this.region,
                'focus-outline-none focus-ring-2 ring-inset ring-success-50': !!this.region,
              })}
              ?disabled=${!this.region}
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
    this.regions = [...new Set([...this.regions, this.region])];
    this.region = '';
    this.dispatchEvent(new CustomEvent('update:regions'));
  }
}
