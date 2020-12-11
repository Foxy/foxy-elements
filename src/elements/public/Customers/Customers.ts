import '@polymer/iron-icon';
import '@polymer/iron-icons/iron-icons';

import type * as FoxySDK from '@foxy.io/sdk';

import { ErrorScreen, I18N, InfiniteScroll, InfiniteScrollNextEvent, Page } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { PropertyDeclarations } from 'lit-element';
import { RequestEvent } from '../../../events/request';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { Translatable } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { debounce } from 'lodash-es';

const DEBOUNCE_WAIT = 250;

type Writeable<T> = { -readonly [P in keyof T]: Writeable<T[P]> };
type CustomersResource = Writeable<
  FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customers, undefined>
>;

export class Customers extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': TextFieldElement,
      'x-infinite-scroll': InfiniteScroll,
      'x-error-screen': ErrorScreen,
      'vaadin-button': ButtonElement,
      'iron-icon': customElements.get('iron-icon'),
      'x-page': Page,
      'x-i18n': I18N,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getCustomerPath: { attribute: false },
      resource: { attribute: false },
      href: { type: String },
    };
  }

  public readonly rel = 'customers';

  public getCustomerPath = (id: number): string => id.toString();

  public resource: CustomersResource | null = null;

  public href: string | null = null;

  private __setSearch = debounce((search: string) => {
    if (!this.href) return;

    const oldURL = new URL(this.href);
    const newURL = new URL(this.href);
    const reservedNames = ['offset', 'limit'];

    newURL.search = search.trim();
    oldURL.searchParams.forEach((value, name) => {
      if (reservedNames.includes(name)) newURL.searchParams.set(name, value);
    });

    const scroll = (this.shadowRoot?.getElementById('scroll') ?? null) as InfiniteScroll | null;
    scroll?.reset();

    this.href = newURL.toString();
    this.resource = null;
  }, DEBOUNCE_WAIT);

  public constructor() {
    super('customers');
  }

  public render(): TemplateResult {
    try {
      new URL(this.href ?? '');
    } catch {
      return html`<x-error-screen type="setup_needed"></x-error-screen>`;
    }

    const { ns, lang, resource: resource } = this;

    return html`
      <x-page class="leading-m">
        <x-i18n slot="title" key="title" .ns=${ns} .lang=${lang}></x-i18n>
        <x-i18n slot="subtitle" key="subtitle" .ns=${ns} .lang=${lang}></x-i18n>

        <div class="space-y-m">
          <div class="flex items-end space-x-s md:space-x-m">
            <vaadin-text-field
              placeholder=${this._t('search_example').toString()}
              label=${this._t('search').toString()}
              class="flex-1"
              clear-button-visible
              @input=${(evt: InputEvent) => {
                return this.__setSearch((evt.target as TextFieldElement).value);
              }}
            >
              <iron-icon icon="icons:search" slot="suffix"></iron-icon>
            </vaadin-text-field>

            <vaadin-button
              theme="icon contrast secondary"
              aria-label=${this._t('export').toString()}
              disabled
            >
              <iron-icon icon="icons:get-app"></iron-icon>
            </vaadin-button>
          </div>

          <div class="space-y-s">
            ${this.__renderTable()}

            <x-infinite-scroll id="scroll" class="text-s text-tertiary" @next=${this.__handleNext}>
              <x-i18n .ns=${ns} .lang=${lang} key="loading" slot="loading"></x-i18n>
              <x-i18n .ns=${ns} .lang=${lang} key="error" slot="error" class="text-error"></x-i18n>
              <x-i18n .ns=${ns} .lang=${lang} key="summary" .opts=${resource ?? {}}></x-i18n>
            </x-infinite-scroll>
          </div>
        </div>
      </x-page>
    `;
  }

  private __handleNext(evt: InfiniteScrollNextEvent) {
    return evt.detail(async () => {
      const href = this.resource?._links.next.href ?? this.href!;
      const response = await RequestEvent.emit({ source: this, init: [href] });

      if (!response.ok && response.status === 400) return true;
      if (!response.ok) throw new Error();
      const resource = (await response.json()) as CustomersResource;

      if (this.resource === null) {
        this.resource = resource;
      } else {
        this.resource._embedded['fx:customers'].push(...resource._embedded['fx:customers']);
        this.resource._links.next = resource._links.next;
        this.resource._links.last = resource._links.last;
        this.resource.returned_items += resource.returned_items;
        this.resource.total_items = resource.total_items;
        this.resource = { ...this.resource };
      }

      return resource.returned_items < resource.limit;
    });
  }

  private __renderTable() {
    const hoverFocusStyles = 'group-hover:bg-contrast-5 group-focus:bg-contrast-10';
    const cellStyles = 'block p-0 md:py-xs md:w-auto md:table-cell';

    return html`
      <table class="mt-m font-lumo text-body text-m w-full block md:table-fixed md:table">
        <thead class="sr-only">
          <tr>
            <th>${this._t('name').toString()}</th>
            <th>${this._t('id').toString()}</th>
            <th>${this._t('email').toString()}</th>
            <th>${this._t('actions').toString()}</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-contrast-10 block md:table-row-group">
          ${this.resource?._embedded['fx:customers'].map(
            ({ first_name, last_name, email, id }) => html`
              <tr
                class="py-xs rounded group cursor-pointer flex flex-wrap md:table-row focus:outline-none"
                aria-label=${this._t('open_preview').toString()}
                role="button"
                tabindex="0"
                @click=${() => console.log('OPEN PREVIEW: ', id)}
              >
                <td class="w-full ${cellStyles}">
                  <div
                    class=${classMap({
                      'text-m leading-s font-medium pt-xs px-m -mx-m rounded-t-l flex items-center justify-between': true,
                      'md:pr-0 md:mr-0 md:pt-0 md:rounded-tr-none md:rounded-bl-l md:h-l': true,
                      [hoverFocusStyles]: true,
                    })}
                  >
                    <span class="truncate">${first_name} ${last_name}</span>
                    <iron-icon class="-mr-s md:hidden" icon="icons:chevron-right"></iron-icon>
                  </div>
                </td>

                <td class="w-1/2 ${cellStyles}">
                  <div
                    class=${classMap({
                      'truncate pb-xs pl-m -ml-m rounded-bl-l flex items-center': true,
                      'md:p-0 md:m-0 md:rounded-none md:h-l': true,
                      [hoverFocusStyles]: true,
                    })}
                  >
                    <span role="presentation" class="text-s text-tertiary">ID&nbsp;</span>
                    <span class="text-s text-secondary font-tnum">${id}</span>
                  </div>
                </td>

                <td class="w-1/2 ${cellStyles}">
                  <div
                    class=${classMap({
                      'pr-m pb-xs -mr-m rounded-br-l flex items-center justify-end': true,
                      'md:justify-start md:h-l md:p-0 md:m-0 md:rounded-none': true,
                      [hoverFocusStyles]: true,
                    })}
                  >
                    <span class="truncate text-s text-secondary">${email}</span>
                  </div>
                </td>

                <td class="hidden ${cellStyles}">
                  <div
                    class=${classMap({
                      'flex items-center justify-end relative h-l pr-m -mr-m rounded-r-l': true,
                      [hoverFocusStyles]: true,
                    })}
                  >
                    <a
                      class=${classMap({
                        'w-s h-s rounded-full overflow-hidden cursor-pointer bg-contrast-5': true,
                        'group-focus:bg-base group-hover:bg-base focus:outline-none focus:shadow-outline': true,
                      })}
                      href=${this.getCustomerPath(id)}
                      @click=${(evt: MouseEvent) => evt.stopPropagation()}
                    >
                      <div class="flex h-full hover:bg-primary hover:text-primary-contrast">
                        <span class="sr-only">${this._t('open_page').toString()}</span>
                        <iron-icon
                          class="m-auto"
                          style="--iron-icon-width: calc(var(--lumo-size-s) * 0.6)"
                          icon="icons:arrow-forward"
                        >
                        </iron-icon>
                      </div>
                    </a>
                  </div>
                </td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}
