import { CheckboxChangeEvent, ChoiceChangeEvent } from '../../private/events';
import { Data, TemplateConfigJSON } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { Checkbox } from '../../private/Checkbox/Checkbox';
import { Choice } from '../../private/Choice/Choice';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { CountriesList } from './CountriesList';
import { Group } from '../../private/Group/Group';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { TextAreaElement } from '@vaadin/vaadin-text-field/vaadin-text-area';
import { TextFieldElement } from '@vaadin/vaadin-text-field/vaadin-text-field';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { getDefaultJSON } from './defaults';
import { live } from 'lit-html/directives/live';

const NS = 'template-config-form';
const Base = ScopedElementsMixin(
  ResponsiveMixin(ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement, NS))))
);

export class TemplateConfigForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-text-area': customElements.get('vaadin-text-area'),
      'iron-icon': customElements.get('iron-icon'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-countries-list': CountriesList,
      'x-checkbox': Checkbox,
      'x-choice': Choice,
      'x-group': Group,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __addHiddenFieldInputValue: { attribute: false },
      countries: { type: String },
      regions: { type: String },
    };
  }

  countries = '';

  regions = '';

  private __addHiddenFieldInputValue = '';

  render(): TemplateResult {
    const hidden = this.hiddenControls;
    const json: TemplateConfigJSON = this.form.json ? JSON.parse(this.form.json) : getDefaultJSON();

    return html`
      <div class="relative" aria-busy=${this.in('busy')} aria-live="polite">
        <div
          class=${classMap({
            'space-y-l transition-opacity': true,
            'opacity-50': !this.in('idle'),
          })}
        >
          ${hidden.matches('cart-type', true) ? '' : this.__renderCartType(json)}
          ${hidden.matches('foxycomplete', true) ? '' : this.__renderFoxycomplete(json)}
          ${hidden.matches('locations', true) ? '' : this.__renderLocations(json)}
          ${hidden.matches('hidden-fields', true) ? '' : this.__renderHiddenFields(json)}
          ${hidden.matches('header', true) ? '' : this.__renderHeader(json)}
          ${hidden.matches('footer', true) ? '' : this.__renderFooter(json)}
        </div>

        <div
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': this.in('idle'),
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in('fail') ? 'error' : 'busy'}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  private __renderCartType(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const items = ['default', 'fullpage', 'custom'];

    return html`
      <div>
        ${this.renderTemplateOrSlot('cart-type:before')}

        <x-group frame>
          <foxy-i18n slot="header" lang=${lang} key="cart_type" ns=${ns}></foxy-i18n>

          <x-choice
            .value=${json.cart_type}
            .items=${items}
            ?disabled=${this.disabledSelector.matches('cart-type', true)}
            ?readonly=${this.readonlySelector.matches('cart-type', true)}
            @change=${(evt: ChoiceChangeEvent) => {
              this.edit({ json: JSON.stringify({ ...json, cart_type: evt.detail }) });
            }}
          >
            ${items.map(item => {
              return html`
                <div slot="${item}-label" class="grid leading-s py-s">
                  <foxy-i18n lang=${lang} key="cart_type_${item}" ns=${ns}></foxy-i18n>
                  <foxy-i18n
                    class="text-tertiary text-s"
                    lang=${lang}
                    key="cart_type_${item}_explainer"
                    ns=${ns}
                  >
                  </foxy-i18n>
                </div>
              `;
            })}
          </x-choice>
        </x-group>

        ${this.renderTemplateOrSlot('cart-type:after')}
      </div>
    `;
  }

  private __renderFoxycomplete(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const isDisabled = this.disabledSelector.matches('foxycomplete', true);
    const isReadonly = this.readonlySelector.matches('foxycomplete', true);
    const items = ['combobox', 'search', 'disabled'];
    const value =
      json.foxycomplete.usage === 'none'
        ? 'disabled'
        : json.foxycomplete.show_combobox
        ? 'combobox'
        : 'search';

    const renderFlagsCheckbox = () => html`
      <x-checkbox
        ?disabled=${isDisabled}
        ?readonly=${isReadonly}
        ?checked=${json.foxycomplete.show_flags}
        @change=${(evt: CheckboxChangeEvent) => {
          const newConfig: TemplateConfigJSON['foxycomplete'] = {
            ...json.foxycomplete,
            show_flags: evt.detail,
          };

          this.edit({ json: JSON.stringify({ ...json, foxycomplete: newConfig }) });
        }}
      >
        <foxy-i18n lang=${lang} key="show_country_flags" ns=${ns}></foxy-i18n>
      </x-checkbox>
    `;

    return html`
      <div>
        ${this.renderTemplateOrSlot('foxycomplete:before')}

        <x-group frame>
          <foxy-i18n slot="header" lang=${lang} key="foxycomplete" ns=${ns}></foxy-i18n>

          <x-choice
            .value=${value}
            .items=${items}
            ?disabled=${isDisabled}
            ?readonly=${isReadonly}
            @change=${(evt: Event) => {
              if (!(evt instanceof ChoiceChangeEvent)) return;

              const newConfig: TemplateConfigJSON['foxycomplete'] = {
                ...json.foxycomplete,
                usage: evt.detail === 'disabled' ? 'none' : 'required',
                show_combobox: evt.detail === 'combobox',
              };

              this.edit({ json: JSON.stringify({ ...json, foxycomplete: newConfig }) });
            }}
          >
            ${items.map(item => {
              return html`
                <div slot="${item}-label" class="grid leading-s py-s">
                  <foxy-i18n lang=${lang} key="foxycomplete_${item}" ns=${ns}></foxy-i18n>
                  <foxy-i18n
                    class="text-tertiary text-s"
                    lang=${lang}
                    key="foxycomplete_${item}_explainer"
                    ns=${ns}
                  >
                  </foxy-i18n>
                </div>
              `;
            })}

            <div slot="combobox" class="space-y-m pb-s" ?hidden=${value !== 'combobox'}>
              <div class="grid grid-cols-2 gap-m" style="max-width: 16rem">
                ${['open', 'close'].map(action => {
                  const field = action === 'open' ? 'combobox_open' : 'combobox_close';

                  return html`
                    <vaadin-text-field
                      label=${this.t(`${action}_icon`)}
                      .value=${json.foxycomplete[field]}
                      ?disabled=${isDisabled}
                      ?readonly=${isReadonly}
                      @input=${(evt: CustomEvent) => {
                        const target = evt.currentTarget as TextFieldElement;
                        const newConfig: TemplateConfigJSON['foxycomplete'] = {
                          ...json.foxycomplete,
                          [field]: target.value,
                        };

                        this.edit({ json: JSON.stringify({ ...json, foxycomplete: newConfig }) });
                      }}
                    >
                    </vaadin-text-field>
                  `;
                })}
              </div>

              ${renderFlagsCheckbox()}
            </div>

            <div slot="search" class="pb-s" ?hidden=${value !== 'search'}>
              ${renderFlagsCheckbox()}
            </div>
          </x-choice>

          <div class="border-t border-contrast-10 p-m">
            <x-checkbox
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
              ?checked=${json.postal_code_lookup.usage === 'enabled'}
              @change=${(evt: CheckboxChangeEvent) => {
                const newConfig: TemplateConfigJSON['postal_code_lookup'] = {
                  usage: evt.detail ? 'enabled' : 'none',
                };

                this.edit({ json: JSON.stringify({ ...json, postal_code_lookup: newConfig }) });
              }}
            >
              <foxy-i18n lang=${lang} key="enable_postcode_lookup" ns=${ns}></foxy-i18n>
            </x-checkbox>
          </div>
        </x-group>

        ${this.renderTemplateOrSlot('foxycomplete:after')}
      </div>
    `;
  }

  private __renderLocations(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const config = json.location_filtering;

    const shippingChoice = config.shipping_filter_type === 'blacklist' ? 'block' : 'allow';
    const billingChoice =
      config.usage === 'both'
        ? 'copy'
        : config.billing_filter_type === 'blacklist'
        ? 'block'
        : 'allow';

    const normalize = () => {
      if (config.usage === 'both') {
        config.billing_filter_type = config.shipping_filter_type;
        config.billing_filter_values = config.shipping_filter_values;
      } else {
        const hasBillingFilters = Object.keys(config.billing_filter_values).length > 0;
        const hasShippingFilters = Object.keys(config.shipping_filter_values).length > 0;

        if (!hasBillingFilters && !hasShippingFilters) {
          config.usage = 'none';
        } else if (hasBillingFilters && !hasShippingFilters) {
          config.usage = 'billing';
        } else if (hasShippingFilters && !hasBillingFilters) {
          config.usage = 'shipping';
        } else {
          config.usage = 'independent';
        }
      }
    };

    return html`
      ${this.renderTemplateOrSlot('locations:before')}

      <x-group frame>
        <foxy-i18n slot="header" lang=${lang} key="location_plural" ns=${ns}></foxy-i18n>

        <div class="grid sm-grid-cols-2 bg-contrast-10" style="gap: 1px">
          <x-group class="bg-base pt-m">
            <foxy-i18n class="text-tertiary" slot="header" lang=${lang} key="shipping" ns=${ns}>
            </foxy-i18n>

            <x-choice
              .items=${['allow', 'block']}
              .value=${shippingChoice}
              @change=${(evt: ChoiceChangeEvent) => {
                if (config.usage !== 'both') config.usage = 'independent';
                config.shipping_filter_type = evt.detail === 'block' ? 'blacklist' : 'whitelist';
                normalize();
                this.edit({ json: JSON.stringify(json) });
              }}
            >
              <foxy-i18n slot="allow-label" lang=${lang} key="allowlist" ns=${ns}></foxy-i18n>
              <foxy-i18n slot="block-label" lang=${lang} key="blocklist" ns=${ns}></foxy-i18n>

              <x-countries-list
                countries=${JSON.stringify(config.shipping_filter_values)}
                regions=${this.regions}
                class="mb-m"
                href=${this.countries}
                slot=${shippingChoice}
                lang=${lang}
                ns=${ns}
                ?disabled=${this.disabledSelector.matches('locations', true)}
                ?readonly=${this.readonlySelector.matches('locations', true)}
                @update:countries=${(evt: CustomEvent) => {
                  config.shipping_filter_values = (evt.currentTarget as CountriesList).countries;
                  normalize();
                  this.edit({ json: JSON.stringify(json) });
                }}
              >
              </x-countries-list>
            </x-choice>
          </x-group>

          <x-group class="bg-base pt-m">
            <foxy-i18n class="text-tertiary" slot="header" lang=${lang} key="billing" ns=${ns}>
            </foxy-i18n>

            <x-choice
              .items=${['allow', 'block', 'copy']}
              .value=${billingChoice}
              @change=${(evt: ChoiceChangeEvent) => {
                if (evt.detail === 'copy') {
                  config.usage = 'both';
                } else {
                  config.usage = 'independent';
                  config.billing_filter_type = evt.detail === 'block' ? 'blacklist' : 'whitelist';
                }

                normalize();
                this.edit({ json: JSON.stringify(json) });
              }}
            >
              <foxy-i18n slot="allow-label" lang=${lang} key="allowlist" ns=${ns}></foxy-i18n>
              <foxy-i18n slot="block-label" lang=${lang} key="blocklist" ns=${ns}></foxy-i18n>
              <foxy-i18n slot="copy-label" lang=${lang} key="same_as_shipping" ns=${ns}></foxy-i18n>

              <x-countries-list
                countries=${JSON.stringify(config.billing_filter_values)}
                regions=${this.regions}
                class="mb-m"
                href=${this.countries}
                slot=${billingChoice}
                lang=${lang}
                ns=${ns}
                ?disabled=${this.disabledSelector.matches('locations', true)}
                ?readonly=${this.readonlySelector.matches('locations', true)}
                ?hidden=${billingChoice === 'copy'}
                @update:countries=${(evt: CustomEvent) => {
                  config.billing_filter_values = (evt.currentTarget as CountriesList).countries;
                  normalize();
                  this.edit({ json: JSON.stringify(json) });
                }}
              >
              </x-countries-list>
            </x-choice>
          </x-group>
        </div>
      </x-group>

      ${this.renderTemplateOrSlot('locations:after')}
    `;
  }

  private __renderHiddenFields(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const suggestions = [] as string[];
    const fields = [] as string[];
    const config = json.cart_display_config;

    type FieldName = keyof Omit<
      TemplateConfigJSON['cart_display_config'],
      'hidden_product_options' | 'usage'
    >;

    for (const key in config) {
      if (!key.startsWith('show_')) continue;
      const field = key.substring(5);
      suggestions.push(field);
      if (config.usage === 'required' && !config[key as FieldName]) fields.push(field);
    }

    if (config.usage === 'required') {
      fields.push(...config.hidden_product_options);
    }

    const addField = () => {
      config.usage = 'required';

      if (suggestions.includes(this.__addHiddenFieldInputValue)) {
        config[`show_${this.__addHiddenFieldInputValue}` as FieldName] = false;
      } else if (!config.hidden_product_options.includes(this.__addHiddenFieldInputValue)) {
        config.hidden_product_options.push(this.__addHiddenFieldInputValue);
      }

      this.edit({ json: JSON.stringify(json) });
      this.__addHiddenFieldInputValue = '';
    };

    const radius = 'calc(var(--lumo-border-radius-l) / 1.2)';
    const inputRadius = fields.length === 0 ? [radius] : ['0', '0', radius, radius];

    return html`
      <div>
        ${this.renderTemplateOrSlot('hidden-fields:before')}

        <x-group frame>
          <foxy-i18n slot="header" lang=${lang} key="hidden_fields" ns=${ns}></foxy-i18n>

          <div class="divide-y divide-contrast-10">
            ${fields.map(
              field => html`
                <div class="h-m ml-m pr-xs flex items-center justify-between">
                  ${suggestions.includes(field)
                    ? html`<foxy-i18n lang=${lang} key=${field} ns=${ns}></foxy-i18n>`
                    : html`<span>${field}</span>`}

                  <button
                    class="flex w-xs h-xs items-center justify-center rounded-full transition-colors hover-bg-error-10 hover-text-error focus-outline-none focus-ring-2 focus-ring-inset focus-ring-error-50"
                    @click=${() => {
                      if (typeof config[`show_${field}` as FieldName] === 'boolean') {
                        config[`show_${field}` as FieldName] = true;
                      } else {
                        config.hidden_product_options = config.hidden_product_options.filter(
                          option => option !== field
                        );
                      }

                      this.edit({ json: JSON.stringify(json) });
                    }}
                  >
                    <iron-icon icon="icons:close" class="icon-inline text-m"></iron-icon>
                  </button>
                </div>
              `
            )}
          </div>

          <div
            style="border-radius: ${inputRadius.join(' ')}"
            class=${classMap({
              'h-m flex items-center ring-inset ring-primary-50 focus-within-ring-2': true,
              'border-t border-contrast-10': fields.length > 0,
            })}
          >
            <input
              placeholder=${this.t('add_field')}
              class="w-full bg-transparent appearance-none h-m px-m focus-outline-none"
              list="hidden-fields-list"
              .value=${live(this.__addHiddenFieldInputValue)}
              @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && addField()}
              @input=${(evt: InputEvent) => {
                this.__addHiddenFieldInputValue = (evt.currentTarget as HTMLInputElement).value;
              }}
            />

            <datalist id="hidden-fields-list">
              ${suggestions
                .filter(suggestion => !fields.includes(suggestion))
                .map(
                  suggestion => html`<option value=${suggestion}>${this.t(suggestion)}</option>`
                )}
            </datalist>

            <button
              aria-label=${this.t('add_field')}
              class=${classMap({
                'w-xs h-xs mr-xs flex-shrink-0 ring-inset ring-success-50': true,
                'flex items-center justify-center rounded-full transition-colors': true,
                'bg-contrast-5 text-disabled cursor-default': !this.__addHiddenFieldInputValue,
                'bg-success-10 text-success cursor-pointer': !!this.__addHiddenFieldInputValue,
                'hover-bg-success hover-text-success-contrast': !!this.__addHiddenFieldInputValue,
                'focus-outline-none focus-ring-2': !!this.__addHiddenFieldInputValue,
              })}
              ?disabled=${!this.__addHiddenFieldInputValue}
              @click=${addField}
            >
              <iron-icon icon="icons:add" class="icon-inline text-m"></iron-icon>
            </button>
          </div>
        </x-group>

        ${this.renderTemplateOrSlot('hidden-fields:after')}
      </div>
    `;
  }

  private __renderHeader(json: TemplateConfigJSON) {
    return html`
      <div>
        ${this.renderTemplateOrSlot('header:before')}

        <vaadin-text-area
          class="w-full"
          label=${this.t('custom_header')}
          helper-text=${this.t('custom_header_helper_text')}
          .value=${json.custom_script_values.header}
          ?disabled=${this.disabledSelector.matches('header', true)}
          ?readonly=${this.readonlySelector.matches('header', true)}
          @input=${(evt: CustomEvent) => {
            const target = evt.currentTarget as TextAreaElement;
            const newConfig: TemplateConfigJSON['custom_script_values'] = {
              ...json.custom_script_values,
              header: target.value,
            };

            this.edit({ json: JSON.stringify({ ...json, custom_script_values: newConfig }) });
          }}
        >
        </vaadin-text-area>

        ${this.renderTemplateOrSlot('header:after')}
      </div>
    `;
  }

  private __renderFooter(json: TemplateConfigJSON) {
    return html`
      <div>
        ${this.renderTemplateOrSlot('footer:before')}

        <vaadin-text-area
          class="w-full"
          label=${this.t('custom_footer')}
          helper-text=${this.t('custom_footer_helper_text')}
          .value=${json.custom_script_values.footer}
          ?disabled=${this.disabledSelector.matches('footer', true)}
          ?readonly=${this.readonlySelector.matches('footer', true)}
          @input=${(evt: CustomEvent) => {
            const target = evt.currentTarget as TextAreaElement;
            const newConfig: TemplateConfigJSON['custom_script_values'] = {
              ...json.custom_script_values,
              footer: target.value,
            };

            this.edit({ json: JSON.stringify({ ...json, custom_script_values: newConfig }) });
          }}
        >
        </vaadin-text-area>

        ${this.renderTemplateOrSlot('footer:after')}
      </div>
    `;
  }
}
