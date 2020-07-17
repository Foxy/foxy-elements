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
        </x-section>

        <x-section
          .header=${this._i18n.t('origins.title').toString()}
          .subheader=${this._i18n.t('origins.subtitle').toString()}
        >
          <x-origins-list
            .lang=${this.lang}
            .value=${this.service.state.context.allowedOrigins}
            ?disabled=${this.service.state.matches('disabled')}
            @change=${(evt: OriginsListChangeEvent) => {
              this.service.send({ type: 'SET_ORIGINS', value: evt.detail });
            }}
          >
          </x-origins-list>
        </x-section>

        <x-frequency-modification
          .value=${this.service.state.context.subscriptions.allowFrequencyModification}
          @change=${(evt: FrequencyModificationChangeEvent) => {
            this.service.send({ type: 'SET_FREQUENCY_MODIFICATION', value: evt.detail });
          }}
        >
        </x-frequency-modification>

        <x-next-date-modification
          .value=${this.service.state.context.subscriptions.allowNextDateModification}
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
            .value=${this.service.state.context.jwtSharedSecret}
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
            .value=${this.service.state.context.sessionLifespanInMinutes}
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
