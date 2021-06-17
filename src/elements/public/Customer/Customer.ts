import { Backend, Core } from '@foxy.io/sdk';
import { CSSResultArray, TemplateResult, html } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Skeleton, Tabs } from '../../private';

import { Data as Attribute } from '../AttributeCard/types';
import { Column } from '../Table/types';
import { Data as CustomerAddress } from '../AddressCard/types';
import { Data } from './types';
import { FormDialog } from '../FormDialog';
import { ItemRenderer } from '../CollectionPage/types';
import { NucleonElement } from '../NucleonElement';
import { PageRenderer } from '../CollectionPages/types';
import { Data as Subscriptions } from '../SubscriptionsTable/types';
import { SubscriptionsTable } from '../SubscriptionsTable';
import { Themeable } from '../../../mixins/themeable';
import { addBreakpoints } from '../../../utils/add-breakpoints';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { styles } from './styles';

type CustomerAddresses = Core.Resource<Backend.Rels.CustomerAddresses>;
type Attributes = Core.Resource<Backend.Rels.Attributes>;

export class Customer extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-address-card': customElements.get('foxy-address-card'),
      'foxy-attribute-card': customElements.get('foxy-attribute-card'),
      'foxy-collection-pages': customElements.get('foxy-collection-pages'),
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'foxy-payment-method-card': customElements.get('foxy-payment-method-card'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-subscriptions-table': customElements.get('foxy-subscriptions-table'),
      'foxy-transactions-table': customElements.get('foxy-transactions-table'),
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': customElements.get('vaadin-button'),
      'x-skeleton': Skeleton,
      'x-tabs': Tabs,
    };
  }

  static get styles(): CSSResultArray {
    return [Themeable.styles, styles];
  }

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
      class="snap-start text-left p-m rounded-t-l rounded-b-m md-rounded flex-shrink-0 border border-contrast-10 hover-border-contrast-30 focus-outline-none focus-border-primary"
      @click=${(evt: Event) => {
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
      class="snap-start text-left p-m rounded-t-l rounded-b-m md-rounded flex-shrink-0 border border-contrast-10 hover-border-contrast-30 focus-outline-none focus-border-primary"
      @click=${(evt: Event) => {
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
      ? `${this.data?._links['fx:transactions'].href}&zoom=items&limit=10`
      : '';

    const subscriptionsURL = this.in({ idle: 'snapshot' })
      ? `${this.data?._links['fx:subscriptions'].href}&zoom=last_transaction,transaction_template:items&limit=10`
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
        div="update"
        href=${this.href}
        form="foxy-customer-form"
        lang=${this.lang}
        ns=${ns}
        id="customer-dialog"
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
      >
      </foxy-form-dialog>

      <div class="relative" data-testid="wrapper" aria-busy=${this.in('busy')} aria-live="polite">
        <div
          class=${classMap({
            'font-lumo text-body text-m leading-m space-y-l': true,
            'opacity-50': !this.in({ idle: 'snapshot' }),
          })}
        >
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
          </div>

          <div class="flex flex-col md-flex-row">
            <div
              class="flex-1 min-w-0 space-y-m border-contrast-10 rounded-t-l rounded-b-l md-border md-p-m"
            >
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

                <vaadin-button
                  data-testid="addAttribute"
                  theme="small"
                  ?disabled=${!this.in({ idle: 'snapshot' })}
                  @click=${this.__addAttribute}
                >
                  <foxy-i18n lang=${this.lang} ns=${ns} key="create"></foxy-i18n>
                  <iron-icon slot="suffix" icon="icons:add"></iron-icon>
                </vaadin-button>
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

            <div class="mt-l md-mt-0 md-ml-l">
              <h2 class="tracking-wide text-l font-medium mb-m md-sr-only">
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
              >
              </foxy-payment-method-card>
            </div>
          </div>

          <div class="space-y-m border-contrast-10 rounded-t-l rounded-b-l md-border md-p-m">
            <div class="space-x-m flex items-center justify-between">
              <h2 class="tracking-wide text-l font-medium">
                <foxy-i18n ns=${ns} lang=${this.lang} key="address_plural" data-testclass="i18n">
                </foxy-i18n>
              </h2>

              <vaadin-button
                data-testid="addAddress"
                theme="small"
                ?disabled=${!this.in({ idle: 'snapshot' })}
                @click=${this.__addAddress}
              >
                <foxy-i18n lang=${this.lang} ns=${ns} key="create"></foxy-i18n>
                <iron-icon slot="suffix" icon="icons:add"></iron-icon>
              </vaadin-button>
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

          <div
            class="space-y-m rounded-t-l rounded-b-l border-contrast-10 md-border md-px-m md-pt-m"
          >
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
                lang=${this.lang}
                .page=${this.__renderSubscriptionsPage}
              >
              </foxy-collection-pages>
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
    this.__removeBreakpoints?.();
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
