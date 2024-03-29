import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { CountryCard } from './CountryCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

const Base = ScopedElementsMixin(
  ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement)))
);

export class CountriesList extends Base<Resource<Rels.Countries>> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'x-country-card': CountryCard,
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __newCountry: { attribute: false },
      countries: { type: Object },
      regions: { type: String },
    };
  }

  countries: Record<string, '*' | string[]> = {};

  regions = '';

  private __newCountry = '';

  render(): TemplateResult {
    return html`
      <div>
        <div class="space-y-s" data-testid="countries">
          ${Object.entries(this.countries).map(([country, regions]) => {
            let regionsLink: string;

            try {
              const url = new URL(this.regions);
              url.searchParams.set('country_code', country);
              regionsLink = url.toString();
            } catch {
              regionsLink = '';
            }

            return html`
              <x-country-card
                regions=${JSON.stringify(regions === '*' ? [] : regions)}
                code=${country}
                name=${ifDefined(this.data?.values[country]?.default)}
                href=${regionsLink}
                lang=${this.lang}
                ns=${this.ns}
                ?disabled=${this.disabled}
                ?readonly=${this.readonly}
                @update:regions=${(evt: CustomEvent) => {
                  const newCountries = { ...this.countries };
                  const newRegions = (evt.currentTarget as CountryCard).regions;

                  newCountries[country] = newRegions.length ? newRegions : '*';
                  this.countries = newCountries;

                  this.dispatchEvent(new CustomEvent('update:countries'));
                }}
                @delete=${() => {
                  const newCountries = { ...this.countries };
                  delete newCountries[country];
                  this.countries = newCountries;

                  this.dispatchEvent(new CustomEvent('update:countries'));
                }}
              >
              </x-country-card>
            `;
          })}

          <div
            data-testid="new-country"
            class=${classMap({
              'h-m flex items-center rounded transition-colors': true,
              'border border-contrast-10 ring-primary-50': true,
              'hover-border-contrast-40': !this.disabled,
              'focus-within-ring-1 focus-within-border-primary-50': !this.disabled,
              'flex': !this.readonly,
              'hidden': this.readonly,
            })}
          >
            <input
              placeholder=${this.t('add_country')}
              class="w-full bg-transparent appearance-none h-m text-s px-m focus-outline-none"
              list="list"
              .value=${this.__newCountry}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              @keydown=${(evt: KeyboardEvent) => {
                if (evt.key === 'Enter' && this.__newCountry) this.__addCountry();
              }}
              @input=${(evt: InputEvent) => {
                const target = evt.currentTarget as HTMLInputElement;
                this.__newCountry = target.value;
              }}
            />

            <button
              aria-label=${this.t('create')}
              class=${classMap({
                'mr-xs flex-shrink-0': true,
                'flex items-center justify-center rounded-full transition-colors': true,
                'bg-contrast-5 text-disabled cursor-default': !this.__newCountry,
                'bg-success-10 text-success cursor-pointer': !!this.__newCountry,
                'hover-bg-success hover-text-success-contrast': !!this.__newCountry,
                'focus-outline-none focus-ring-2 ring-inset ring-success-50': !!this.__newCountry,
              })}
              style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
              ?disabled=${!this.__newCountry || this.disabled}
              @click=${this.__addCountry}
            >
              <iron-icon icon="icons:add" class="icon-inline text-m"></iron-icon>
            </button>
          </div>
        </div>

        <datalist id="list">
          ${Object.entries(this.data?.values ?? {}).map(([code, country]) => {
            return html`<option value=${code}>${country.default}</option>`;
          })}
        </datalist>
      </div>
    `;
  }

  private __addCountry() {
    this.countries = { ...this.countries, [this.__newCountry]: '*' };
    this.__newCountry = '';
    this.dispatchEvent(new CustomEvent('update:countries'));
  }
}
