import { Backend, Core } from '@foxy.io/sdk';
import { CSSResultArray, PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { Data, DisabledValue, ExcludedValue, ReadonlyValue } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Skeleton, Tabs } from '../../private/index';

import { Data as Attribute } from '../AttributeCard/types';
import { Column } from '../Table/types';
import { Data as CustomerAddress } from '../AddressCard/types';
import { FormDialog } from '../FormDialog/FormDialog';
import { ItemRenderer } from '../CollectionPage/CollectionPage';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PageRenderer } from '../CollectionPages/types';
import { Data as Subscriptions } from '../SubscriptionsTable/types';
import { SubscriptionsTable } from '../SubscriptionsTable/SubscriptionsTable';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { createDBCConverter } from '../../../utils/dbc-converter';
import { getDBCValue } from '../../../utils/filter-set';
import { ifDefined } from 'lit-html/directives/if-defined';
import { styles } from './styles';

type CustomerAddresses = Core.Resource<Backend.Rels.CustomerAddresses>;
type Attributes = Core.Resource<Backend.Rels.Attributes>;

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
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-tabs': Tabs,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      readonly: { reflect: true, converter: createDBCConverter('readonly') },
      disabled: { reflect: true, converter: createDBCConverter('disabled') },
      excluded: { reflect: true, converter: createDBCConverter('excluded') },
    };
  }

  static get styles(): CSSResultArray {
    return [Themeable.styles, styles];
  }

  readonly: ReadonlyValue = false;

  disabled: DisabledValue = false;

  excluded: ExcludedValue = false;

  private static __ns = 'customer';

  private __subscriptionsTableColumns: Column<Subscriptions>[] = [
    (customElements.get('foxy-subscriptions-table') as typeof SubscriptionsTable).priceColumn,
    (customElements.get('foxy-subscriptions-table') as typeof SubscriptionsTable).summaryColumn,
    (customElements.get('foxy-subscriptions-table') as typeof SubscriptionsTable).statusColumn,
    {
      cell: ctx => {
        const handleClick = () => {
          const url = new URL(ctx.data._links.self.href);
          url.searchParams.set('zoom', 'last_transaction');

          this.__subscriptionDialog.href = url.toString();
          this.__subscriptionDialog.show();
        };

        return ctx.html`
          <vaadin-button theme="small tertiary-inline" @click=${handleClick}>
            <foxy-i18n class="text-s" lang=${ctx.lang} key="update" ns=${Customer.__ns}></foxy-i18n>
          </vaadin-button>
        `;
      },
    },
  ];

  private __renderSubscriptionsPage: PageRenderer<Subscriptions> = ctx => ctx.html`
    <foxy-subscriptions-table
      href=${ctx.href}
      lang=${ctx.lang}
      .columns=${this.__subscriptionsTableColumns}
    >
    </foxy-subscriptions-table>
  `;

  private __renderAddressPageItem: ItemRenderer<CustomerAddress> = ctx => ctx.html`
    <button
      ?disabled=${ctx.data === null}
      class=${classMap({
        'snap-start text-left p-m rounded-t-l rounded-b-l flex-shrink-0 border border-contrast-10': true,
        'hover-border-contrast-30 focus-outline-none focus-border-primary': ctx.data !== null,
      })}
      @click=${(evt: Event) => {
        if (ctx.data === null) return;
        this.__addressDialog.header = 'update';
        this.__addressDialog.href = ctx.href;
        this.__addressDialog.show(evt.target as HTMLElement);
      }}
    >
      <foxy-address-card
        data-testclass="addressCards i18n"
        parent=${ctx.parent}
        class="w-tile"
        lang=${ctx.lang}
        href=${ctx.href}
      >
      </foxy-address-card>
    </button>
  `;

  private __renderAttributePageItem: ItemRenderer<Attribute> = ctx => ctx.html`
    <button
      ?disabled=${ctx.data === null}
      class=${classMap({
        'snap-start text-left p-m rounded-t-l rounded-b-l flex-shrink-0 border border-contrast-10': true,
        'hover-border-contrast-30 focus-outline-none focus-border-primary': ctx.data !== null,
      })}
      @click=${(evt: Event) => {
        if (ctx.data === null) return;
        this.__attributeDialog.header = 'update';
        this.__attributeDialog.href = ctx.href;
        this.__attributeDialog.show(evt.target as HTMLElement);
      }}
    >
      <foxy-attribute-card
        data-testclass="attributeCards i18n"
        parent=${ctx.parent}
        class="w-tile"
        lang=${ctx.lang}
        href=${ctx.href}
      >
      </foxy-attribute-card>
    </button>
  `;

  private __renderAddressPage: PageRenderer<CustomerAddresses> = ctx => ctx.html`
    <foxy-collection-page
      data-testclass="i18n"
      class="space-x-m flex"
      lang=${ctx.lang}
      href=${ctx.href}
      .item=${this.__renderAddressPageItem}
    >
    </foxy-collection-page>
  `;

  private __renderAttributePage: PageRenderer<Attributes> = ctx => ctx.html`
    <foxy-collection-page
      data-testclass="i18n"
      class="space-x-m flex"
      lang=${ctx.lang}
      href=${ctx.href}
      .item=${this.__renderAttributePageItem}
    >
    </foxy-collection-page>
  `;

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
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

    const isLoaded = this.in({ idle: 'snapshot' });

    return html`
      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="attributeDialog"
        parent=${this.data?._links['fx:attributes'].href ?? ''}
        form="foxy-attribute-form"
        lang=${this.lang}
        ns=${ns}
        id="attribute-dialog"
        .readonly=${getDBCValue(this.readonly, 'attributeForm')}
        .disabled=${getDBCValue(this.disabled, 'attributeForm')}
        .excluded=${getDBCValue(this.excluded, 'attributeForm')}
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
        .readonly=${getDBCValue(this.readonly, 'addressForm')}
        .disabled=${getDBCValue(this.disabled, 'addressForm')}
        .excluded=${getDBCValue(this.excluded, 'addressForm')}
      >
      </foxy-form-dialog>

      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="customerDialog"
        div="update"
        href=${this.href}
        form="foxy-customer-form"
        lang=${this.lang}
        ns=${ns}
        id="customer-dialog"
        .readonly=${getDBCValue(this.readonly, 'customerForm')}
        .disabled=${getDBCValue(this.disabled, 'customerForm')}
        .excluded=${getDBCValue(this.excluded, 'customerForm')}
      >
      </foxy-form-dialog>

      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="subscriptionDialog"
        div="update"
        form="foxy-subscription-form"
        lang=${this.lang}
        ns=${ns}
        id="subscription-dialog"
        .readonly=${getDBCValue(this.readonly, 'subscriptionForm')}
        .disabled=${getDBCValue(this.disabled, 'subscriptionForm')}
        .excluded=${getDBCValue(this.excluded, 'subscriptionForm')}
      >
      </foxy-form-dialog>

      <div class="relative" data-testid="wrapper" aria-busy=${this.in('busy')} aria-live="polite">
        <div
          class=${classMap({
            'font-lumo text-body text-m leading-m space-y-l': true,
            'opacity-50': !this.in({ idle: 'snapshot' }),
          })}
        >
          ${!getDBCValue(this.excluded, 'header')
            ? html`
                <div class="flex items-center justify-between space-x-m">
                  <div class="leading-s min-w-0 flex-1">
                    <h1 class="tracking-wide text-xl font-medium truncate" data-testid="name">
                      ${this.in({ idle: 'snapshot' })
                        ? html`${this.data.first_name} ${this.data.last_name}`
                        : html`<x-skeleton class="w-full" variant=${variant}>&nbsp;</x-skeleton>`}
                    </h1>

                    <p class="text-l text-secondary truncate" data-testid="email">
                      ${this.in({ idle: 'snapshot' })
                        ? html`${this.data.email}`
                        : html`<x-skeleton class="w-full" variant=${variant}>&nbsp;</x-skeleton>`}
                    </p>
                  </div>

                  <div><slot name="actions"></slot></div>

                  ${!getDBCValue(this.excluded, 'editButton')
                    ? html`
                        <vaadin-button
                          data-testid="edit"
                          class="px-xs rounded-full"
                          theme="icon large"
                          aria-label=${this.__t('update').toString()}
                          .disabled=${!isLoaded || getDBCValue(this.disabled, 'editButton')}
                          @click=${this.__editCustomer}
                        >
                          <iron-icon icon="editor:mode-edit"></iron-icon>
                        </vaadin-button>
                      `
                    : ''}
                </div>
              `
            : ''}
          <!---->
          ${!getDBCValue(this.excluded, 'addresses')
            ? html`
                <div class="space-y-m pt-m border-t-4 border-contrast-5">
                  <div class="space-x-m flex items-center justify-between">
                    <h2 class="tracking-wide text-l font-medium">
                      <foxy-i18n
                        ns=${ns}
                        lang=${this.lang}
                        key="address_plural"
                        data-testclass="i18n"
                      >
                      </foxy-i18n>
                    </h2>

                    ${!getDBCValue(this.excluded, 'createAddressButton')
                      ? html`
                          <vaadin-button
                            data-testid="addAddress"
                            theme="small"
                            .disabled=${!isLoaded ||
                            getDBCValue(this.disabled, 'createAddressButton')}
                            @click=${this.__addAddress}
                          >
                            <foxy-i18n lang=${this.lang} ns=${ns} key="create"></foxy-i18n>
                            <iron-icon slot="suffix" icon="icons:add"></iron-icon>
                          </vaadin-button>
                        `
                      : ''}
                  </div>

                  <foxy-collection-pages
                    data-testclass="i18n"
                    data-testid="addresses"
                    first=${this.data?._links['fx:customer_addresses'].href ?? ''}
                    class="snap-x-mandatory flex items-center space-x-m overflow-auto"
                    lang=${this.lang}
                    .page=${this.__renderAddressPage}
                  >
                  </foxy-collection-pages>
                </div>
              `
            : ''}
          <!----->
          ${!getDBCValue(this.excluded, 'paymentMethodCard')
            ? html`
                <div class="space-y-m pt-m border-t-4 border-contrast-5">
                  <h2 class="tracking-wide text-l font-medium">
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
                    class="w-payment-method-card rounded-t-l rounded-b-l overflow-hidden"
                    href=${this.data?._links['fx:default_payment_method'].href ?? ''}
                    lang=${this.lang}
                    .readonly=${getDBCValue(this.readonly, 'paymentMethodCard')}
                    .disabled=${getDBCValue(this.disabled, 'paymentMethodCard')}
                  >
                  </foxy-payment-method-card>
                </div>
              `
            : ''}
          <!---->
          ${!getDBCValue(this.excluded, 'attributes')
            ? html`
                <div class="space-y-m pt-m border-t-4 border-contrast-5">
                  <div class="space-x-m flex items-center justify-between">
                    <h2 class="tracking-wide text-l font-medium">
                      <foxy-i18n
                        ns=${ns}
                        lang=${this.lang}
                        key="attribute_plural"
                        data-testclass="i18n"
                      >
                      </foxy-i18n>
                    </h2>

                    ${!getDBCValue(this.excluded, 'createAttributeButton')
                      ? html`
                          <vaadin-button
                            data-testid="addAttribute"
                            theme="small"
                            .disabled=${!isLoaded ||
                            getDBCValue(this.disabled, 'createAttributeButton')}
                            @click=${this.__addAttribute}
                          >
                            <foxy-i18n lang=${this.lang} ns=${ns} key="create"></foxy-i18n>
                            <iron-icon slot="suffix" icon="icons:add"></iron-icon>
                          </vaadin-button>
                        `
                      : ''}
                  </div>

                  <foxy-collection-pages
                    data-testclass="i18n"
                    data-testid="attributes"
                    first=${this.data?._links['fx:attributes'].href ?? ''}
                    class="snap-x-mandatory flex items-center space-x-m overflow-auto"
                    lang=${this.lang}
                    .page=${this.__renderAttributePage}
                  >
                  </foxy-collection-pages>
                </div>
              `
            : ''}
          <!---->
          <div class="space-y-m pt-m border-t-4 border-contrast-5">
            <x-tabs size="2" ?disabled=${!this.in({ idle: 'snapshot' })}>
              ${!getDBCValue(this.excluded, 'transactions')
                ? html`
                    <foxy-i18n
                      ns=${ns}
                      key="transaction_plural"
                      lang=${this.lang}
                      slot="tab-0"
                      data-testclass="i18n"
                    >
                    </foxy-i18n>

                    <foxy-collection-pages
                      data-testclass="i18n"
                      data-testid="transactions"
                      spinner="foxy-spinner"
                      first=${transactionsURL}
                      class="divide-y divide-contrast-10"
                      slot="panel-0"
                      page="foxy-transactions-table"
                      lang=${this.lang}
                    >
                    </foxy-collection-pages>
                  `
                : ''}
              <!---->
              ${!getDBCValue(this.excluded, 'subscriptions')
                ? html`
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
                      data-testid="subscriptions"
                      spinner="foxy-spinner"
                      first=${subscriptionsURL}
                      class="divide-y divide-contrast-10"
                      slot="panel-1"
                      lang=${this.lang}
                      .page=${this.__renderSubscriptionsPage}
                    >
                    </foxy-collection-pages>
                  `
                : ''}
            </x-tabs>
          </div>
        </div>

        ${this.in({ idle: 'snapshot' })
          ? html``
          : html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  data-testclass="i18n"
                  data-testid="topSpinner"
                  layout="vertical"
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  state=${this.in('busy') ? 'busy' : this.in('idle') ? 'empty' : 'error'}
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

  private get __subscriptionDialog() {
    return this.renderRoot.querySelector('#subscription-dialog') as FormDialog;
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
}
