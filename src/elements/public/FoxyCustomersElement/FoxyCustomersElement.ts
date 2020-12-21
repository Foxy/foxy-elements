import '@polymer/iron-icon';
import '@polymer/iron-icons/iron-icons';

import type * as FoxySDK from '@foxy.io/sdk';

import { I18N, LoadingScreen, Page } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { CollectionTable } from '../../private/CollectionTable/CollectionTable';
import { FoxyCustomerElement } from '../FoxyCustomerElement';
import { Modal } from '../../private/Modal/Modal';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';

type Customers = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customers, undefined>;
type Customer = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customer, undefined>;

export class FoxyCustomersElement extends CollectionTable<Customers> {
  public static readonly defaultNodeName = 'foxy-customers';

  public static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-customer': customElements.get(FoxyCustomerElement.defaultNodeName),
      'x-loading-screen': LoadingScreen,
      'x-modal': Modal,
      'x-page': Page,
      'x-i18n': I18N,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __isPreviewOpen: { attribute: false },
      __selection: { attribute: false },
    };
  }

  public readonly rel = 'customers';

  private __selection: Customer | null = null;

  private __isPreviewOpen = false;

  public constructor() {
    super('customers');
  }

  public render(): TemplateResult {
    return html`
      <x-modal
        ?open=${this.__selection !== null}
        closable
        @open=${() => (this.__isPreviewOpen = true)}
        @close=${() => {
          this.__selection = null;
          this.__isPreviewOpen = false;
        }}
      >
        <x-i18n ns=${this.ns} lang=${this.lang} key="customer" slot="header"></x-i18n>
        <x-i18n ns=${this.ns} lang=${this.lang} key="close" slot="action"></x-i18n>

        ${this.__isPreviewOpen
          ? html`<foxy-customer .resource=${this.__selection} .lang=${this.lang}></foxy-customer>`
          : html`<x-loading-screen class="h-full"></x-loading-screen>`}
      </x-modal>

      <x-page class="leading-m">
        <x-i18n slot="title" key="title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
        <x-i18n slot="subtitle" key="subtitle" .ns=${this.ns} .lang=${this.lang}></x-i18n>

        <div>
          ${super.render([
            {
              header: () => this._t('name').toString(),
              cell: customer => `${customer.first_name} ${customer.last_name}`,
            },
            {
              mdAndUp: true,
              header: () => this._t('id').toString(),
              cell: customer => html`
                <span role="presentation" class="text-s text-tertiary">ID&nbsp;</span>
                <span class="text-s text-secondary font-tnum">${customer.id}</span>
              `,
            },
            {
              header: () => this._t('email').toString(),
              cell: customer => html`<span class="text-s text-secondary">${customer.email}</span>`,
            },
            {
              mdAndUp: true,
              header: () => this._t('actions').toString(),
              cell: customer =>
                html`
                  <button
                    class="rounded text-s font-medium tracking-wide text-primary hover:opacity-75 focus:outline-none focus:shadow-outline"
                    @click=${() => (this.__selection = customer)}
                  >
                    <x-i18n ns=${this.ns} lang=${this.lang} key="preview"></x-i18n>
                  </button>
                `,
            },
          ])}
        </div>
      </x-page>
    `;
  }
}
