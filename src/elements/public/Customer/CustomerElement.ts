import { CSSResultArray, TemplateResult, html } from 'lit-element';
import { ErrorScreen, LoadingScreen, PropertyTable } from '../../private';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';

import { ConfirmDialogElement } from '../../private/ConfirmDialog/ConfirmDialogElement';
import { Data } from './types';
import { FormDialogElement } from '../FormDialog';
import { I18NElement } from '../I18N';
import { NucleonElement } from '../NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { Tabs } from '../../private/Tabs/Tabs';
import { Themeable } from '../../../mixins/themeable';
import { addBreakpoints } from '../../../utils/add-breakpoints';
import { classMap } from '../../../utils/class-map';
import { validate as isEmail } from 'email-validator';
import { styles } from './styles';

export class CustomerElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-payment-method-card': customElements.get('foxy-payment-method-card'),
      'foxy-subscriptions-table': customElements.get('foxy-subscriptions-table'),
      'foxy-transactions-table': customElements.get('foxy-transactions-table'),
      'foxy-collection-pages': customElements.get('foxy-collection-pages'),
      'foxy-attribute-card': customElements.get('foxy-attribute-card'),
      'foxy-address-card': customElements.get('foxy-address-card'),
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'x-confirm-dialog': ConfirmDialogElement,
      'x-loading-screen': LoadingScreen,
      'x-property-table': PropertyTable,
      'x-error-screen': ErrorScreen,
      'vaadin-button': customElements.get('vaadin-button'),
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-tabs': Tabs,
    };
  }

  static get styles(): CSSResultArray {
    return [Themeable.styles, styles];
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ first_name: v }) => !v || v.length <= 50 || 'first_name_too_long',
      ({ last_name: v }) => !v || v.length <= 50 || 'last_name_too_long',
      ({ tax_id: v }) => !v || v.length <= 50 || 'tax_id_too_long',
      ({ email: v }) => (v && v.length > 0) || 'email_required',
      ({ email: v }) => (v && v.length <= 100) || 'email_too_long',
      ({ email: v }) => (v && isEmail(v)) || 'email_invalid',
    ];
  }

  private static __ns = 'customer';

  private __removeBreakpoints?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__removeBreakpoints = addBreakpoints(this);
  }

  renderIdle(): TemplateResult {
    const state = this.state;
    const form = { ...state.context.data, ...state.context.edits };
    const { _links, first_name, last_name } = form!;
    const ns = CustomerElement.__ns;

    return html`
      <article class="font-lumo text-body text-m leading-m space-y-xl">
        <header class="flex items-center justify-between space-x-m">
          <div class="leading-s min-w-0 flex-1">
            <h1 class="text-xxl font-semibold truncate">${first_name} ${last_name}</h1>
          </div>

          ${state.matches({ idle: { snapshot: 'dirty' } })
            ? html`
                <vaadin-button
                  class="px-xs rounded-full"
                  theme="icon"
                  @click=${() => this.send({ type: 'UNDO' })}
                >
                  <iron-icon icon="icons:undo"></iron-icon>
                </vaadin-button>

                <vaadin-button
                  class="px-xs rounded-full"
                  ?disabled=${state.matches({ idle: { snapshot: { dirty: 'invalid' } } })}
                  theme="primary success icon"
                  @click=${() => this.send({ type: 'SUBMIT' })}
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
          .ns=${ns}
          .lang=${this.lang}
          .items=${this.__getPropertyTableItems()}
          @submit=${() => this.send({ type: 'SUBMIT' })}
        >
        </x-property-table>

        <section class="space-y-m">
          <header class="space-x-m flex items-center justify-between md:justify-start">
            <h2 class="text-xl font-medium">
              <foxy-i18n .ns=${ns} .lang=${this.lang} key="addresses"></foxy-i18n>
            </h2>

            <button
              class=${classMap({
                'flex-shrink-0 h-m w-m rounded-full flex items-center justify-center bg-primary-10 text-primary': true,
                'hover:bg-primary hover:text-primary-contrast': true,
                'focus:outline-none focus:shadow-outline': true,
              })}
              aria-label=${this.__t('add').toString()}
              @click=${() => this.__newAddressFormDialog.show()}
            >
              <iron-icon icon="icons:add"></iron-icon>
            </button>
          </header>

          <foxy-collection-pages
            spinner="foxy-spinner"
            first=${_links['fx:customer_addresses'].href}
            class="h-scroll flex items-center space-x-m overflow-auto"
            page="foxy-collection-page"
            item="foxy-address-card"
          >
          </foxy-collection-pages>
        </section>

        <section class="space-y-m">
          <h2 class="text-xl font-medium">
            <foxy-i18n .ns=${ns} .lang=${this.lang} key="payment_methods"></foxy-i18n>
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
              <foxy-i18n .ns=${ns} .lang=${this.lang} key="attributes"></foxy-i18n>
            </h2>

            <button
              class=${classMap({
                'flex-shrink-0 h-m w-m rounded-full flex items-center justify-center bg-primary-10 text-primary': true,
                'hover:bg-primary hover:text-primary-contrast': true,
                'focus:outline-none focus:shadow-outline': true,
              })}
              aria-label=${this.__t('add_attribute').toString()}
              @click=${() => this.__newAttributeFormDialog.show()}
            >
              <iron-icon icon="icons:add"></iron-icon>
            </button>
          </header>

          <foxy-collection-pages
            spinner="foxy-spinner"
            first=${_links['fx:attributes'].href}
            class="h-scroll flex items-center space-x-m overflow-auto"
            page="foxy-collection-page"
            item="foxy-attribute-card"
          >
          </foxy-collection-pages>
        </section>

        <section class="space-y-m">
          <x-tabs size="2">
            <foxy-i18n ns=${ns} key="transactions" lang=${this.lang} slot="tab-0"></foxy-i18n>
            <foxy-i18n ns=${ns} key="subscriptions" lang=${this.lang} slot="tab-1"></foxy-i18n>

            <foxy-collection-pages
              spinner="foxy-spinner"
              first="${_links['fx:transactions'].href}&zoom=items"
              slot="panel-0"
              page="foxy-transactions-table"
            >
            </foxy-collection-pages>

            <foxy-collection-pages
              spinner="foxy-spinner"
              first="${_links['fx:subscriptions']
                .href}&zoom=last_transaction,transaction_template:items"
              slot="panel-1"
              page="foxy-subscriptions-table"
            >
            </foxy-collection-pages>
          </x-tabs>
        </section>
      </article>
    `;
  }

  render(): TemplateResult {
    const { state, lang } = this;
    const ns = CustomerElement.__ns;

    return html`
      <div>
        <foxy-form-dialog
          header="add_attribute"
          parent=${state.context.data?._links['fx:attributes'].href ?? ''}
          form="foxy-attribute-form"
          lang=${lang}
          ns=${ns}
          id="new-attribute-form-dialog"
        >
        </foxy-form-dialog>

        <foxy-form-dialog
          header="add_address"
          parent=${state.context.data?._links['fx:customer_addresses'].href ?? ''}
          form="foxy-address-form"
          lang=${lang}
          ns=${ns}
          id="new-address-form-dialog"
        >
        </foxy-form-dialog>

        <x-confirm-dialog
          message="delete_message"
          confirm="delete_yes"
          cancel="delete_no"
          header="delete"
          theme="primary error"
          lang=${lang}
          ns=${ns}
          id="confirm"
          @submit=${() => this.send({ type: 'DELETE' })}
        >
        </x-confirm-dialog>

        ${state.matches('fail')
          ? html`<x-error-screen></x-error-screen>`
          : state.matches('busy')
          ? html`<x-loading-screen></x-loading-screen>`
          : state.matches({ idle: 'template' })
          ? html`<x-error-screen type="not_found"></x-error-screen>`
          : this.renderIdle()}
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__removeBreakpoints?.();
  }

  private __formatDate(date: Date, lang = this.lang): string {
    try {
      return date.toLocaleDateString(lang, {
        month: 'long',
        year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
        day: 'numeric',
      });
    } catch {
      return this.__formatDate(date, I18NElement.fallbackLng);
    }
  }

  private __getPropertyTableItems() {
    const errors = this.state.context.errors;
    const data = this.state.context.data;

    if (!data) return [];

    const firstPurchase = {
      name: this.__t('first_purchase'),
      value: this.__formatDate(new Date(data.date_created)),
    };

    const lastLogin = {
      name: this.__t('last_login'),
      value: this.__formatDate(new Date(data.last_login_date)),
    };

    const email = {
      name: this.__t('email'),
      value: data.email,
      invalid: errors.some(err => err.startsWith('email')),
      editable: true,
      onInput: (email: string) => this.send({ type: 'EDIT', data: { email } }),
    };

    const firstName = {
      name: this.__t('first_name'),
      value: data.first_name,
      invalid: errors.some(err => err.startsWith('first_name')),
      editable: true,
      onInput: (first_name: string) => this.send({ type: 'EDIT', data: { first_name } }),
    };

    const lastName = {
      name: this.__t('last_name'),
      value: data.last_name,
      invalid: errors.some(err => err.startsWith('last_name')),
      editable: true,
      onInput: (last_name: string) => this.send({ type: 'EDIT', data: { last_name } }),
    };

    const taxID = {
      name: this.__t('tax_id'),
      value: data.tax_id,
      invalid: errors.some(err => err.startsWith('tax_id')),
      editable: true,
      onInput: (tax_id: string) => this.send({ type: 'EDIT', data: { tax_id } }),
    };

    return [firstName, lastName, email, taxID, lastLogin, firstPurchase];
  }

  private get __t() {
    return I18NElement.i18next.getFixedT(this.lang, CustomerElement.__ns);
  }

  private get __confirmDialog() {
    return this.renderRoot.querySelector('#confirm') as ConfirmDialogElement;
  }

  private get __newAddressFormDialog() {
    return this.renderRoot.querySelector('#new-address-form-dialog') as FormDialogElement;
  }

  private get __newAttributeFormDialog() {
    return this.renderRoot.querySelector('#new-attribute-form-dialog') as FormDialogElement;
  }
}
