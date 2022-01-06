import * as logos from '../PaymentMethodCard/logos';

import { CheckboxChangeEvent, ChoiceChangeEvent } from '../../private/events';
import { Data, TemplateConfigJSON, Templates } from './types';
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

/**
 * Form element for creating or editing template configs (`fx:template_config`).
 *
 * @slot cart-type:before
 * @slot cart-type:after
 *
 * @slot foxycomplete:before
 * @slot foxycomplete:after
 *
 * @slot locations:before
 * @slot locations:after
 *
 * @slot hidden-fields:before
 * @slot hidden-fields:after
 *
 * @slot cards:before
 * @slot cards:after
 *
 * @slot checkout-type:before
 * @slot checkout-type:after
 *
 * @slot consent:before
 * @slot consent:after
 *
 * @slot fields:before
 * @slot fields:after
 *
 * @slot google-analytics:before
 * @slot google-analytics:after
 *
 * @slot segment-io:before
 * @slot segment-io:after
 *
 * @slot troubleshooting:before
 * @slot troubleshooting:after
 *
 * @slot custom-config:before
 * @slot custom-config:after
 *
 * @slot header:before
 * @slot header:after
 *
 * @slot custom-fields:before
 * @slot custom-fields:after
 *
 * @slot footer:before
 * @slot footer:after
 *
 * @element foxy-template-config-form
 * @since 1.14.0
 */
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

  templates: Templates = {};

  /** URI of the `fx:countries` hAPI resource. */
  countries = '';

  /** URI of the `fx:regions` hAPI resource. */
  regions = '';

  private __addHiddenFieldInputValue = '';

  render(): TemplateResult {
    const hidden = this.hiddenSelector;
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
          ${hidden.matches('cards', true) ? '' : this.__renderCards(json)}
          ${hidden.matches('checkout-type', true) ? '' : this.__renderCheckoutType(json)}
          ${hidden.matches('consent', true) ? '' : this.__renderConsent(json)}
          ${hidden.matches('fields', true) ? '' : this.__renderFields(json)}
          ${hidden.matches('google-analytics', true) ? '' : this.__renderGoogleAnalytics(json)}
          ${hidden.matches('segment-io', true) ? '' : this.__renderSegmentIo(json)}
          ${hidden.matches('troubleshooting', true) ? '' : this.__renderTroubleshooting(json)}
          ${hidden.matches('custom-config', true) ? '' : this.__renderCustomConfig(json)}
          ${hidden.matches('header', true) ? '' : this.__renderHeader(json)}
          ${hidden.matches('custom-fields', true) ? '' : this.__renderCustomFields(json)}
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
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('cart-type', true);

    return html`
      <div data-testid="cart-type">
        ${this.renderTemplateOrSlot('cart-type:before')}

        <x-group frame>
          <foxy-i18n
            class=${isDisabled ? 'text-disabled' : ''}
            slot="header"
            lang=${lang}
            key="cart_type"
            ns=${ns}
          >
          </foxy-i18n>

          <x-choice
            data-testid="cart-type-choice"
            .value=${json.cart_type}
            .items=${items}
            ?disabled=${isDisabled}
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
                    class="text-xs ${isDisabled ? 'text-disabled' : 'text-secondary'}"
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
          <foxy-i18n
            class=${isDisabled ? 'text-disabled' : ''}
            slot="header"
            lang=${lang}
            key="foxycomplete"
            ns=${ns}
          >
          </foxy-i18n>

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
                    class="text-xs ${isDisabled ? 'text-disabled' : 'text-secondary'}"
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
    const isDisabled = this.disabledSelector.matches('locations', true);
    const isReadonly = this.readonlySelector.matches('locations', true);

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
        <foxy-i18n
          class=${isDisabled ? 'text-disabled' : ''}
          slot="header"
          lang=${lang}
          key="location_plural"
          ns=${ns}
        >
        </foxy-i18n>

        <div class="grid sm-grid-cols-2 bg-contrast-10" style="gap: 1px">
          <x-group class="bg-base pt-m">
            <foxy-i18n
              class=${isDisabled ? 'text-disabled' : 'text-tertiary'}
              slot="header"
              lang=${lang}
              key="shipping"
              ns=${ns}
            >
            </foxy-i18n>

            <x-choice
              .items=${['allow', 'block']}
              .value=${shippingChoice}
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
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
                ?disabled=${isDisabled}
                ?readonly=${isReadonly}
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
            <foxy-i18n
              class=${isDisabled ? 'text-disabled' : 'text-tertiary'}
              slot="header"
              lang=${lang}
              key="billing"
              ns=${ns}
            >
            </foxy-i18n>

            <x-choice
              .items=${['allow', 'block', 'copy']}
              .value=${billingChoice}
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
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
                ?disabled=${isDisabled}
                ?readonly=${isReadonly}
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
    const isDisabled = this.disabledSelector.matches('hidden-fields', true);
    const isReadonly = this.readonlySelector.matches('hidden-fields', true);

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
          <foxy-i18n
            class=${isDisabled ? 'text-disabled' : ''}
            slot="header"
            lang=${lang}
            key="hidden_fields"
            ns=${ns}
          >
          </foxy-i18n>

          <div class="divide-y divide-contrast-10">
            ${fields.map(field => {
              return html`
                <div
                  class=${classMap({
                    'h-m ml-m pr-xs flex items-center justify-between': true,
                    'text-secondary': isReadonly,
                    'text-disabled': isDisabled,
                  })}
                >
                  ${suggestions.includes(field)
                    ? html`<foxy-i18n lang=${lang} key=${field} ns=${ns}></foxy-i18n>`
                    : html`<span>${field}</span>`}

                  <button
                    class=${classMap({
                      'w-xs h-xs rounded-full transition-colors': true,
                      'hover-bg-error-10 hover-text-error': !isDisabled,
                      'focus-outline-none focus-ring-2 ring-inset ring-error-50': !isDisabled,
                      'cursor-default': isDisabled,
                      'flex': !isReadonly,
                      'hidden': isReadonly,
                    })}
                    ?disabled=${isDisabled}
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
                    <iron-icon icon="icons:close" class="icon-inline text-m m-auto"></iron-icon>
                  </button>
                </div>
              `;
            })}
          </div>

          <div
            style="border-radius: ${inputRadius.join(' ')}"
            class=${classMap({
              'h-m flex items-center ring-inset ring-primary-50 focus-within-ring-2': true,
              'border-t border-contrast-10': fields.length > 0,
              'flex': !isReadonly,
              'hidden': isReadonly,
            })}
          >
            <input
              placeholder=${this.t('add_field')}
              class="w-full bg-transparent appearance-none h-m px-m focus-outline-none"
              list="hidden-fields-list"
              .value=${live(this.__addHiddenFieldInputValue)}
              ?disabled=${isDisabled}
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

  private __renderCards(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const isDisabled = this.disabledSelector.matches('cards', true);
    const isReadonly = this.readonlySelector.matches('cards', true);
    const config = json.supported_payment_cards as string[];

    let skipForSaved: boolean;
    let skipForSSO: boolean;

    if (json.csc_requirements === 'all_cards') {
      skipForSaved = false;
      skipForSSO = false;
    } else if (json.csc_requirements === 'sso_only') {
      skipForSaved = true;
      skipForSSO = false;
    } else {
      skipForSaved = true;
      skipForSSO = true;
    }

    const typeToName: Record<string, string> = {
      amex: 'American Express',
      diners: 'Diners Club',
      discover: 'Discover',
      jcb: 'JCB',
      maestro: 'Maestro',
      mastercard: 'Mastercard',
      unionpay: 'UnionPay',
      visa: 'Visa',
    };

    return html`
      <div>
        ${this.renderTemplateOrSlot('cards:before')}

        <div class="space-y-xs">
          <x-group frame>
            <foxy-i18n
              class=${isDisabled ? 'text-disabled' : ''}
              slot="header"
              lang=${lang}
              key="supported_cards"
              ns=${ns}
            >
            </foxy-i18n>

            <div class="flex flex-wrap m-xs p-s">
              ${Object.entries(logos).map(([type, logo]) => {
                if (!typeToName[type]) return;
                const isChecked = config.includes(type);

                return html`
                  <div
                    class=${classMap({
                      'm-xs rounded': true,
                      'opacity-50 cursor-default': isDisabled,
                      'cursor-pointer ring-primary-50 focus-within-ring-2': !isDisabled,
                    })}
                  >
                    <label
                      class=${classMap({
                        'overflow-hidden transition-colors flex rounded border': true,
                        'border-primary bg-primary-10 text-primary': isChecked && !isReadonly,
                        'border-contrast bg-contrast-5 text-secondary': isChecked && isReadonly,
                        'hover-text-body': isChecked && !isDisabled && !isReadonly,
                        'border-contrast-10': !isChecked,
                        'hover-border-primary': !isChecked && !isDisabled && !isReadonly,
                        'hover-text-primary': !isChecked && !isDisabled && !isReadonly,
                      })}
                    >
                      <div class="h-s">${logo}</div>

                      <div class="text-s font-medium mx-s my-auto leading-none">
                        ${typeToName[type]}
                      </div>

                      <input
                        type="checkbox"
                        class="sr-only"
                        ?disabled=${isDisabled}
                        ?checked=${isChecked}
                        @change=${(evt: Event) => {
                          if (isReadonly) return evt.preventDefault();
                          evt.stopPropagation();

                          if (isChecked) {
                            config.splice(config.indexOf(type), 1);
                          } else {
                            config.push(type);
                          }

                          this.edit({ json: JSON.stringify(json) });
                        }}
                      />
                    </label>
                  </div>
                `;
              })}
            </div>

            <div class="flex flex-wrap p-s border-t border-contrast-10">
              <x-checkbox
                class="m-s"
                ?disabled=${isDisabled || json.csc_requirements === 'new_cards_only'}
                ?readonly=${isReadonly}
                ?checked=${skipForSaved}
                @change=${(evt: CheckboxChangeEvent) => {
                  json.csc_requirements = evt.detail ? 'sso_only' : 'all_cards';
                  this.edit({ json: JSON.stringify(json) });
                }}
              >
                <foxy-i18n class="leading-s block" lang=${lang} key="skip_csc_for_saved" ns=${ns}>
                </foxy-i18n>
              </x-checkbox>

              <x-checkbox
                class="m-s"
                ?disabled=${isDisabled}
                ?readonly=${isReadonly}
                ?checked=${skipForSSO}
                @change=${(evt: CheckboxChangeEvent) => {
                  json.csc_requirements = evt.detail
                    ? 'new_cards_only'
                    : skipForSaved
                    ? 'sso_only'
                    : 'all_cards';

                  this.edit({ json: JSON.stringify(json) });
                }}
              >
                <foxy-i18n class="leading-s block" lang=${lang} key="skip_csc_for_sso" ns=${ns}>
                </foxy-i18n>
              </x-checkbox>
            </div>
          </x-group>

          <foxy-i18n
            class="text-xs leading-s block ${isDisabled ? 'text-disabled' : 'text-secondary'}"
            lang=${lang}
            key="supported_cards_disclaimer"
            ns=${ns}
          >
          </foxy-i18n>
        </div>

        ${this.renderTemplateOrSlot('cards:after')}
      </div>
    `;
  }

  private __renderCheckoutType(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('checkout-type', true);
    const isReadonly = this.readonlySelector.matches('checkout-type', true);

    return html`
      <div data-testid="checkout-type">
        ${this.renderTemplateOrSlot('checkout-type:before')}

        <div class="space-y-xs">
          <x-group frame>
            <foxy-i18n
              class=${isDisabled ? 'text-disabled' : ''}
              slot="header"
              lang=${lang}
              key="checkout_type"
              ns=${ns}
            >
            </foxy-i18n>

            <x-choice
              data-testid="checkout-type-choice"
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
              .items=${['default_account', 'default_guest', 'guest_only', 'account_only']}
              .value=${json.checkout_type}
              .getText=${(item: string) => this.t(`checkout_type_${item}`)}
              @change=${(evt: ChoiceChangeEvent) => {
                json.checkout_type = evt.detail as TemplateConfigJSON['checkout_type'];
                this.edit({ json: JSON.stringify(json) });
              }}
            >
            </x-choice>
          </x-group>

          <foxy-i18n
            class="text-xs leading-s block ${isDisabled ? 'text-disabled' : 'text-secondary'}"
            lang=${lang}
            key="checkout_type_helper_text"
            ns=${ns}
          >
          </foxy-i18n>
        </div>

        ${this.renderTemplateOrSlot('checkout-type:after')}
      </div>
    `;
  }

  private __renderConsent(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const tosConfig = json.tos_checkbox_settings;
    const mailConfig = json.newsletter_subscribe;
    const sdtaConfig = json.eu_secure_data_transfer_consent;
    const isDisabled = this.disabledSelector.matches('consent', true);
    const isReadonly = this.readonlySelector.matches('consent', true);
    const dividerStyle = 'margin-left: calc(1.125rem + (var(--lumo-space-m) * 2))';

    return html`
      <div>
        ${this.renderTemplateOrSlot('consent:before')}

        <x-group frame>
          <foxy-i18n
            class=${isDisabled ? 'text-disabled' : ''}
            slot="header"
            lang=${lang}
            key="consent"
            ns=${ns}
          >
          </foxy-i18n>

          <x-checkbox
            ?disabled=${isDisabled}
            ?readonly=${isReadonly}
            ?checked=${tosConfig.usage === 'required' || tosConfig.usage === 'optional'}
            class="m-m"
            @change=${(evt: CheckboxChangeEvent) => {
              tosConfig.initial_state = evt.detail ? tosConfig.initial_state : 'unchecked';
              tosConfig.is_hidden = false;
              tosConfig.usage = evt.detail ? 'required' : 'none';
              tosConfig.url = evt.detail ? tosConfig.url : '';

              this.edit({ json: JSON.stringify(json) });
            }}
          >
            <div class="flex flex-col">
              <foxy-i18n lang=${lang} key="display_tos_link" ns=${ns}></foxy-i18n>
              <foxy-i18n
                class="text-xs leading-s ${isDisabled ? 'text-disabled' : 'text-secondary'}"
                lang=${lang}
                key="display_tos_link_explainer"
                ns=${ns}
              >
              </foxy-i18n>
            </div>

            <div slot="content" ?hidden=${tosConfig.usage === 'none'}>
              <vaadin-text-field
                label=${this.t('location_url')}
                class="w-full mt-m"
                placeholder="https://example.com/path/to/tos"
                clear-button-visible
                ?disabled=${isDisabled}
                ?readonly=${isReadonly}
                .value=${tosConfig.url}
                @input=${(evt: CustomEvent) => {
                  tosConfig.url = (evt.currentTarget as TextFieldElement).value;
                  this.edit({ json: JSON.stringify(json) });
                }}
              >
              </vaadin-text-field>

              <div class="flex flex-wrap -mx-s -mb-s mt-s">
                <x-checkbox
                  class="m-s"
                  ?disabled=${isDisabled}
                  ?checked=${tosConfig.usage === 'required'}
                  @change=${(evt: CheckboxChangeEvent) => {
                    tosConfig.usage = evt.detail ? 'required' : 'optional';
                    this.edit({ json: JSON.stringify(json) });
                  }}
                >
                  <foxy-i18n class="leading-s block" lang=${lang} key="require_consent" ns=${ns}>
                  </foxy-i18n>
                </x-checkbox>

                <x-checkbox
                  class="m-s"
                  ?disabled=${isDisabled}
                  ?checked=${tosConfig.initial_state === 'checked'}
                  @change=${(evt: CheckboxChangeEvent) => {
                    tosConfig.initial_state = evt.detail ? 'checked' : 'unchecked';
                    this.edit({ json: JSON.stringify(json) });
                  }}
                >
                  <foxy-i18n class="leading-s block" lang=${lang} key="checked_by_default" ns=${ns}>
                  </foxy-i18n>
                </x-checkbox>
              </div>
            </div>
          </x-checkbox>

          <div style=${dividerStyle} class="border-b border-contrast-10"></div>

          <x-checkbox
            ?disabled=${isDisabled}
            ?readonly=${isReadonly}
            ?checked=${mailConfig.usage === 'required'}
            class="m-m"
            @change=${(evt: CheckboxChangeEvent) => {
              mailConfig.usage = evt.detail ? 'required' : 'none';
              this.edit({ json: JSON.stringify(json) });
            }}
          >
            <div class="flex flex-col">
              <foxy-i18n lang=${lang} key="newsletter_subscribe" ns=${ns}></foxy-i18n>
              <foxy-i18n
                class="text-xs leading-s ${isDisabled ? 'text-disabled' : 'text-secondary'}"
                lang=${lang}
                key="newsletter_subscribe_explainer"
                ns=${ns}
              >
              </foxy-i18n>
            </div>
          </x-checkbox>

          <div style=${dividerStyle} class="border-b border-contrast-10"></div>

          <x-checkbox
            ?disabled=${isDisabled}
            ?readonly=${isReadonly}
            ?checked=${sdtaConfig.usage === 'required'}
            class="m-m"
            @change=${(evt: CheckboxChangeEvent) => {
              sdtaConfig.usage = evt.detail ? 'required' : 'none';
              this.edit({ json: JSON.stringify(json) });
            }}
          >
            <div class="flex flex-col">
              <foxy-i18n lang=${lang} key="display_sdta" ns=${ns}></foxy-i18n>
              <foxy-i18n
                class="text-xs leading-s ${isDisabled ? 'text-disabled' : 'text-secondary'}"
                lang=${lang}
                key="display_sdta_explainer"
                ns=${ns}
              >
              </foxy-i18n>
            </div>
          </x-checkbox>
        </x-group>

        ${this.renderTemplateOrSlot('consent:before')}
      </div>
    `;
  }

  private __renderFields(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const isDisabled = this.disabledSelector.matches('fields', true);
    const isReadonly = this.readonlySelector.matches('fields', true);
    const config = json.custom_checkout_field_requirements;
    const options = {
      cart_controls: ['enabled', 'disabled'],
      coupon_entry: ['enabled', 'disabled'],
      billing_first_name: ['default', 'optional', 'required', 'hidden'],
      billing_last_name: ['default', 'optional', 'required', 'hidden'],
      billing_company: ['default', 'optional', 'required', 'hidden'],
      billing_tax_id: ['default', 'optional', 'required', 'hidden'],
      billing_phone: ['default', 'optional', 'required', 'hidden'],
      billing_address1: ['default', 'optional', 'required', 'hidden'],
      billing_address2: ['default', 'optional', 'required', 'hidden'],
      billing_city: ['default', 'optional', 'required', 'hidden'],
      billing_region: ['default', 'optional', 'required', 'hidden'],
      billing_postal_code: ['default', 'optional', 'required', 'hidden'],
      billing_country: ['default', 'optional', 'required', 'hidden'],
    };

    return html`
      <div>
        ${this.renderTemplateOrSlot('fields:before')}

        <x-group frame>
          <foxy-i18n
            class=${isDisabled ? 'text-disabled' : ''}
            slot="header"
            lang=${lang}
            key="field_plural"
            ns=${ns}
          >
          </foxy-i18n>

          <div class="bg-contrast-10 grid grid-cols-1 md-grid-cols-2" style="gap: 1px">
            ${Object.entries(options).map(([property, values]) => {
              return html`
                <label
                  class=${classMap({
                    'flex items-center pl-m bg-base': true,
                    'text-secondary': isReadonly,
                    'text-disabled': isDisabled,
                  })}
                >
                  <foxy-i18n
                    class="flex-1"
                    lang=${lang}
                    key=${property.replace('billing_', '')}
                    ns=${ns}
                  >
                  </foxy-i18n>

                  <div
                    class=${classMap({
                      'flex items-center text-right font-medium h-s px-s m-xs': isReadonly,
                      'hidden': !isReadonly,
                    })}
                  >
                    ${this.t(
                      values.find(
                        value => (config as Record<string, string>)[property] === value
                      ) as string
                    )}
                  </div>

                  <div
                    class=${classMap({
                      'px-s m-xs flex items-center rounded leading-none': true,
                      'ring-primary-50 ring-inset focus-within-ring-2': !isDisabled,
                      'hover-text-primary': !isDisabled,
                      'cursor-pointer': !isDisabled,
                      'cursor-default': isDisabled,
                      'flex': !isReadonly,
                      'hidden': isReadonly,
                    })}
                  >
                    <select
                      class=${classMap({
                        'h-s mr-xs text-right appearance-none bg-transparent font-medium': true,
                        'focus-outline-none cursor-pointer': !isDisabled,
                        'cursor-default': isDisabled,
                      })}
                      ?disabled=${isDisabled}
                      ?readonly=${isReadonly}
                      @change=${(evt: Event) => {
                        const select = evt.currentTarget as HTMLSelectElement;
                        const value = select.options[select.options.selectedIndex].value;
                        (config as Record<string, string>)[property] = value;
                        this.edit({ json: JSON.stringify(json) });
                      }}
                    >
                      ${values.map(value => {
                        return html`
                          <option
                            value=${value}
                            ?selected=${(config as Record<string, string>)[property] === value}
                          >
                            ${this.t(value)}
                          </option>
                        `;
                      })}
                    </select>

                    <iron-icon
                      class="pointer-events-none icon-inline text-xl"
                      icon="icons:expand-more"
                    >
                    </iron-icon>
                  </div>
                </label>
              `;
            })}

            <div class="bg-base hidden md-block"></div>
          </div>
        </x-group>

        ${this.renderTemplateOrSlot('fields:after')}
      </div>
    `;
  }

  private __renderGoogleAnalytics(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const config = json.analytics_config;
    const sioConfig = config.segment_io;
    const gaConfig = config.google_analytics;
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('google-analytics', true);
    const isReadonly = this.readonlySelector.matches('google-analytics', true);

    return html`
      <div data-testid="google-analytics">
        ${this.renderTemplateOrSlot('google-analytics:before')}

        <x-group frame>
          <span class=${isDisabled ? 'text-disabled' : ''} slot="header">Google Analytics</span>

          <div class="p-m space-y-m">
            <vaadin-text-field
              data-testid="google-analytics-field"
              class="w-full"
              label=${this.t('ga_account_id')}
              placeholder="UA-1234567-1"
              helper-text=${this.t('ga_account_id_explainer')}
              .value=${live(gaConfig.account_id)}
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
              clear-button-visible
              @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
              @input=${(evt: InputEvent) => {
                gaConfig.account_id = (evt.currentTarget as TextFieldElement).value;
                gaConfig.usage = gaConfig.account_id ? 'required' : 'none';
                config.usage = gaConfig.account_id || sioConfig.account_id ? 'required' : 'none';
                this.edit({ json: JSON.stringify(json) });
              }}
            >
            </vaadin-text-field>

            <x-checkbox
              data-testid="google-analytics-check"
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
              ?checked=${gaConfig.include_on_site}
              @change=${(evt: CheckboxChangeEvent) => {
                gaConfig.include_on_site = evt.detail;
                this.edit({ json: JSON.stringify(json) });
              }}
            >
              <div class="flex flex-col">
                <foxy-i18n lang=${lang} key="ga_include_on_site" ns=${ns}></foxy-i18n>
                <foxy-i18n
                  class="text-xs leading-s ${isDisabled ? 'text-disabled' : 'text-secondary'}"
                  lang=${lang}
                  key="ga_include_on_site_explainer"
                  ns=${ns}
                >
                </foxy-i18n>
              </div>
            </x-checkbox>
          </div>
        </x-group>

        ${this.renderTemplateOrSlot('google-analytics:after')}
      </div>
    `;
  }

  private __renderSegmentIo(json: TemplateConfigJSON) {
    const config = json.analytics_config;
    const sioConfig = config.segment_io;
    const gaConfig = config.google_analytics;
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('segment-io', true);
    const isReadonly = this.readonlySelector.matches('segment-io', true);

    return html`
      <div data-testid="segment-io">
        ${this.renderTemplateOrSlot('segment-io:before')}

        <x-group frame>
          <span class=${isDisabled ? 'text-disabled' : ''} slot="header">Segment.io</span>

          <div class="p-m">
            <vaadin-text-field
              data-testid="segment-io-field"
              class="w-full"
              label=${this.t('sio_account_id')}
              placeholder="MY-WRITE-KEY"
              helper-text=${this.t('sio_account_id_explainer')}
              .value=${live(sioConfig.account_id)}
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
              clear-button-visible
              @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
              @input=${(evt: InputEvent) => {
                sioConfig.account_id = (evt.currentTarget as TextFieldElement).value;
                sioConfig.usage = sioConfig.account_id ? 'required' : 'none';
                config.usage = gaConfig.account_id || sioConfig.account_id ? 'required' : 'none';
                this.edit({ json: JSON.stringify(json) });
              }}
            >
            </vaadin-text-field>
          </div>
        </x-group>

        ${this.renderTemplateOrSlot('segment-io:after')}
      </div>
    `;
  }

  private __renderTroubleshooting(json: TemplateConfigJSON) {
    const { lang, ns } = this;
    const config = json.debug;
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('troubleshooting', true);
    const isReadonly = this.readonlySelector.matches('troubleshooting', true);

    return html`
      <div data-testid="troubleshooting">
        ${this.renderTemplateOrSlot('troubleshooting:before')}

        <x-group frame>
          <foxy-i18n
            class=${isDisabled ? 'text-disabled' : ''}
            slot="header"
            lang=${lang}
            key="troubleshooting"
            ns=${ns}
          >
          </foxy-i18n>

          <div class="p-m space-y-m">
            <x-checkbox
              data-testid="troubleshooting-check"
              ?disabled=${isDisabled}
              ?readonly=${isReadonly}
              ?checked=${config.usage === 'required'}
              @change=${(evt: CheckboxChangeEvent) => {
                config.usage = evt.detail ? 'required' : 'none';
                this.edit({ json: JSON.stringify(json) });
              }}
            >
              <div class="flex flex-col">
                <foxy-i18n lang=${lang} key="troubleshooting_debug" ns=${ns}></foxy-i18n>
                <foxy-i18n
                  class="text-xs leading-s ${isDisabled ? 'text-disabled' : 'text-secondary'}"
                  lang=${lang}
                  key="troubleshooting_debug_explainer"
                  ns=${ns}
                >
                </foxy-i18n>
              </div>
            </x-checkbox>
          </div>
        </x-group>

        ${this.renderTemplateOrSlot('troubleshooting:after')}
      </div>
    `;
  }

  private __renderCustomConfig(json: TemplateConfigJSON) {
    return html`
      <div data-testid="custom-config">
        ${this.renderTemplateOrSlot('custom-config:before')}

        <vaadin-text-area
          data-testid="custom-config-field"
          class="w-full"
          label=${this.t('custom_config')}
          placeholder='{ "key": "value" }'
          helper-text=${this.t('custom_config_helper_text')}
          .value=${json.custom_config ? JSON.stringify(json.custom_config, null, 2) : ''}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('custom-config', true)}
          ?readonly=${this.readonlySelector.matches('custom-config', true)}
          @input=${(evt: CustomEvent) => {
            const input = evt.currentTarget as TextAreaElement;

            try {
              json.custom_config = input.value ? JSON.parse(input.value) : '';
              this.edit({ json: JSON.stringify(json) });
              input.invalid = false;
            } catch {
              input.invalid = true;
            }
          }}
        >
        </vaadin-text-area>

        ${this.renderTemplateOrSlot('custom-config:after')}
      </div>
    `;
  }

  private __renderHeader(json: TemplateConfigJSON) {
    return html`
      <div data-testid="header">
        ${this.renderTemplateOrSlot('header:before')}

        <vaadin-text-area
          data-testid="header-field"
          class="w-full"
          label=${this.t('custom_header')}
          helper-text=${this.t('custom_header_helper_text')}
          .value=${json.custom_script_values.header}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('header', true)}
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

  private __renderCustomFields(json: TemplateConfigJSON) {
    return html`
      <div data-testid="custom-fields">
        ${this.renderTemplateOrSlot('custom-fields:before')}

        <vaadin-text-area
          data-testid="custom-fields-field"
          class="w-full"
          label=${this.t('custom_fields')}
          helper-text=${this.t('custom_fields_helper_text')}
          .value=${json.custom_script_values.checkout_fields}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('custom-fields', true)}
          ?readonly=${this.readonlySelector.matches('custom-fields', true)}
          @input=${(evt: CustomEvent) => {
            const newValue = (evt.currentTarget as TextAreaElement).value;
            json.custom_script_values.checkout_fields = newValue;
            this.edit({ json: JSON.stringify(json) });
          }}
        >
        </vaadin-text-area>

        ${this.renderTemplateOrSlot('custom-fields:after')}
      </div>
    `;
  }

  private __renderFooter(json: TemplateConfigJSON) {
    return html`
      <div data-testid="footer">
        ${this.renderTemplateOrSlot('footer:before')}

        <vaadin-text-area
          data-testid="footer-field"
          class="w-full"
          label=${this.t('custom_footer')}
          helper-text=${this.t('custom_footer_helper_text')}
          .value=${json.custom_script_values.footer}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('footer', true)}
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
