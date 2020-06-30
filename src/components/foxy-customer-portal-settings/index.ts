import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-text-field/vaadin-number-field';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-lumo-styles/icons';
import '@vaadin/vaadin-button';

import '../foxy-code.js';

import { html, query } from 'lit-element';
import { onEnter } from './utils/on-enter';
import { define } from '../../utils/define';
import { Stateful } from '../../mixins/stateful';
import * as UI from '../../layout/index';
import { createMachine } from './machine';
import { NdmRule } from './partials/ndm-rule';

import {
  FoxyCustomerPortalSettingsContext,
  FoxyCustomerPortalSettingsEvent,
  FoxyCustomerPortalSettingsSchema,
} from './types.js';

class FoxyCustomerPortalSettings extends Stateful<
  FoxyCustomerPortalSettingsContext,
  FoxyCustomerPortalSettingsSchema,
  FoxyCustomerPortalSettingsEvent
> {
  @query('[name=fModOptionValue]')
  private __fModOptionValue!: HTMLInputElement | null;

  @query('[name=fModOptionUnits]')
  private __fModOptionUnits!: HTMLInputElement | null;

  @query('[name=sessionValue]')
  private __sessionValue!: HTMLInputElement;

  @query('[name=sessionUnits]')
  private __sessionUnits!: HTMLInputElement;

  @query('[name=newOrigin]')
  private __newOrigin!: HTMLInputElement;

  constructor() {
    super(createMachine, 'customer-portal-settings');
  }

  get resource() {
    return super.resource;
  }

  set resource(value) {
    super.resource = value;
    this.__setSessionLifespan();
  }

  firstUpdated() {
    if (this.__fModOptionValue) this.__fModOptionValue.value = '1';
    if (this.__fModOptionUnits) this.__fModOptionUnits.value = 'm';
    this.__setSessionLifespan();
  }

  render() {
    const fMod = this.resource?.subscriptions.allowFrequencyModification;
    const ndMod = this.resource?.subscriptions.allowNextDateModification;
    const fModValues = typeof fMod === 'boolean' ? [] : fMod?.values ?? [];
    const fModQuery = typeof fMod === 'boolean' ? '' : fMod?.jsonataQuery;
    const modified = this._service.state.matches('idle.modified');
    const busy = this._service.state.matches('busy');

    return UI.Article({
      onSave: () => this.send({ type: 'save' }),
      modified: modified,
      busy: busy,
      title: this._t('title'),
      subtitle: this._t('subtitle'),
      content: [
        UI.Section(
          UI.Header(
            this._t('quickstart.title'),
            this._t('quickstart.subtitle')
          ),

          html`
            <div>
              <foxy-code>
                <template>
                  <script
                    type="module"
                    src="https://static.www.foxycart.com/beta/s/customer-portal/v0.9/dist/lumo/foxy/foxy.esm.js"
                  ></script>
                  <script
                    nomodule
                    src="https://static.www.foxycart.com/beta/s/customer-portal/v0.9/dist/lumo/foxy.js"
                  ></script>
                  <foxy-customer-portal
                    link="https://my-store.tld/s/customer"
                  ></foxy-customer-portal>
                </template>
              </foxy-code>
            </div>
          `
        ),

        UI.Section(
          UI.Header(this._t('origins.title'), this._t('origins.subtitle')),

          UI.Frame(
            UI.List({
              items: this.resource?.allowedOrigins,
              onRemove: index => this.send({ type: 'removeOrigin', index }),
            }),

            html`
              <div
                class="p-m flex flex-col space-y-s sm:space-y-0 sm:flex-row sm:space-x-s"
              >
                <vaadin-text-field
                  name="newOrigin"
                  pattern="https?://(w*.?)*(:d*)?"
                  placeholder="https://foxy.io"
                  error-message=${this._t('origins.invalid') ?? ''}
                  .disabled=${busy}
                  @keypress=${onEnter(() => this.__addOrigin())}
                ></vaadin-text-field>

                <vaadin-button .disabled=${busy} @click=${this.__addOrigin}>
                  ${this._t('origins.add')}
                  <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
                </vaadin-button>
              </div>
            `
          )
        ),

        UI.Checkbox({
          value: Boolean(fMod),
          disabled: busy,
          onChange: v => this.send({ type: v ? 'enableFMod' : 'disableFMod' }),
          content: [
            UI.Header(this._t('fmod.title'), this._t('fmod.subtitle')),

            UI.If(Boolean(fMod), () =>
              UI.Section(
                UI.Section(
                  UI.Subheader(this._t('fmod.match')),

                  UI.Frame(
                    UI.Choice({
                      disabled: busy,
                      value: fModQuery === '*' ? 'all' : 'some',
                      items: [
                        {
                          text: this._t('fmod.all'),
                          value: 'all',
                          content: () => [],
                          onToggle: () => this.__resetFModFilter(),
                        },
                        {
                          text: this._t('fmod.some'),
                          value: 'some',
                          onToggle: () => this.__initFModFilter(),
                          content: () =>
                            UI.Group(
                              UI.Hint(this._t('fmod.hint')),
                              html`<vaadin-text-field
                                class="w-full"
                                .disabled=${busy}
                                .value=${fModQuery}
                                @input=${this.__setFModFilter}
                              ></vaadin-text-field>`
                            ),
                        },
                      ],
                    })
                  )
                ),

                UI.Section(
                  UI.Subheader(this._t('fmod.match')),

                  UI.Frame(
                    UI.List({
                      items: fModValues,
                      getText: value => {
                        const count = parseInt(
                          value.substring(0, value.length - 1)
                        );
                        const units = this._t(value[value.length - 1], {
                          count,
                        });
                        return this._t('duration', { count, units });
                      },
                      onRemove: index =>
                        this.send({ type: 'removeFModOption', index }),
                    }),

                    html`
                      <div
                        class="p-m flex flex-col space-y-s sm:items-center sm:space-y-0 sm:flex-row sm:space-x-s"
                      >
                        <vaadin-number-field
                          class="w-full sm:w-auto"
                          name="fModOptionValue"
                          min="1"
                          has-controls
                          .disabled=${busy}
                        ></vaadin-number-field>

                        ${UI.Dropdown({
                          name: 'fModOptionUnits',
                          disabled: busy,
                          items: [
                            { text: this._t('y_plural'), value: 'y' },
                            { text: this._t('m_plural'), value: 'm' },
                            { text: this._t('w_plural'), value: 'w' },
                            { text: this._t('d_plural'), value: 'd' },
                          ],
                        })}

                        <vaadin-button
                          .disabled=${busy}
                          @click=${this.__addFModOption}
                        >
                          ${this._t('fmod.add')}
                          <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
                        </vaadin-button>
                      </div>
                    `
                  )
                )
              )
            ),
          ],
        }),

        UI.Checkbox({
          value: Boolean(ndMod),
          disabled: busy,
          onChange: v =>
            this.send({ type: v ? 'enableNdMod' : 'disableNdMod' }),
          content: [
            UI.Header(this._t('ndmod.title'), this._t('ndmod.subtitle')),

            UI.Section(
              UI.If(Boolean(ndMod), () => {
                if (typeof ndMod === 'undefined') return [];
                if (typeof ndMod === 'boolean') return [];

                return ndMod.map((rule, index) =>
                  NdmRule({
                    onChange: value =>
                      this.send({ type: 'changeNdMod', value, index }),
                    modified: modified,
                    disabled: busy,
                    locale: this.lang,
                    t: this._t,
                    rule,
                  })
                );
              }),

              UI.If(
                Boolean(ndMod),
                () => html`
                  <vaadin-button
                    .disabled=${busy}
                    @click=${this.__addNdModRule}
                  >
                    ${this._t('ndmod.add')}
                    <iron-icon icon="lumo:plus"></iron-icon>
                  </vaadin-button>
                `
              )
            ),
          ],
        }),

        UI.Section(
          UI.Header(this._t('jwt.title'), this._t('jwt.subtitle')),

          html`
            <vaadin-password-field
              class="w-full mb-m"
              .value=${this.resource?.jwtSharedSecret ?? ''}
              .disabled=${busy}
              @input=${this.__setSessionSecret}
            ></vaadin-password-field>
          `
        ),

        UI.Section(
          UI.Header(this._t('session.title'), this._t('session.subtitle')),

          html`
            <div
              class="flex flex-col sm:flex-row space-y-s sm:space-y-0 sm:space-x-s sm:items-center"
            >
              <vaadin-number-field
                name="sessionValue"
                class="w-full sm:w-auto"
                min="1"
                has-controls
                .disabled=${busy}
                @change=${this.__updateSessionLifespan}
              ></vaadin-number-field>
              ${UI.Dropdown({
                name: 'sessionUnits',
                disabled: busy,
                items: [
                  { text: this._t('minute_plural'), value: '1' },
                  { text: this._t('hour_plural'), value: '60' },
                  { text: this._t('d_plural'), value: '1440' },
                  { text: this._t('w_plural'), value: '10080' },
                ],
                onChange: () => this.__updateSessionLifespan(),
              })}
            </div>
          `
        ),
      ],
    });
  }

  private __setSessionLifespan() {
    const session = this.resource?.sessionLifespanInMinutes;
    const { __sessionUnits: sessionUnits, __sessionValue: sessionValue } = this;

    if (session && sessionUnits && sessionValue) {
      [10080, 1440, 60, 1].some(unit => {
        if (session % unit === 0) {
          sessionUnits.value = unit.toFixed(0);
          sessionValue.value = (session / unit).toFixed(0);
          return true;
        }
      });
    }
  }

  private __updateSessionLifespan() {
    const factor = parseInt(this.__sessionUnits.value);
    const value = parseInt(this.__sessionValue.value);

    this.send({
      type: 'changeSessionLifespan',
      value: factor * value,
    });
  }

  private __addOrigin() {
    if (!this.__newOrigin.checkValidity()) return;
    if (this.__newOrigin.value.length === 0) return;

    this.send({
      type: 'addOrigin',
      value: this.__newOrigin.value,
    });

    this.__newOrigin.value = '';
  }

  private __addFModOption() {
    if (!this.__fModOptionValue || !this.__fModOptionUnits) return;
    if (!this.__fModOptionValue.checkValidity()) return;

    this.send({
      type: 'addFModOption',
      value: `${this.__fModOptionValue.value}${this.__fModOptionUnits.value}`,
    });

    this.__fModOptionValue.value = '1';
    this.__fModOptionUnits.value = 'm';
  }

  private __resetFModFilter() {
    this.send({
      type: 'changeFModJsonata',
      value: '*',
    });
  }

  private __initFModFilter() {
    this.send({
      type: 'changeFModJsonata',
      value: '$contains(frequency, "w")',
    });
  }

  private __setFModFilter(evt: InputEvent) {
    this.send({
      type: 'changeFModJsonata',
      value: (evt.target as HTMLInputElement).value,
    });
  }

  private __addNdModRule() {
    const rules = this.resource?.subscriptions.allowNextDateModification;

    this.send({
      type: 'changeNdMod',
      value: { jsonataQuery: '*' },
      index: !rules || typeof rules === 'boolean' ? 0 : rules.length,
    });
  }

  private __setSessionSecret(evt: InputEvent) {
    const value = (evt.target as HTMLInputElement).value;
    this.send({ type: 'changeJwtSecret', value });
  }
}

define('foxy-customer-portal-settings', FoxyCustomerPortalSettings);

export { FoxyCustomerPortalSettings };
