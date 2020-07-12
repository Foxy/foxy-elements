import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import { html } from 'lit-html';
import { live } from 'lit-html/directives/live';
import { Stateful } from '../../../mixins/stateful';
import { OriginsList, OriginsListChangeEvent } from './private/origins-list';

import {
  FrequencyModification,
  FrequencyModificationChangeEvent,
} from './private/frequency-modification';

import {
  NextDateModification,
  NextDateModificationChangeEvent,
} from './private/next-date-modification';

import {
  CustomerPortalSettingsContext,
  CustomerPortalSettingsSchema,
  CustomerPortalSettingsEvent,
} from './types';

import { machine } from './machine';
import { Section, Page, Code } from '../../private/index';

export class CustomerPortalSettings extends Stateful<
  CustomerPortalSettingsContext,
  CustomerPortalSettingsSchema,
  CustomerPortalSettingsEvent
> {
  public static get scopedElements() {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-password-field': customElements.get('vaadin-password-field'),
      'x-frequency-modification': FrequencyModification,
      'x-next-date-modification': NextDateModification,
      'x-origins-list': OriginsList,
      'x-section': Section,
      'x-page': Page,
      'x-code': Code,
    };
  }

  private __cdnUrl = 'https://static.www.foxycart.com/beta/s/customer-portal';
  private __storeUrl = 'https://my-store.tld/s/customer';
  private __modernUrl = `${this.__cdnUrl}/v0.9/dist/lumo/foxy/foxy.esm.js`;
  private __legacyUrl = `${this.__cdnUrl}/v0.9/dist/lumo/foxy/foxy.js`;

  constructor() {
    super(() => machine, 'customer-portal-settings');
  }

  public render() {
    if (!this._isI18nReady) {
      return html`<x-page skeleton></x-page>`;
    }

    return html`
      <x-page .header=${this._i18n.t('title')} .subheader=${this._i18n.t('subtitle')}>
        <x-section
          .header=${this._i18n.t('quickstart.title').toString()}
          .subheader=${this._i18n.t('quickstart.subtitle').toString()}
        >
          <x-code>
            <template>
              <script type="module" src=${this.__modernUrl}></script>
              <script nomodule src=${this.__legacyUrl}></script>
              <foxy-customer-portal endpoint=${this.__storeUrl}></foxy-customer-portal>
            </template>
          </x-code>
        </x-section>

        <x-section
          .header=${this._i18n.t('origins.title').toString()}
          .subheader=${this._i18n.t('origins.subtitle').toString()}
        >
          <x-origins-list
            .lang=${this.lang}
            .value=${live(this.service.state.context.allowedOrigins)}
            ?disabled=${this.service.state.matches('disabled')}
            @change=${(evt: OriginsListChangeEvent) => {
              this.service.send({ type: 'SET_ORIGINS', value: evt.detail });
            }}
          >
          </x-origins-list>
        </x-section>

        <x-frequency-modification
          .value=${live(this.service.state.context.subscriptions.allowFrequencyModification)}
          @change=${(evt: FrequencyModificationChangeEvent) => {
            this.service.send({ type: 'SET_FREQUENCY_MODIFICATION', value: evt.detail });
          }}
        >
        </x-frequency-modification>

        <x-next-date-modification
          .value=${live(this.service.state.context.subscriptions.allowNextDateModification)}
          @change=${(evt: NextDateModificationChangeEvent) => {
            this.service.send({ type: 'SET_NEXT_DATE_MODIFICATION', value: evt.detail });
          }}
        >
        </x-next-date-modification>

        <x-section
          .header=${this._i18n.t('jwt.title').toString()}
          .subheader=${this._i18n.t('jwt.subtitle').toString()}
        >
          <vaadin-password-field
            class="w-full"
            .value=${live(this.service.state.context.jwtSharedSecret)}
            @change=${(evt: InputEvent) => {
              const value = (evt.target as HTMLInputElement).value;
              this.service.send({ type: 'SET_SECRET', value });
            }}
          >
          </vaadin-password-field>
        </x-section>

        <x-section
          .header=${this._i18n.t('session.title').toString()}
          .subheader=${this._i18n.t('session.subtitle').toString()}
        >
          <vaadin-integer-field
            min="1"
            max="40320"
            .value=${live(this.service.state.context.sessionLifespanInMinutes)}
            has-controls
            @change=${(evt: InputEvent) => {
              const value = parseInt((evt.target as HTMLInputElement).value);
              this.service.send({ type: 'SET_SESSION', value });
            }}
          >
          </vaadin-integer-field>
        </x-section>
      </x-page>
    `;
  }
}
