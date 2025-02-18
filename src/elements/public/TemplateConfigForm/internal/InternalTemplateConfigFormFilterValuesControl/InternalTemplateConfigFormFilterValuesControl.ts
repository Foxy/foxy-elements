import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { TemplateResult, html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../../../utils/class-map';
import { InternalTemplateConfigFormFilterValuesControlItem } from './InternalTemplateConfigFormFilterValuesControlItem';

export class InternalTemplateConfigFormFilterValuesControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __newCountry: { attribute: false },
      countries: {},
      regions: {},
    };
  }

  countries: string | null = null;

  regions: string | null = null;

  private __newCountry = '';

  renderControl(): TemplateResult {
    const options = Object.values(this.__countriesLoader?.data?.values ?? {});
    const filteredOptions = options.filter(c => !(c.cc2 in this._value));

    return html`
      <div class="space-y-s" data-testid="countries">
        ${Object.entries(this._value).map(([country, regions]) => {
          let regionsLink: string;

          try {
            const url = new URL(this.regions ?? '');
            url.searchParams.set('country_code', country);
            regionsLink = url.toString();
          } catch {
            regionsLink = '';
          }

          return html`
            <foxy-internal-template-config-form-filter-values-control-item
              regions=${JSON.stringify(regions === '*' ? [] : regions)}
              infer=""
              code=${country}
              name=${ifDefined(options.find(o => o.cc2 === country)?.default)}
              href=${regionsLink}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              @update:regions=${(evt: CustomEvent) => {
                const newCountries = { ...this._value };
                const newRegions = (
                  evt.currentTarget as InternalTemplateConfigFormFilterValuesControlItem
                ).regions;

                newCountries[country] = newRegions.length ? newRegions : '*';
                this._value = newCountries;
              }}
              @delete=${() => {
                const newCountries = { ...this._value };
                delete newCountries[country];
                this._value = newCountries;
              }}
            >
            </foxy-internal-template-config-form-filter-values-control-item>
          `;
        })}
        ${filteredOptions.length === 0 && options.length !== 0
          ? ''
          : html`
              <div
                data-testid="new-country"
                class=${classMap({
                  'h-m flex items-center rounded-s transition-colors': true,
                  'border border-contrast-10 ring-primary-50': true,
                  'focus-within-ring-1 focus-within-border-primary-50': !this.disabled,
                  'flex': !this.readonly,
                  'hidden': this.readonly,
                })}
              >
                ${options.length === 0
                  ? html`
                      <input
                        placeholder=${this.t('add_country')}
                        class="w-full bg-transparent font-medium appearance-none h-m focus-outline-none"
                        style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
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
                          'flex items-center justify-center rounded-s transition-colors': true,
                          'text-transparent cursor-default': !this.__newCountry,
                          'bg-contrast-5 text-body cursor-pointer': !!this.__newCountry,
                          'hover-bg-success hover-text-success-contrast': !!this.__newCountry,
                          'focus-outline-none focus-ring-2 ring-inset ring-primary-50':
                            !!this.__newCountry,
                        })}
                        style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
                        ?disabled=${!this.__newCountry || this.disabled}
                        @click=${this.__addCountry}
                      >
                        <iron-icon icon="icons:add" class="icon-inline text-m"></iron-icon>
                      </button>
                    `
                  : html`
                      <select
                        class=${classMap({
                          'appearance-none bg-transparent h-m text-m px-s flex-1 font-medium': true,
                          'transition-colors rounded-s focus-outline-none': true,
                          'cursor-pointer hover-bg-contrast-5': !this.disabled,
                          'text-disabled': this.disabled,
                        })}
                        ?disabled=${this.disabled}
                        @change=${(evt: Event) => {
                          const target = evt.currentTarget as HTMLSelectElement;
                          this.__newCountry = target.value;
                          this.__addCountry();
                          target.value = '';
                        }}
                      >
                        <option value="" disabled selected>${this.t('add_country')}</option>
                        ${filteredOptions.map(
                          option => html`<option value=${option.cc2}>${option.default}</option>`
                        )}
                      </select>
                    `}
              </div>
            `}
      </div>

      <foxy-nucleon
        infer=""
        href=${ifDefined(this.countries ?? void 0)}
        id="countriesLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private __addCountry() {
    this._value = { ...this._value, [this.__newCountry]: '*' };
    this.__newCountry = '';
  }

  private get __countriesLoader() {
    type Loader = NucleonElement<Resource<Rels.Countries>>;
    return this.renderRoot.querySelector<Loader>('#countriesLoader');
  }

  protected get _value(): Record<string, '*' | string[]> {
    return (super._value ?? {}) as Record<string, '*' | string[]>;
  }

  protected set _value(value: Record<string, '*' | string[]>) {
    super._value = value;
  }
}
