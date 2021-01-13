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

import { AddressCardElement } from '../AddressCard';
import { AttributeCardElement } from '../AttributeCard';
import { ButtonElement } from '@vaadin/vaadin-button';
import { CollectionItemsElement } from '../CollectionItems';
import { CollectionPagesElement } from '../CollectionPages';
import { ConfirmDialog } from '../../private/Dialog/ConfirmDialog';
import { ElementResourceV8N } from '../../private/HypermediaResource/types';
import { PaymentMethodElement } from '../PaymentMethodCard';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { SpinnerElement } from '../Spinner';
import { SubscriptionsTableElement } from '../SubscriptionsTable';
import { Tabs } from '../../private/Tabs/Tabs';
import { TransactionsTableElement } from '../TransactionsTable';
import { classMap } from '../../../utils/class-map';
import { validate as isEmail } from 'email-validator';

type Resource = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customer, undefined>;

export class CustomerElement extends HypermediaResource<Resource> {
  static readonly defaultNodeName = 'foxy-customer';

  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-payment-method-card': customElements.get(PaymentMethodElement.defaultNodeName),
      'foxy-subscriptions-table': customElements.get(SubscriptionsTableElement.defaultNodeName),
      'foxy-transactions-table': customElements.get(TransactionsTableElement.defaultNodeName),
      'foxy-collection-items': customElements.get(CollectionItemsElement.defaultNodeName),
      'foxy-collection-pages': customElements.get(CollectionPagesElement.defaultNodeName),
      'foxy-attribute-card': customElements.get(AttributeCardElement.defaultNodeName),
      'foxy-address-card': customElements.get(AddressCardElement.defaultNodeName),
      'x-confirm-dialog': ConfirmDialog,
      'x-loading-screen': LoadingScreen,
      'x-property-table': PropertyTable,
      'x-error-screen': ErrorScreen,
      'vaadin-button': ButtonElement,
      'foxy-spinner': customElements.get(SpinnerElement.defaultNodeName),
      'iron-icon': customElements.get('iron-icon'),
      'x-tabs': Tabs,
      'x-page': Page,
      'x-i18n': I18N,
    };
  }

  static get resourceV8N(): ElementResourceV8N<Resource> {
    return {
      first_name: [({ first_name: v }) => v.length <= 50 || 'error_too_long'],
      last_name: [({ last_name: v }) => v.length <= 50 || 'error_too_long'],
      tax_id: [({ tax_id: v }) => v.length <= 50 || 'error_too_long'],
      email: [
        ({ email: v }) => v.length > 0 || 'error_required',
        ({ email: v }) => v.length <= 100 || 'error_too_long',
        ({ email: v }) => isEmail(v) || 'error_invalid_email',
      ],
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __activeTab: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        foxy-payment-method-card,
        foxy-attribute-card,
        foxy-address-card {
          width: 18rem;
        }

        foxy-collection-items {
          scroll-snap-type: x mandatory;
        }

        foxy-attribute-card,
        foxy-address-card {
          flex-shrink: 0;
          border: 1px solid var(--lumo-contrast-10pct);
          border-radius: var(--lumo-border-radius-l);
          scroll-snap-align: start;
        }

        foxy-attribute-card {
          padding: calc(var(--lumo-space-m) / var(--lumo-line-height-s)) var(--lumo-space-m);
        }

        foxy-address-card {
          padding: calc(var(--lumo-space-m) / var(--lumo-line-height-m)) var(--lumo-space-m);
        }

        foxy-attribute-card:hover,
        foxy-address-card:hover {
          border-color: var(--lumo-contrast-30pct);
        }

        foxy-attribute-card:focus-within,
        foxy-address-card:focus-within {
          border-color: var(--lumo-primary-color);
          box-shadow: none;
        }
      `,
    ];
  }

  readonly rel = 'customer';

  constructor() {
    super('customer');
  }

  renderIdle(): TemplateResult {
    const { _links, first_name, last_name } = this.resource!;

    return html`
      <article class="font-lumo text-body text-m leading-m space-y-xl">
        <header class="flex items-center justify-between space-x-m">
          <div class="leading-s min-w-0 flex-1">
            <h1 class="text-xxl font-semibold truncate">${first_name} ${last_name}</h1>
          </div>

          ${this._is('idle.snapshot.modified')
            ? html`
                <vaadin-button class="px-xs rounded-full" theme="icon" @click=${this._restore}>
                  <iron-icon icon="icons:undo"></iron-icon>
                </vaadin-button>

                <vaadin-button
                  class="px-xs rounded-full"
                  ?disabled=${this._is('idle.snapshot.modified.invalid')}
                  theme="primary success icon"
                  @click=${this._submit}
                >
                  <iron-icon icon="icons:done"></iron-icon>
                </vaadin-button>
              `
            : html`
                <vaadin-button
                  class="px-xs rounded-full"
                  theme="error icon"
                  @click=${() => this.__confirmDialog.show()}
                >
                  <iron-icon icon="icons:delete"></iron-icon>
                </vaadin-button>
              `}
        </header>

        <x-property-table
          .ns=${this.ns}
          .lang=${this.lang}
          .items=${this.__getPropertyTableItems()}
          @submit=${this._submit}
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

          <foxy-collection-items
            first=${_links['fx:customer_addresses'].href}
            class="flex items-center space-x-m overflow-auto"
            spinner="foxy-spinner"
            element="foxy-address-card"
          >
          </foxy-collection-items>
        </section>

        <section class="space-y-m">
          <h2 class="text-xl font-medium">
            <x-i18n .ns=${this.ns} .lang=${this.lang} key="payment_methods"></x-i18n>
          </h2>

          <foxy-payment-method-card
            class="rounded-t-l rounded-b-l overflow-hidden"
            .href=${_links['fx:default_payment_method'].href}
          >
          </foxy-payment-method-card>
        </section>

        <section class="space-y-m">
          <header class="space-x-m flex items-center justify-between md:justify-start">
            <h2 class="text-xl font-medium">
              <x-i18n .ns=${this.ns} .lang=${this.lang} key="attributes"></x-i18n>
            </h2>

            <button
              aria-label=${this._t('add_attribute').toString()}
              class=${classMap({
                'flex-shrink-0 h-m w-m rounded-full flex items-center justify-center bg-primary-10 text-primary': true,
                'hover:bg-primary hover:text-primary-contrast': true,
                'focus:outline-none focus:shadow-outline': true,
              })}
            >
              <iron-icon icon="icons:add"></iron-icon>
            </button>
          </header>

          <foxy-collection-items
            first=${_links['fx:attributes'].href}
            class="flex items-center space-x-m overflow-auto"
            spinner="foxy-spinner"
            element="foxy-attribute-card"
          >
          </foxy-collection-items>
        </section>

        <section class="space-y-m">
          <x-tabs size="2">
            <x-i18n ns=${this.ns} key="transactions" lang=${this.lang} slot="tab-0"></x-i18n>
            <x-i18n ns=${this.ns} key="subscriptions" lang=${this.lang} slot="tab-1"></x-i18n>

            <foxy-collection-pages
              slot="panel-0"
              first=${_links['fx:transactions'].href}
              element="foxy-transactions-table"
            >
            </foxy-collection-pages>

            <foxy-collection-pages
              slot="panel-1"
              first=${_links['fx:subscriptions'].href}
              element="foxy-subscriptions-table"
            >
            </foxy-collection-pages>
          </x-tabs>
        </section>
      </article>
    `;
  }

  submit(): void {
    this._submit();
  }

  render(): TemplateResult {
    return html`
      <div>
        <x-customer-form-dialog header="edit" lang=${this.lang} id="form-dialog" closable>
        </x-customer-form-dialog>

        <x-confirm-dialog
          message="delete_message"
          confirm="delete_yes"
          cancel="delete_no"
          header="delete"
          theme="primary error"
          lang=${this.lang}
          ns=${this.ns}
          id="confirm"
          @submit=${this._delete}
        >
        </x-confirm-dialog>

        ${this._is('error')
          ? html`<x-error-screen></x-error-screen>`
          : this._is('busy')
          ? html`<x-loading-screen></x-loading-screen>`
          : this._is('idle.template')
          ? html`<x-error-screen type="not_found"></x-error-screen>`
          : this.renderIdle()}
      </div>
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

    const firstPurchase = {
      name: this._t('first_purchase'),
      value: this.__formatDate(new Date(this.resource.date_created)),
    };

    const lastLogin = {
      name: this._t('last_login'),
      value: this.__formatDate(new Date(this.resource.last_login_date)),
    };

    const email = {
      name: this._t('email'),
      value: this.resource.email,
      invalid: this.errors.some(err => err.target === 'email'),
      editable: true,
      onInput: (email: string) => this._setProperty({ email }),
    };

    const firstName = {
      name: this._t('first_name'),
      value: this.resource.first_name,
      invalid: this.errors.some(err => err.target === 'first_name'),
      editable: true,
      onInput: (first_name: string) => this._setProperty({ first_name }),
    };

    const lastName = {
      name: this._t('last_name'),
      value: this.resource.last_name,
      invalid: this.errors.some(err => err.target === 'last_name'),
      editable: true,
      onInput: (last_name: string) => this._setProperty({ last_name }),
    };

    const taxID = {
      name: this._t('tax_id'),
      value: this.resource.tax_id,
      invalid: this.errors.some(err => err.target === 'tax_id'),
      editable: true,
      onInput: (tax_id: string) => this._setProperty({ tax_id }),
    };

    return [firstName, lastName, email, taxID, lastLogin, firstPurchase];
  }

  private get __confirmDialog(): ConfirmDialog {
    return this.renderRoot.querySelector('#confirm') as ConfirmDialog;
  }
}
