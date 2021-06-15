import '@polymer/iron-icon';
import '@vaadin/vaadin-button';

import { ErrorScreen, FriendlyError } from '../../private/ErrorScreen/ErrorScreen';
import { FxBookmark, FxCustomerPortalSettings, FxStore } from '../../../types/hapi';
import { I18N, Page, Section, Skeleton } from '../../private/index';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { RequestEvent, UnhandledRequestError } from '../../../events/request';
import {
  SessionDuration,
  SessionDurationChangeEvent,
} from './private/SessionDuration/SessionDuration';
import { SessionSecret, SessionSecretChangeEvent } from './private/SessionSecret/SessionSecret';
import { Switch, SwitchChangeEvent } from '../../private/Switch/Switch';

import { CustomerPortalSettingsLoadSuccessEvent } from './types';
import { FrequencyModification } from './private/FrequencyModification/FrequencyModification';
import { FrequencyModificationChangeEvent } from './private/FrequencyModification/FrequencyModificationChangeEvent';
import { LoadingScreen } from '../../private/LoadingScreen/LoadingScreen';
import { NextDateModification } from './private/NextDateModification/NextDateModification';
import { NextDateModificationChangeEvent } from './private/NextDateModification/NextDateModificationChangeEvent';
import { OriginsList } from './private/OriginsList/OriginsList';
import { OriginsListChangeEvent } from './private/OriginsList/OriginsListChangeEvent';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../mixins/translatable';
import cloneDeep from 'lodash-es/cloneDeep';
import { interpret } from 'xstate';
import { machine } from './machine';

/**
 * @param response
 */
function throwIfNotOk(response: Response) {
  if (response.ok) return;
  throw new FriendlyError(response.status === 401 ? 'unauthorized' : 'unknown');
}

export class CustomerPortalSettingsReadyEvent extends CustomEvent<void> {
  constructor() {
    super('ready');
  }
}

export class CustomerPortalSettingsUpdateEvent extends CustomEvent<void> {
  constructor() {
    super('update');
  }
}

export class CustomerPortalSettings extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': customElements.get('vaadin-button'),
      'x-frequency-modification': FrequencyModification,
      'x-next-date-modification': NextDateModification,
      'x-session-duration': SessionDuration,
      'x-session-secret': SessionSecret,
      'x-loading-screen': LoadingScreen,
      'x-error-screen': ErrorScreen,
      'x-origins-list': OriginsList,
      'x-skeleton': Skeleton,
      'x-section': Section,
      'x-switch': Switch,
      'x-i18n': I18N,
      'x-page': Page,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      href: { type: String, noAccessor: true },
    };
  }

  public readonly rel = 'customer_portal_settings';

  private __machine = machine.withConfig({
    services: {
      load: () => this.__load(),
      save: () => this.__save(),
    },
  });

  private __service = interpret(this.__machine)
    .onTransition(({ changed }) => changed && this.requestUpdate())
    .onChange(() => this.requestUpdate())
    .start();

  public constructor() {
    super('customer-portal-settings');
  }

  public get href(): string | null {
    return this.__service.state.context.href;
  }

  public set href(data: string | null) {
    this.__service.send({ type: 'SET_HREF', data });
  }

  public render(): TemplateResult {
    if (this.__service.state.matches('error')) {
      return html`
        <x-error-screen
          data-testid="error"
          lang=${this.lang}
          type=${this.__service.state.context.error!}
          reload
          @reload=${this.__reload}
        >
        </x-error-screen>
      `;
    }

    const { newResource } = this.__service.state.context;

    const matchesCreated = this.__service.state.matches('idle.dirty.created');
    const matchesDeleted = this.__service.state.matches('idle.dirty.deleted');
    const matchesUpdated = this.__service.state.matches('idle.dirty.updated');
    const matchesEnabled = this.__service.state.matches('idle.clean.enabled');
    const matchesInvalid =
      this.__service.state.matches('idle.dirty.updated.invalid') ||
      this.__service.state.matches('idle.dirty.created.invalid');

    return html`
      <x-page class="relative">
        <x-switch
          slot="title"
          data-testid="switch"
          .disabled=${!this.__service.state.matches('idle') || !this._isI18nReady}
          .checked=${matchesEnabled || matchesCreated || matchesUpdated}
          @change=${(evt: SwitchChangeEvent) => {
            this.__service.send(evt.detail ? 'ENABLE' : 'DISABLE');
          }}
        >
          <x-i18n key="title" class="text-xxl" .ns=${this.ns} .lang=${this.lang}>
            <sup class="text-tertiary">
              <x-i18n key="beta" .ns=${this.ns} .lang=${this.lang}> </x-i18n>
            </sup>
          </x-i18n>
        </x-switch>

        <x-i18n
          class="block mr-xl"
          slot="subtitle"
          key="subtitle"
          .ns=${this.ns}
          .lang=${this.lang}
        >
        </x-i18n>

        <x-section>
          <x-i18n slot="title" key="origins.title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          <x-i18n slot="subtitle" key="origins.subtitle" .ns=${this.ns} .lang=${this.lang}></x-i18n>

          <x-origins-list
            data-testid="origins"
            .lang=${this.lang}
            .ns=${this.ns}
            .value=${newResource?.allowedOrigins ?? []}
            .disabled=${!newResource}
            @change=${(evt: OriginsListChangeEvent) => {
              this.__service.send({ type: 'SET_ORIGINS', value: evt.detail });
            }}
          >
          </x-origins-list>
        </x-section>

        <x-frequency-modification
          data-testid="fmod"
          .lang=${this.lang}
          .ns=${this.ns}
          .value=${newResource?.subscriptions.allowFrequencyModification ?? []}
          ?disabled=${!newResource}
          @change=${(evt: FrequencyModificationChangeEvent) => {
            this.__service.send({ type: 'SET_FREQUENCY_MODIFICATION', value: evt.detail });
          }}
        >
        </x-frequency-modification>

        <x-next-date-modification
          data-testid="ndmod"
          .lang=${this.lang}
          .ns=${this.ns}
          .value=${newResource?.subscriptions.allowNextDateModification ?? false}
          .disabled=${!newResource}
          @change=${(evt: NextDateModificationChangeEvent) => {
            this.__service.send({ type: 'SET_NEXT_DATE_MODIFICATION', value: evt.detail });
          }}
        >
        </x-next-date-modification>

        <x-section>
          <x-i18n slot="title" key="advanced.title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          <x-i18n slot="subtitle" key="advanced.subtitle" .ns=${this.ns} .lang=${this.lang}>
          </x-i18n>

          <x-session-duration
            data-testid="session"
            .disabled=${!newResource || !this._isI18nReady}
            .value=${newResource?.sessionLifespanInMinutes ?? 1}
            .lang=${this.lang}
            .ns=${this.ns}
            @change=${({ detail }: SessionDurationChangeEvent) => {
              this.__service.send({ type: 'SET_SESSION', ...detail });
            }}
          >
          </x-session-duration>

          <x-session-secret
            data-testid="secret"
            .disabled=${!newResource || !this._isI18nReady}
            .value=${newResource?.jwtSharedSecret ?? ''}
            .lang=${this.lang}
            .ns=${this.ns}
            @change=${({ detail }: SessionSecretChangeEvent) => {
              this.__service.send({ type: 'SET_SECRET', ...detail });
            }}
          >
          </x-session-secret>
        </x-section>

        ${this.__service.state.matches('idle.dirty')
          ? html`
              <div
                class="sticky flex justify-between rounded-t-l rounded-b-l shadow-m -mx-s p-s bg-contrast"
                style="bottom: var(--lumo-space-m)"
              >
                <vaadin-button
                  data-testid="save"
                  theme="primary ${matchesDeleted ? 'error' : 'success'}"
                  .disabled=${matchesInvalid}
                  @click=${() => this.__service.send('SAVE')}
                >
                  <x-i18n
                    lang=${this.lang}
                    ns=${this.ns}
                    key="save_${matchesCreated ? 'create' : matchesDeleted ? 'delete' : 'update'}"
                  >
                  </x-i18n>
                </vaadin-button>

                <vaadin-button
                  style="--lumo-contrast: var(--lumo-base-color)"
                  data-testid="reset"
                  theme="contrast tertiary"
                  @click=${() => this.__service.send('RESET')}
                >
                  <x-i18n lang=${this.lang} key="undo_all"></x-i18n>
                  <iron-icon icon="lumo:reload" slot="suffix"></iron-icon>
                </vaadin-button>
              </div>
            `
          : this.__service.state.matches('busy')
          ? html`<x-loading-screen data-testid="loading" class="mt-0"></x-loading-screen>`
          : ''}
      </x-page>
    `;
  }

  private async __reload() {
    this.__service.stop();
    this.__service
      .onTransition(({ changed }) => changed && this.requestUpdate())
      .onChange(() => this.requestUpdate())
      .start();
  }

  private async __load(): Promise<CustomerPortalSettingsLoadSuccessEvent['data']> {
    if (this.href === null) throw new FriendlyError('setup_needed');

    try {
      await this.updateComplete;

      const resourceResponse = await RequestEvent.emit({ source: this, init: [this.href] });
      let resource: FxCustomerPortalSettings | null;
      let store: FxStore;

      if (resourceResponse.status.toString().startsWith('4')) {
        resource = null;

        const bookmarkResponse = await RequestEvent.emit({ source: this, init: ['/'] });
        throwIfNotOk(bookmarkResponse);

        const bookmark = (await bookmarkResponse.json()) as FxBookmark;
        const storeHref = bookmark._links['fx:store'].href;
        const storeResponse = await RequestEvent.emit({ source: this, init: [storeHref] });
        throwIfNotOk(storeResponse);

        store = (await storeResponse.json()) as FxStore;
      } else {
        throwIfNotOk(resourceResponse);
        resource = (await resourceResponse.json()) as FxCustomerPortalSettings;

        const storeHref = resource._links['fx:store'].href;
        const storeResponse = await RequestEvent.emit({ source: this, init: [storeHref] });
        throwIfNotOk(storeResponse);

        store = (await storeResponse.json()) as FxStore;
      }

      return { store, resource };
    } catch (err) {
      if (err instanceof FriendlyError) throw err;
      if (err instanceof UnhandledRequestError) throw new FriendlyError('setup_needed');
      throw new FriendlyError('unknown');
    } finally {
      await this.updateComplete;
      this.dispatchEvent(new CustomerPortalSettingsReadyEvent());
    }
  }

  private async __save(): Promise<void> {
    try {
      const context = this.__service.state.context;
      const payload = cloneDeep(context.newResource) as Record<string, unknown> | null;
      const method = payload ? 'PUT' : 'DELETE';

      if (payload) {
        delete payload._links;
        delete payload.date_created;
        delete payload.date_modified;
      }

      const options: RequestInit = { method, body: payload ? JSON.stringify(payload) : undefined };
      const response = await RequestEvent.emit({ source: this, init: [this.href!, options] });

      throwIfNotOk(response);
    } catch (err) {
      if (err instanceof FriendlyError) throw err;
      if (err instanceof UnhandledRequestError) throw new FriendlyError('setup_needed');
      throw new FriendlyError('unknown');
    } finally {
      await this.updateComplete;
      this.dispatchEvent(new CustomerPortalSettingsUpdateEvent());
    }
  }
}
