import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { interpret } from 'xstate';
import { RequestEvent, UnhandledRequestError } from '../../../events/request';
import { Translatable } from '../../../mixins/translatable';
import { FxCustomerPortalSettings } from '../../../types/hapi';
import { ErrorScreen, FriendlyError } from '../../private/ErrorScreen/ErrorScreen';
import { Code, I18N, Page, Section, Skeleton } from '../../private/index';
import { LoadingScreen } from '../../private/LoadingScreen/LoadingScreen';
import { machine } from './machine';
import { FrequencyModification } from './private/FrequencyModification/FrequencyModification';
import { FrequencyModificationChangeEvent } from './private/FrequencyModification/FrequencyModificationChangeEvent';
import { NextDateModification } from './private/NextDateModification/NextDateModification';
import { NextDateModificationChangeEvent } from './private/NextDateModification/NextDateModificationChangeEvent';
import { OriginsList } from './private/OriginsList/OriginsList';
import { OriginsListChangeEvent } from './private/OriginsList/OriginsListChangeEvent';
import { CustomerPortalSettingsLoadSuccessEvent } from './types';

function throwIfNotOk(response: Response) {
  if (response.ok) return;
  throw new FriendlyError(response.status === 403 ? 'unauthorized' : 'unknown');
}

export class CustomerPortalSettings extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': customElements.get('vaadin-button'),
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-password-field': customElements.get('vaadin-password-field'),
      'x-frequency-modification': FrequencyModification,
      'x-next-date-modification': NextDateModification,
      'x-loading-screen': LoadingScreen,
      'x-error-screen': ErrorScreen,
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

  private __machine = machine.withConfig({
    services: {
      load: () => this.__load(),
      save: () => this.__save(),
    },
  });

  private __service = interpret(this.__machine)
    .onTransition(({ changed }) => changed && this.requestUpdate())
    .onChange(() => this.requestUpdate());

  public readonly rel = 'customer_portal_settings';

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      href: { type: String, noAccessor: true },
    };
  }

  public get href(): string | null {
    return this.__service.state.context.href;
  }
  public set href(data: string | null) {
    this.__service.send({ type: 'SET_HREF', data });
  }

  public constructor() {
    super('customer-portal-settings');
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (!this.__service.initialized) this.__service.start();
  }

  public render(): TemplateResult {
    if (this.__service.state.matches('error')) {
      return html`
        <x-error-screen
          data-testid="error"
          lang=${this.lang}
          type=${this.__service.state.context.error!}
        >
        </x-error-screen>
      `;
    }

    const { newResource } = this.__service.state.context;

    return html`
      <x-page class="relative">
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

          ${newResource
            ? html`
                <x-origins-list
                  data-testid="origins"
                  lang=${this.lang}
                  ns=${this.ns}
                  .value=${newResource.allowedOrigins}
                  ?disabled=${!this._isI18nReady}
                  @change=${(evt: OriginsListChangeEvent) => {
                    this.__service.send({ type: 'SET_ORIGINS', value: evt.detail });
                  }}
                >
                </x-origins-list>
              `
            : ''}
        </x-section>

        ${newResource
          ? html`
              <x-frequency-modification
                data-testid="fmod"
                lang=${this.lang}
                ns=${this.ns}
                .value=${newResource!.subscriptions.allowFrequencyModification}
                ?disabled=${!this._isI18nReady}
                @change=${(evt: FrequencyModificationChangeEvent) => {
                  this.__service.send({ type: 'SET_FREQUENCY_MODIFICATION', value: evt.detail });
                }}
              >
              </x-frequency-modification>

              <x-next-date-modification
                data-testid="ndmod"
                lang=${this.lang}
                ns=${this.ns}
                .value=${newResource!.subscriptions.allowNextDateModification}
                ?disabled=${!this._isI18nReady}
                @change=${(evt: NextDateModificationChangeEvent) => {
                  this.__service.send({ type: 'SET_NEXT_DATE_MODIFICATION', value: evt.detail });
                }}
              >
              </x-next-date-modification>
            `
          : ''}

        <x-section>
          <x-i18n slot="title" key="jwt.title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          <x-i18n slot="subtitle" key="jwt.subtitle" .ns=${this.ns} .lang=${this.lang}></x-i18n>

          ${newResource
            ? html`
                <vaadin-password-field
                  class="w-full"
                  data-testid="jwt"
                  .value=${this._isI18nReady ? newResource!.jwtSharedSecret : ''}
                  ?disabled=${!this._isI18nReady}
                  @change=${(evt: InputEvent) => {
                    const value = (evt.target as HTMLInputElement).value;
                    this.__service.send({ type: 'SET_SECRET', value });
                  }}
                >
                </vaadin-password-field>
              `
            : ''}
        </x-section>

        <x-section>
          <x-i18n slot="title" key="session.title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          <x-i18n slot="subtitle" key="session.subtitle" .ns=${this.ns} .lang=${this.lang}></x-i18n>

          ${newResource
            ? html`
                <vaadin-integer-field
                  min="1"
                  max="40320"
                  style="min-width: 16rem"
                  has-controls
                  data-testid="session"
                  .value=${this._isI18nReady ? newResource!.sessionLifespanInMinutes : ''}
                  ?disabled=${!this._isI18nReady}
                  @change=${(evt: InputEvent) => {
                    const value = parseInt((evt.target as HTMLInputElement).value);
                    this.__service.send({ type: 'SET_SESSION', value });
                  }}
                >
                </vaadin-integer-field>
              `
            : ''}
        </x-section>

        ${this.__service.state.matches('idle.dirty')
          ? html`
              <div
                class="sticky flex justify-between bottom-0 p-m bg-base border-t border-contrast-10 -m-m mt-m md:-m-l md:mt-l lg:-m-xl lg:mt-xl"
              >
                <vaadin-button
                  data-testid="save"
                  theme="primary"
                  @click=${() => this.__service.send('SAVE')}
                >
                  <iron-icon icon="lumo:checkmark" slot="prefix"></iron-icon>
                  <x-i18n lang=${this.lang} key="save"></x-i18n>
                </vaadin-button>

                <vaadin-button
                  data-testid="reset"
                  theme="tertiary"
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

  private async __load(): Promise<CustomerPortalSettingsLoadSuccessEvent['data']> {
    if (this.href === null) throw new FriendlyError('setup_needed');

    try {
      const resourceResponse = await RequestEvent.emit({ source: this, init: [this.href] });
      throwIfNotOk(resourceResponse);

      const resource = (await resourceResponse.json()) as FxCustomerPortalSettings;
      const storeHref = resource._links['fx:store'].href;
      const storeResponse = await RequestEvent.emit({ source: this, init: [storeHref] });
      throwIfNotOk(storeResponse);

      return { store: await storeResponse.json(), resource };
    } catch (err) {
      if (err instanceof FriendlyError) throw err;
      if (err instanceof UnhandledRequestError) throw new FriendlyError('setup_needed');
      throw new FriendlyError('unknown');
    }
  }

  private async __save(): Promise<void> {
    if (this.href === null) throw new FriendlyError('setup_needed');

    try {
      const payload = this.__service.state.context.newResource;
      const options: RequestInit = { method: 'PATCH', body: JSON.stringify(payload!) };
      const response = await RequestEvent.emit({ source: this, init: [this.href, options] });

      throwIfNotOk(response);
    } catch (err) {
      if (err instanceof FriendlyError) throw err;
      if (err instanceof UnhandledRequestError) throw new FriendlyError('setup_needed');
      throw new FriendlyError('unknown');
    }
  }
}
