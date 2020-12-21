import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@polymer/iron-icons/editor-icons';

import * as FoxySDK from '@foxy.io/sdk';

import { CSSResultArray, PropertyDeclarations, TemplateResult, css, html } from 'lit-element';
import {
  ErrorScreen,
  HypermediaResource,
  I18N,
  LoadingScreen,
  Page,
  PropertyTable,
} from '../../private';

import { FoxyCustomerAddressesElement } from '../FoxyCustomerAddressesElement';
import { FoxyDefaultPaymentMethodElement } from '../FoxyDefaultPaymentMethodElement';
import { FoxySubscriptionsElement } from '../FoxySubscriptionsElement';
import { FoxyTransactionsElement } from '../FoxyTransactionsElement';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { Tabs } from '../../private/Tabs/Tabs';
import { classMap } from '../../../utils/class-map';

type Resource = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customer, undefined>;

export class FoxyCustomerElement extends HypermediaResource<Resource> {
  static readonly defaultNodeName = 'foxy-customer';

  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-default-payment-method': customElements.get(
        FoxyDefaultPaymentMethodElement.defaultNodeName
      ),

      'foxy-customer-addresses': customElements.get(FoxyCustomerAddressesElement.defaultNodeName),
      'foxy-subscriptions': customElements.get(FoxySubscriptionsElement.defaultNodeName),
      'foxy-transactions': customElements.get(FoxyTransactionsElement.defaultNodeName),
      'x-loading-screen': LoadingScreen,
      'x-property-table': PropertyTable,
      'x-error-screen': ErrorScreen,
      'iron-icon': customElements.get('iron-icon'),
      'x-tabs': Tabs,
      'x-page': Page,
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return { __activeTab: { attribute: false } };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .w-18rem {
          width: 18rem;
        }
      `,
    ];
  }

  readonly rel = 'customer';

  constructor() {
    super('customer');
  }

  render(): TemplateResult {
    if (this._is('loading')) return html`<x-loading-screen></x-loading-screen>`;
    if (this._is('error')) return html`<x-error-screen></x-error-screen>`;

    const { _links, first_name, last_name, email } = this.resource!;

    return html`
      <article class="font-lumo text-body text-m leading-m space-y-xl">
        <header class="flex items-center justify-between space-x-m">
          <div class="leading-s min-w-0">
            <h1 class="text-xl font-medium truncate">${first_name} ${last_name}</h1>
            <p class="text-secondary truncate">${email}</p>
          </div>

          <button
            aria-label=${this._t('edit').toString()}
            class=${classMap({
              'flex-shrink-0 h-l w-l rounded-full flex items-center justify-center bg-primary-10 text-primary': true,
              'hover:bg-primary hover:text-primary-contrast': true,
              'focus:outline-none focus:shadow-outline': true,
            })}
          >
            <iron-icon icon="editor:mode-edit"></iron-icon>
          </button>
        </header>

        <x-property-table
          .ns=${this.ns}
          .lang=${this.lang}
          .items=${this.__getPropertyTableItems()}
        >
        </x-property-table>

        <section class="space-y-m">
          <header class="space-x-m flex items-center justify-between md:justify-start">
            <h2 class="text-xl font-medium">
              <x-i18n .ns=${this.ns} .lang=${this.lang} key="addresses"></x-i18n>
            </h2>

            <button
              aria-label=${this._t('add').toString()}
              class=${classMap({
                'flex-shrink-0 h-m w-m rounded-full flex items-center justify-center bg-primary-10 text-primary': true,
                'hover:bg-primary hover:text-primary-contrast': true,
                'focus:outline-none focus:shadow-outline': true,
              })}
            >
              <iron-icon icon="icons:add"></iron-icon>
            </button>
          </header>

          <foxy-customer-addresses first=${_links['fx:customer_addresses'].href}>
          </foxy-customer-addresses>
        </section>

        <section class="space-y-m">
          <h2 class="text-xl font-medium">
            <x-i18n .ns=${this.ns} .lang=${this.lang} key="payment_methods"></x-i18n>
          </h2>

          <foxy-default-payment-method
            class="w-18rem shadow-xs rounded-t-l rounded-b-l overflow-hidden"
            .href=${_links['fx:default_payment_method'].href}
          >
          </foxy-default-payment-method>
        </section>

        <section class="space-y-m">
          <x-tabs size="2">
            <x-i18n ns=${this.ns} key="transactions" lang=${this.lang} slot="tab-0"></x-i18n>
            <x-i18n ns=${this.ns} key="subscriptions" lang=${this.lang} slot="tab-1"></x-i18n>

            <foxy-transactions slot="panel-0" first=${_links['fx:transactions'].href}>
            </foxy-transactions>

            <foxy-subscriptions slot="panel-1" first=${_links['fx:subscriptions'].href}>
            </foxy-subscriptions>
          </x-tabs>
        </section>
      </article>
    `;
  }

  private __formatDate(date: Date) {
    return date.toLocaleDateString(this.lang, {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    });
  }

  private __getPropertyTableItems() {
    if (!this.resource) return [];

    const customAttributes = this.resource._embedded['fx:attributes']?.map(attribute => ({
      value: attribute.value,
      name: attribute.name,
      icon: attribute.visibility === 'public' ? undefined : 'lock',
    }));

    const firstPurchase = {
      name: this._t('first_purchase'),
      value: this.__formatDate(new Date(this.resource.date_created)),
    };

    const lastLogin = {
      name: this._t('last_login'),
      value: this.__formatDate(new Date(this.resource.last_login_date)),
    };

    const taxID = {
      name: this._t('tax_id'),
      value: this.resource.tax_id,
    };

    return [...customAttributes, firstPurchase, lastLogin, taxID];
  }
}
