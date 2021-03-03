import { CSSResultArray, TemplateResult, html } from 'lit-element';
import { PropertyTable, Skeleton, Tabs } from '../../private/index';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';

import { Data } from './types';
import { FormDialog } from '../FormDialog/FormDialog';
import { NucleonElement } from '../NucleonElement/index';
import { Themeable } from '../../../mixins/themeable';
import { addBreakpoints } from '../../../utils/add-breakpoints';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { styles } from './styles';

export class Customer extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-payment-method-card': customElements.get('foxy-payment-method-card'),
      'foxy-subscriptions-table': customElements.get('foxy-subscriptions-table'),
      'foxy-transactions-table': customElements.get('foxy-transactions-table'),
      'foxy-collection-pages': customElements.get('foxy-collection-pages'),
      'foxy-attribute-card': customElements.get('foxy-attribute-card'),
      'foxy-address-card': customElements.get('foxy-address-card'),
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'x-property-table': PropertyTable,
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-tabs': Tabs,
    };
  }

  static get styles(): CSSResultArray {
    return [Themeable.styles, styles];
  }

  private static __ns = 'customer';

  private __untrackTranslations?: () => void;

  private __removeBreakpoints?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__removeBreakpoints = addBreakpoints(this);
    this.__untrackTranslations = customElements
      .get('foxy-i18n')
      .onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const ns = Customer.__ns;
    const variant = ifDefined(this.in('busy') ? undefined : 'static');

    const transactionsURL = this.in({ idle: 'snapshot' })
      ? `${this.data?._links['fx:transactions'].href}&zoom=items`
      : '';

    const subscriptionsURL = this.in({ idle: 'snapshot' })
      ? `${this.data?._links['fx:subscriptions'].href}&zoom=last_transaction,transaction_template:items`
      : '';

    return html`
      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="attributeDialog"
        parent=${this.data?._links['fx:attributes'].href ?? ''}
        form="foxy-attribute-form"
        lang=${this.lang}
        ns=${ns}
        id="attribute-dialog"
      >
      </foxy-form-dialog>

      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="addressDialog"
        parent=${this.data?._links['fx:customer_addresses'].href ?? ''}
        form="foxy-address-form"
        lang=${this.lang}
        ns=${ns}
        id="address-dialog"
      >
      </foxy-form-dialog>

      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="customerDialog"
        header="update"
        href=${this.href}
        form="foxy-customer-form"
        lang=${this.lang}
        ns=${ns}
        id="customer-dialog"
      >
      </foxy-form-dialog>

      <div class="relative" data-testid="wrapper" aria-busy=${this.in('busy')} aria-live="polite">
        <article
          class=${classMap({
            'font-lumo text-body text-m leading-m space-y-xl': true,
            'opacity-50': !this.in({ idle: 'snapshot' }),
          })}
        >
          <header class="flex items-center justify-between space-x-m">
            <div class="leading-s min-w-0 flex-1">
              <h1 class="tracking-wide text-xxl font-semibold truncate" data-testid="name">
                ${this.in({ idle: 'snapshot' })
                  ? html`${this.data.first_name} ${this.data.last_name}`
                  : html`<x-skeleton class="w-full" variant=${variant}>&nbsp;</x-skeleton>`}
              </h1>
            </div>

            <vaadin-button
              data-testid="edit"
              class="px-xs rounded-full"
              theme="icon large"
              aria-label=${this.__t('update').toString()}
              ?disabled=${!this.in({ idle: 'snapshot' })}
              @click=${this.__editCustomer}
            >
              <iron-icon icon="editor:mode-edit"></iron-icon>
            </vaadin-button>
          </header>

          <x-property-table .items=${this.__getPropertyTableItems()}></x-property-table>

          <section class="space-y-m">
            <header class="space-x-m flex items-center justify-between md:justify-start">
              <h2 class="tracking-wide text-xl font-medium">
                <foxy-i18n ns=${ns} lang=${this.lang} key="address_plural" data-testclass="i18n">
                </foxy-i18n>
              </h2>

              <vaadin-button
                data-testid="addAddress"
                class="px-xs rounded-full"
                theme="icon"
                aria-label=${this.__t('add').toString()}
                ?disabled=${!this.in({ idle: 'snapshot' })}
                @click=${this.__addAddress}
              >
                <iron-icon icon="icons:add"></iron-icon>
              </vaadin-button>
            </header>

            <foxy-collection-pages
              data-testclass="i18n"
              data-testid="addresses"
              spinner="foxy-spinner"
              first=${this.data?._links['fx:customer_addresses'].href ?? ''}
              class="h-scroll flex items-center space-x-m overflow-auto"
              page="foxy-collection-page"
              item="foxy-address-card"
              lang=${this.lang}
              @click=${this.__handleAddressesClick}
            >
            </foxy-collection-pages>
          </section>

          <section class="space-y-m">
            <h2 class="tracking-wide text-xl font-medium">
              <foxy-i18n
                ns=${ns}
                lang=${this.lang}
                key="payment_method_plural"
                data-testclass="i18n"
              >
              </foxy-i18n>
            </h2>

            <foxy-payment-method-card
              data-testclass="i18n"
              data-testid="paymentMethod"
              class="rounded-t-l rounded-b-l overflow-hidden"
              href=${this.data?._links['fx:default_payment_method'].href ?? ''}
              lang=${this.lang}
            >
            </foxy-payment-method-card>
          </section>

          <section class="space-y-m">
            <header class="space-x-m flex items-center justify-between md:justify-start">
              <h2 class="tracking-wide text-xl font-medium">
                <foxy-i18n ns=${ns} lang=${this.lang} key="attribute_plural" data-testclass="i18n">
                </foxy-i18n>
              </h2>

              <vaadin-button
                data-testid="addAttribute"
                class="px-xs rounded-full"
                theme="icon"
                aria-label=${this.__t('add_attribute').toString()}
                ?disabled=${!this.in({ idle: 'snapshot' })}
                @click=${this.__addAttribute}
              >
                <iron-icon icon="icons:add"></iron-icon>
              </vaadin-button>
            </header>

            <foxy-collection-pages
              data-testclass="i18n"
              data-testid="attributes"
              spinner="foxy-spinner"
              first=${this.data?._links['fx:attributes'].href ?? ''}
              class="h-scroll flex items-center space-x-m overflow-auto"
              page="foxy-collection-page"
              item="foxy-attribute-card"
              lang=${this.lang}
              @click=${this.__handleAttributesClick}
            >
            </foxy-collection-pages>
          </section>

          <section class="space-y-m">
            <x-tabs size="2" ?disabled=${!this.in({ idle: 'snapshot' })}>
              <foxy-i18n
                ns=${ns}
                key="transaction_plural"
                lang=${this.lang}
                slot="tab-0"
                data-testclass="i18n"
              >
              </foxy-i18n>

              <foxy-i18n
                ns=${ns}
                key="subscription_plural"
                lang=${this.lang}
                slot="tab-1"
                data-testclass="i18n"
              >
              </foxy-i18n>

              <foxy-collection-pages
                data-testclass="i18n"
                data-testid="transactions"
                spinner="foxy-spinner"
                first=${transactionsURL}
                slot="panel-0"
                page="foxy-transactions-table"
                lang=${this.lang}
              >
              </foxy-collection-pages>

              <foxy-collection-pages
                data-testclass="i18n"
                data-testid="subscriptions"
                spinner="foxy-spinner"
                first=${subscriptionsURL}
                slot="panel-1"
                page="foxy-subscriptions-table"
                lang=${this.lang}
              >
              </foxy-collection-pages>
            </x-tabs>
          </section>
        </article>

        ${this.in({ idle: 'snapshot' })
          ? html``
          : html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  data-testclass="i18n"
                  data-testid="topSpinner"
                  layout="vertical"
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  state=${this.in('busy') ? 'busy' : 'error'}
                  lang=${this.lang}
                >
                </foxy-spinner>
              </div>
            `}
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
    this.__removeBreakpoints?.();
  }

  private __getPropertyTableItems() {
    return [
      {
        name: this.__t('email'),
        value: this.data ? this.data.email : '',
      },
      {
        name: this.__t('tax_id'),
        value: this.data ? this.data.tax_id : '',
      },
      {
        name: this.__t('last_login_date'),
        value: this.data ? this.__t('date', { value: new Date(this.data.last_login_date) }) : '',
      },
      {
        name: this.__t('date_created'),
        value: this.data ? this.__t('date', { value: new Date(this.data.date_created) }) : '',
      },
    ];
  }

  private get __t() {
    return customElements.get('foxy-i18n').i18next.getFixedT(this.lang, Customer.__ns);
  }

  private get __editDialog() {
    return this.renderRoot.querySelector('#customer-dialog') as FormDialog;
  }

  private get __addressDialog() {
    return this.renderRoot.querySelector('#address-dialog') as FormDialog;
  }

  private get __attributeDialog() {
    return this.renderRoot.querySelector('#attribute-dialog') as FormDialog;
  }

  private __editCustomer(evt: Event) {
    this.__editDialog.show(evt.currentTarget as HTMLElement);
  }

  private __addAddress(evt: Event) {
    this.__addressDialog.header = 'create';
    this.__addressDialog.href = '';
    this.__addressDialog.show(evt.currentTarget as HTMLElement);
  }

  private __addAttribute(evt: Event) {
    this.__attributeDialog.header = 'create';
    this.__attributeDialog.href = '';
    this.__attributeDialog.show(evt.currentTarget as HTMLElement);
  }

  private __handleAddressesClick(evt: Event) {
    if (!(evt.target instanceof NucleonElement)) return;
    this.__addressDialog.header = 'update';
    this.__addressDialog.href = evt.target.href;
    this.__addressDialog.show();
  }

  private __handleAttributesClick(evt: Event) {
    if (!(evt.target instanceof NucleonElement)) return;
    this.__attributeDialog.header = 'update';
    this.__attributeDialog.href = evt.target.href;
    this.__attributeDialog.show();
  }
}
