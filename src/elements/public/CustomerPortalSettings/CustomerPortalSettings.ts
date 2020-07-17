import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import { html, property } from 'lit-element';
import { Stateful } from '../../../mixins/stateful';
import { OriginsList } from './private/OriginsList/OriginsList';
import { OriginsListChangeEvent } from './private/OriginsList/OriginsListChangeEvent';

import { FrequencyModification } from './private/FrequencyModification/FrequencyModification';
import { FrequencyModificationChangeEvent } from './private/FrequencyModification/FrequencyModificationChangeEvent';

import { NextDateModification } from './private/NextDateModification/NextDateModification';
import { NextDateModificationChangeEvent } from './private/NextDateModification/NextDateModificationChangeEvent';

import {
  CustomerPortalSettingsContext,
  CustomerPortalSettingsSchema,
  CustomerPortalSettingsEvent,
} from './types';

import { machine } from './machine';
import { Section, Page, Code, I18N, Skeleton } from '../../private/index';

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
      'x-skeleton': Skeleton,
      'x-section': Section,
      'x-i18n': I18N,
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

  @property({ type: Boolean, noAccessor: true })
  public get disabled() {
    return this.service.state.matches('disabled');
  }
  public set disabled(value: boolean) {
    this.service.send(value ? 'DISABLE' : 'ENABLE');
  }

  public render() {
    if (!this.service.state.context) return;

    return html`
      <x-page>
        <x-i18n class="block" slot="title" key="title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
        <x-i18n class="block" slot="subtitle" key="subtitle" .ns=${this.ns} .lang=${this.lang}>
        </x-i18n>

        <x-section>
          <x-i18n slot="title" key="quickstart.title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          <x-i18n slot="subtitle" key="quickstart.subtitle" .ns=${this.ns} .lang=${this.lang}>
          </x-i18n>

          ${this._isI18nReady
            ? this.__renderCode()
            : html`<x-skeleton class="block">${this.__renderCode}</x-skeleton>`}
        </x-section>

        <x-section>
          <x-i18n slot="title" key="origins.title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          <x-i18n slot="subtitle" key="origins.subtitle" .ns=${this.ns} .lang=${this.lang}></x-i18n>

          <x-origins-list
            data-testid="origins"
            .lang=${this.lang}
            .value=${this.service.state.context.allowedOrigins}
            .disabled=${this.disabled}
            @change=${(evt: OriginsListChangeEvent) => {
              this.service.send({ type: 'SET_ORIGINS', value: evt.detail });
            }}
          >
          </x-origins-list>
        </x-section>

        <x-frequency-modification
          data-testid="fmod"
          .lang=${this.lang}
          .value=${this.service.state.context.subscriptions.allowFrequencyModification}
          .disabled=${this.disabled}
          @change=${(evt: FrequencyModificationChangeEvent) => {
            this.service.send({ type: 'SET_FREQUENCY_MODIFICATION', value: evt.detail });
          }}
        >
        </x-frequency-modification>

        <x-next-date-modification
          data-testid="ndmod"
          .lang=${this.lang}
          .value=${this.service.state.context.subscriptions.allowNextDateModification}
          .disabled=${this.disabled}
          @change=${(evt: NextDateModificationChangeEvent) => {
            this.service.send({ type: 'SET_NEXT_DATE_MODIFICATION', value: evt.detail });
          }}
        >
        </x-next-date-modification>

        <x-section>
          <x-i18n slot="title" key="jwt.title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          <x-i18n slot="subtitle" key="jwt.subtitle" .ns=${this.ns} .lang=${this.lang}></x-i18n>

          <vaadin-password-field
            class="w-full"
            data-testid="jwt"
            .value=${this._isI18nReady ? this.service.state.context.jwtSharedSecret : ''}
            .disabled=${this.disabled || !this._isI18nReady}
            @change=${(evt: InputEvent) => {
              const value = (evt.target as HTMLInputElement).value;
              this.service.send({ type: 'SET_SECRET', value });
            }}
          >
          </vaadin-password-field>
        </x-section>

        <x-section>
          <x-i18n slot="title" key="session.title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          <x-i18n slot="subtitle" key="session.subtitle" .ns=${this.ns} .lang=${this.lang}></x-i18n>

          <vaadin-integer-field
            min="1"
            max="40320"
            style="min-width: 16rem"
            has-controls
            data-testid="session"
            .value=${this._isI18nReady ? this.service.state.context.sessionLifespanInMinutes : ''}
            .disabled=${this.disabled || !this._isI18nReady}
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

  private __renderCode() {
    return html`
      <x-code>
        <template>
          <script type="module" src=${this.__modernUrl}></script>
          <script nomodule src=${this.__legacyUrl}></script>
          <foxy-customer-portal endpoint=${this.__storeUrl}></foxy-customer-portal>
        </template>
      </x-code>
    `;
  }
}
