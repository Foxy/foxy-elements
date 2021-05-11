import { Attributes, CustomerAddresses, Data, Tab } from './types';
import { CSSResultArray, TemplateResult, html } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';

import { Data as Attribute } from '../AttributeCard/types';
import { ButtonElement } from '@vaadin/vaadin-button';
import { Column } from '../Table/types';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data as CustomerAddress } from '../AddressCard/types';
import { FormDialog } from '../FormDialog/FormDialog';
import { ItemRenderer } from '../CollectionPage/types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PageRenderer } from '../CollectionPages/types';
import { Skeleton } from '../../private/Skeleton/Skeleton';
import { Data as Subscriptions } from '../SubscriptionsTable/types';
import { SubscriptionsTable } from '../SubscriptionsTable/SubscriptionsTable';
import { Tabs } from '../../private/Tabs/Tabs';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { styles } from './styles';

const NS = 'customer';
const Base = ScopedElementsMixin(
  ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement, NS)))
);

/**
 * All-in-one element for customer management.
 *
 * Configurable controls (new in v1.4.0):
 *
 * - `header`
 * - `header:actions`
 * - `header:actions:edit`
 * - `header:actions:edit:form` + any control in `foxy-customer-form`
 * - `addresses`
 * - `addresses:actions`
 * - `addresses:actions:create`
 * - `addresses:actions:create:form` + any control in `foxy-address-form`
 * - `addresses:list`
 * - `addresses:list:card` + any control in `foxy-address-card`
 * - `addresses:list:form` + any control in `foxy-address-form`
 * - `payment-methods`
 * - `payment-methods:list`
 * - `payment-methods:list:card` + any control in `foxy-payment-method-card`
 * - `attributes`
 * - `attributes:actions`
 * - `attributes:actions:create`
 * - `attributes:actions:create:form` + any control in `foxy-attribute-form`
 * - `attributes:list`
 * - `attributes:list:card` + any control in `foxy-attribute-card`
 * - `attributes:list:form` + any control in `foxy-attribute-form`
 * - `transactions`
 * - `subscriptions`
 * - `subscriptions:form` + any control in `foxy-subscriptions-form`
 *
 * @slot header:before - **new in v1.4.0**
 * @slot header:after - **new in v1.4.0**
 * @slot header:actions:before - **new in v1.4.0**
 * @slot header:actions:after - **new in v1.4.0**
 * @slot header:actions:edit:before - **new in v1.4.0**
 * @slot header:actions:edit:after - **new in v1.4.0**
 *
 * @slot addresses:before - **new in v1.4.0**
 * @slot addresses:after - **new in v1.4.0**
 * @slot addresses:actions:before - **new in v1.4.0**
 * @slot addresses:actions:after - **new in v1.4.0**
 * @slot addresses:actions:create:before - **new in v1.4.0**
 * @slot addresses:actions:create:after - **new in v1.4.0**
 * @slot addresses:list:before - **new in v1.4.0**
 * @slot addresses:list:after - **new in v1.4.0**
 *
 * @slot payment-methods:before - **new in v1.4.0**
 * @slot payment-methods:after - **new in v1.4.0**
 * @slot payment-methods:list:before - **new in v1.4.0**
 * @slot payment-methods:list:after - **new in v1.4.0**
 *
 * @slot attributes:before - **new in v1.4.0**
 * @slot attributes:after - **new in v1.4.0**
 * @slot attributes:actions:before - **new in v1.4.0**
 * @slot attributes:actions:after - **new in v1.4.0**
 * @slot attributes:actions:create:before - **new in v1.4.0**
 * @slot attributes:actions:create:after - **new in v1.4.0**
 * @slot attributes:list:before - **new in v1.4.0**
 * @slot attributes:list:after - **new in v1.4.0**
 *
 * @slot transactions:before - **new in v1.4.0**
 * @slot transactions:after - **new in v1.4.0**
 *
 * @slot subscriptions:before - **new in v1.4.0**
 * @slot subscriptions:after - **new in v1.4.0**
 *
 * @element foxy-customer
 * @since 1.2.0
 */
export class Customer extends Base<Data> {
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

  static get styles(): CSSResultArray {
    return [super.styles, styles];
  }

  // #region header

  private readonly __renderHeaderActionsEdit = () => {
    const { readonlySelector, disabledSelector, hiddenSelector } = this;

    const actionId = 'header:actions:edit';
    const formId = 'header:actions:edit:form';
    const dialogId = 'customer-dialog';

    const isLoaded = this.in({ idle: 'snapshot' });
    const isEditActionDisabled = !isLoaded || disabledSelector.matches(actionId, true);

    return html`
      <slot name="header:actions:edit:before"></slot>

      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="customerDialog"
        header="update"
        href=${this.href}
        form="foxy-customer-form"
        lang=${this.lang}
        ns=${this.ns}
        id=${dialogId}
        readonlycontrols=${readonlySelector.zoom(formId).toString()}
        disabledcontrols=${disabledSelector.zoom(formId).toString()}
        hiddencontrols=${hiddenSelector.zoom(formId).toString()}
      >
      </foxy-form-dialog>

      <vaadin-button
        data-testid="edit"
        aria-label=${this.t('update').toString()}
        class="px-xs rounded-full"
        theme="icon large"
        ?disabled=${isEditActionDisabled}
        @click=${(evt: Event) => {
          const dialog = this.renderRoot.querySelector(`#${dialogId}`) as FormDialog;
          dialog.show(evt.currentTarget as HTMLElement);
        }}
      >
        <iron-icon icon="editor:mode-edit"></iron-icon>
      </vaadin-button>

      <slot name="header:actions:edit:after"></slot>
    `;
  };

  private readonly __renderHeaderActions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('header:actions');

    return html`
      <slot name="header:actions:before"></slot>
      ${hiddenSelector.matches('edit', true) ? '' : this.__renderHeaderActionsEdit()}
      <slot name="header:actions:after"></slot>
    `;
  };

  private readonly __renderHeader = () => {
    const variant = ifDefined(this.in('busy') ? undefined : 'static');

    return html`
      <slot name="header:before"></slot>

      <header class="flex items-center justify-between space-x-m">
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

        ${this.hiddenSelector.matches('header:actions', true) ? '' : this.__renderHeaderActions()}
      </header>

      <slot name="header:after"></slot>
    `;
  };

  // #endregion

  // #region addresses

  private readonly __renderAddressesActionsCreate = () => {
    const { data, lang, ns } = this;

    const disabledSelector = this.disabledSelector.zoom('addresses:actions');
    const readonlySelector = this.readonlySelector.zoom('addresses:actions');
    const hiddenSelector = this.hiddenSelector.zoom('addresses:actions');

    const isLoaded = this.in({ idle: 'snapshot' });
    const isDisabled = !isLoaded || disabledSelector.matches('create', true);

    return html`
      <slot name="addresses:actions:create:before"></slot>

      <div>
        <vaadin-button
          data-testid="addAddress"
          class="w-full"
          theme="small"
          ?disabled=${isDisabled}
          @click=${(evt: Event) => {
            if (data === null) return;
            const button = evt.target as HTMLButtonElement;
            const dialog = button.firstElementChild as FormDialog;
            dialog.show(button);
          }}
        >
          ${isDisabled
            ? ''
            : html`
                <foxy-form-dialog
                  data-testclass="i18n"
                  data-testid="addressDialog"
                  parent=${data?._links['fx:customer_addresses'].href ?? ''}
                  form="foxy-address-form"
                  lang=${lang}
                  ns=${ns}
                  id="address-dialog"
                  readonlycontrols=${readonlySelector.zoom('create:form').toString()}
                  disabledcontrols=${disabledSelector.zoom('create:form').toString()}
                  hiddencontrols=${hiddenSelector.zoom('create:form').toString()}
                >
                </foxy-form-dialog>
              `}

          <foxy-i18n lang=${this.lang} ns=${this.ns} key="create"></foxy-i18n>
          <iron-icon slot="suffix" icon="icons:add"></iron-icon>
        </vaadin-button>
      </div>

      <slot name="addresses:actions:create:after"></slot>
    `;
  };

  private readonly __renderAddressesActions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('addresses:actions');

    return html`
      <slot name="addresses:actions:before"></slot>
      ${hiddenSelector.matches('create', true) ? '' : this.__renderAddressesActionsCreate()}
      <slot name="addresses:actions:after"></slot>
    `;
  };

  private readonly __renderAddressesListCard: ItemRenderer<CustomerAddress> = ctx => {
    const handleClick = (evt: Event) => {
      if (ctx.data === null) return;

      const button = evt.target as HTMLButtonElement;
      const root = button.getRootNode() as Element | DocumentFragment;
      const form = root.querySelector('#addresses-list-form') as FormDialog;

      form.href = ctx.data._links.self.href;
      form.show(button);
    };

    const computedClass = classMap({
      'snap-start text-left p-m rounded-t-l rounded-b-l flex-shrink-0 border border-contrast-10': true,
      'hover-border-contrast-30 focus-outline-none focus-border-primary': ctx.data !== null,
    });

    return html`
      <button ?disabled=${ctx.data === null} class=${computedClass} @click=${handleClick}>
        <foxy-address-card
          readonlycontrols=${ctx.readonlyControls.toString()}
          disabledcontrols=${ctx.readonlyControls.toString()}
          hiddencontrols=${ctx.hiddenControls.toString()}
          data-testclass="addressCards i18n"
          parent=${ctx.parent}
          class="w-tile"
          lang=${ctx.lang}
          href=${ctx.href}
          ?hidden=${ctx.hidden}
          ?readonly=${ctx.readonly}
          ?disabled=${ctx.disabled}
        >
        </foxy-address-card>
      </button>
    `;
  };

  private readonly __renderAddressesListPage: PageRenderer<CustomerAddresses> = ctx => {
    return ctx.html`
      <foxy-collection-page
        readonlycontrols=${ctx.readonlyControls.toString()}
        disabledcontrols=${ctx.readonlyControls.toString()}
        hiddencontrols=${ctx.hiddenControls.toString()}
        data-testclass="i18n"
        class="space-x-m flex"
        group=${ctx.group}
        lang=${ctx.lang}
        href=${ctx.href}
        ?hidden=${ctx.hidden}
        ?readonly=${ctx.readonly}
        ?disabled=${ctx.disabled}
        .item=${this.__renderAddressesListCard}
      >
      </foxy-collection-page>
    `;
  };

  private readonly __renderAddressesList = () => {
    const formId = 'addresses:list:form';
    const cardId = 'addresses:list:card';

    return html`
      <slot name="addresses:list:before"></slot>

      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="addressDialog"
        parent=${this.data?._links['fx:customer_addresses'].href ?? ''}
        header="update"
        form="foxy-address-form"
        lang=${this.lang}
        ns=${this.ns}
        id="addresses-list-form"
        readonlycontrols=${this.readonlySelector.zoom(formId).toString()}
        disabledcontrols=${this.disabledSelector.zoom(formId).toString()}
        hiddencontrols=${this.hiddenSelector.zoom(formId).toString()}
      >
      </foxy-form-dialog>

      <foxy-collection-pages
        readonlycontrols=${this.readonlySelector.zoom(cardId).toString()}
        disabledcontrols=${this.disabledSelector.zoom(cardId).toString()}
        hiddencontrols=${this.hiddenSelector.zoom(cardId).toString()}
        data-testclass="i18n"
        data-testid="addresses"
        first=${this.data?._links['fx:customer_addresses'].href ?? ''}
        class="snap-x-mandatory flex items-center space-x-m overflow-auto"
        group=${this.group}
        lang=${this.lang}
        .page=${this.__renderAddressesListPage}
      >
      </foxy-collection-pages>

      <slot name="addresses:list:after"></slot>
    `;
  };

  private readonly __renderAddresses = () => {
    const { lang, ns } = this;
    const hiddenSelector = this.hiddenSelector.zoom('addresses');

    return html`
      <slot name="addresses:before"></slot>

      <section class="pt-m border-t-4 border-contrast-5">
        <header class="space-x-m flex items-center mb-m">
          <h2 class="tracking-wide text-l font-medium flex-1">
            <foxy-i18n ns=${ns} lang=${lang} key="address_plural" data-testclass="i18n"></foxy-i18n>
          </h2>

          ${hiddenSelector.matches('actions', true) ? '' : this.__renderAddressesActions()}
        </header>

        ${hiddenSelector.matches('list', true) ? '' : this.__renderAddressesList()}
      </section>

      <slot name="addresses:after"></slot>
    `;
  };

  // #endregion

  // #region payment-methods

  private readonly __renderPaymentMethodsList = () => {
    const cardId = 'payment-methods:list:card';

    return html`
      <slot name="payment-methods:list:before"></slot>

      <foxy-payment-method-card
        data-testclass="i18n"
        data-testid="paymentMethod"
        class="w-payment-method-card border-radius-overflow-fix rounded-t-l rounded-b-l overflow-hidden"
        href=${this.data?._links['fx:default_payment_method'].href ?? ''}
        lang=${this.lang}
        readonlycontrols=${this.readonlySelector.zoom(cardId).toString()}
        disabledcontrols=${this.disabledSelector.zoom(cardId).toString()}
        hiddencontrols=${this.hiddenSelector.zoom(cardId).toString()}
      >
      </foxy-payment-method-card>

      <slot name="payment-methods:list:after"></slot>
    `;
  };

  private readonly __renderPaymentMethods = () => {
    const hiddenSelector = this.hiddenSelector.zoom('payment-methods');

    return html`
      <slot name="payment-methods:before"></slot>

      <div class="pt-m border-t-4 border-contrast-5">
        <h2 class="tracking-wide text-l font-medium mb-m">
          <foxy-i18n
            data-testclass="i18n"
            lang=${this.lang}
            key="payment_method_plural"
            ns=${this.ns}
          >
          </foxy-i18n>
        </h2>

        ${hiddenSelector.matches('list', true) ? '' : this.__renderPaymentMethodsList()}
      </div>

      <slot name="payment-methods:after"></slot>
    `;
  };

  // #endregion

  // #region attributes

  private readonly __renderAttributesActionsCreate = () => {
    const { data, lang, ns } = this;

    const disabledSelector = this.disabledSelector.zoom('attributes:actions');
    const readonlySelector = this.readonlySelector.zoom('attributes:actions');
    const hiddenSelector = this.hiddenSelector.zoom('attributes:actions');

    const isLoaded = this.in({ idle: 'snapshot' });
    const isDisabled = !isLoaded || disabledSelector.matches('create', true);

    return html`
      <slot name="attributes:actions:create:before"></slot>

      <div>
        <vaadin-button
          data-testid="addAttribute"
          class="w-full"
          theme="small"
          ?disabled=${isDisabled}
          @click=${(evt: Event) => {
            if (data === null) return;
            const button = evt.target as HTMLButtonElement;
            const dialog = button.firstElementChild as FormDialog;
            dialog.show(button);
          }}
        >
          <foxy-form-dialog
            data-testclass="i18n"
            data-testid="attributeDialog"
            parent=${data?._links['fx:attributes'].href ?? ''}
            form="foxy-attribute-form"
            lang=${lang}
            ns=${ns}
            readonlycontrols=${readonlySelector.zoom('create:form').toString()}
            disabledcontrols=${disabledSelector.zoom('create:form').toString()}
            hiddencontrols=${hiddenSelector.zoom('create:form').toString()}
          >
          </foxy-form-dialog>

          <foxy-i18n lang=${this.lang} ns=${this.ns} key="create"></foxy-i18n>
          <iron-icon slot="suffix" icon="icons:add"></iron-icon>
        </vaadin-button>
      </div>

      <slot name="attributes:actions:create:after"></slot>
    `;
  };

  private readonly __renderAttributesActions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('attributes:actions');

    return html`
      <slot name="attributes:actions:before"></slot>
      ${hiddenSelector.matches('create', true) ? '' : this.__renderAttributesActionsCreate()}
      <slot name="attributes:actions:after"></slot>
    `;
  };

  private readonly __renderAttributesListForm = () => {
    const formId = 'attributes:list:form';

    return html`
      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="attributeDialog"
        parent=${this.data?._links['fx:attributes'].href ?? ''}
        header="update"
        form="foxy-attribute-form"
        lang=${this.lang}
        ns=${this.ns}
        id="attributes-list-form"
        readonlycontrols=${this.readonlySelector.zoom(formId).toString()}
        disabledcontrols=${this.disabledSelector.zoom(formId).toString()}
        hiddencontrols=${this.hiddenSelector.zoom(formId).toString()}
      >
      </foxy-form-dialog>
    `;
  };

  private readonly __renderAttributesListCard: ItemRenderer<Attribute> = ctx => {
    const handleClick = (evt: Event) => {
      if (ctx.data === null) return;

      const button = evt.target as HTMLButtonElement;
      const root = button.getRootNode() as Element | DocumentFragment;
      const form = root.querySelector('#attributes-list-form') as FormDialog;

      form.href = ctx.data._links.self.href;
      form.show(button);
    };

    const computedClass = classMap({
      'snap-start text-left p-m rounded-t-l rounded-b-l flex-shrink-0 border border-contrast-10': true,
      'hover-border-contrast-30 focus-outline-none focus-border-primary': ctx.data !== null,
    });

    return ctx.html`
      <button ?disabled=${ctx.data === null} class=${computedClass} @click=${handleClick}>
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
  };

  private readonly __renderAttributesListPage: PageRenderer<Attributes> = ctx => {
    return html`
      <foxy-collection-page
        data-testclass="i18n"
        class="space-x-m flex"
        group=${ctx.group}
        lang=${ctx.lang}
        href=${ctx.href}
        .item=${this.__renderAttributesListCard}
      >
      </foxy-collection-page>
    `;
  };

  private readonly __renderAttributesList = () => {
    return html`
      <slot name="attributes:list:before"></slot>

      ${this.disabledSelector.matches('attributes:list', true)
        ? ''
        : this.__renderAttributesListForm()}

      <foxy-collection-pages
        data-testclass="i18n"
        data-testid="attributes"
        first=${this.data?._links['fx:attributes'].href ?? ''}
        class="snap-x-mandatory flex items-center space-x-m overflow-auto"
        group=${this.group}
        lang=${this.lang}
        .page=${this.__renderAttributesListPage}
      >
      </foxy-collection-pages>

      <slot name="attributes:list:after"></slot>
    `;
  };

  private readonly __renderAttributes = () => {
    const { lang, ns } = this;
    const hiddenSelector = this.hiddenSelector.zoom('attributes');

    return html`
      <slot name="attributes:before"></slot>

      <section class="pt-m border-t-4 border-contrast-5">
        <header class="space-x-m flex items-center mb-m">
          <h2 class="tracking-wide text-l font-medium flex-1">
            <foxy-i18n ns=${ns} lang=${lang} key="attribute_plural" data-testclass="i18n">
            </foxy-i18n>
          </h2>

          ${hiddenSelector.matches('actions', true) ? '' : this.__renderAttributesActions()}
        </header>

        ${hiddenSelector.matches('list', true) ? '' : this.__renderAttributesList()}
      </section>

      <slot name="attributes:after"></slot>
    `;
  };

  // #endregion

  // #region transactions

  private readonly __renderTransactions = () => {
    let transactionsLink = '';

    if (this.in({ idle: 'snapshot' })) {
      const transactionsURL = new URL(this.data._links['fx:transactions'].href);
      transactionsURL.searchParams.set('zoom', 'items');
      transactionsLink = transactionsURL.toString();
    }

    return html`
      <slot name="transactions:before"></slot>

      <foxy-collection-pages
        data-testclass="i18n"
        data-testid="transactions"
        spinner="foxy-spinner"
        first=${transactionsLink}
        class="divide-y divide-contrast-10"
        group=${this.group}
        page="foxy-transactions-table"
        lang=${this.lang}
      >
      </foxy-collection-pages>

      <slot name="transactions:after"></slot>
    `;
  };

  // #endregion

  // #region subscriptions

  private readonly __subscriptionsTableColumns: Column<Subscriptions>[] = [
    (customElements.get('foxy-subscriptions-table') as typeof SubscriptionsTable).priceColumn,
    (customElements.get('foxy-subscriptions-table') as typeof SubscriptionsTable).summaryColumn,
    (customElements.get('foxy-subscriptions-table') as typeof SubscriptionsTable).statusColumn,
    {
      cell: ({ html, lang, data }) => html`
        <vaadin-button
          theme="small tertiary-inline"
          @click=${(evt: Event) => {
            const link = new URL(data._links.self.href);
            const form = this.renderRoot.querySelector('#subscriptions-form') as FormDialog;
            const button = evt.target as ButtonElement;

            link.searchParams.set('zoom', 'last_transaction,transaction_template:items');
            form.href = link.toString();
            form.show(button);
          }}
        >
          <foxy-i18n class="text-s" lang=${lang} key="update" ns=${this.ns}></foxy-i18n>
        </vaadin-button>
      `,
    },
  ];

  private readonly __renderSubscriptionsPage: PageRenderer<Subscriptions> = ({ html, ...ctx }) => {
    return html`
      <foxy-subscriptions-table
        group=${ctx.group}
        href=${ctx.href}
        lang=${ctx.lang}
        .columns=${this.__subscriptionsTableColumns}
      >
      </foxy-subscriptions-table>
    `;
  };

  private readonly __renderSubscriptions = () => {
    let subscriptionsLink = '';

    if (this.in({ idle: 'snapshot' })) {
      const subscriptionsURL = new URL(this.data._links['fx:subscriptions'].href);
      subscriptionsURL.searchParams.set('zoom', 'last_transaction,transaction_template:items');
      subscriptionsLink = subscriptionsURL.toString();
    }

    return html`
      <slot name="subscriptions:before"></slot>

      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="subscriptionDialog"
        header="update"
        group=${this.group}
        form="foxy-subscription-form"
        lang=${this.lang}
        ns=${this.ns}
        id="subscriptions-form"
        readonlycontrols=${this.readonlySelector.zoom('subscriptions:form').toString()}
        disabledcontrols=${this.disabledSelector.zoom('subscriptions:form').toString()}
        hiddencontrols=${this.hiddenSelector.zoom('subscriptions:form').toString()}
      >
      </foxy-form-dialog>

      <foxy-collection-pages
        data-testclass="i18n"
        data-testid="subscriptions"
        spinner="foxy-spinner"
        first=${subscriptionsLink}
        class="divide-y divide-contrast-10"
        group=${this.group}
        lang=${this.lang}
        .page=${this.__renderSubscriptionsPage}
      >
      </foxy-collection-pages>

      <slot name="subscriptions:after"></slot>
    `;
  };

  // #endregion

  // #region tabs

  private readonly __renderTabs = (tabs: Tab[]) => {
    return html`
      <div class="pt-m border-t-4 border-contrast-5">
        <x-tabs size=${tabs.length} ?disabled=${!this.in({ idle: 'snapshot' })}>
          ${tabs.map(
            (tab, index) => html`
              <foxy-i18n
                data-testclass="i18n"
                slot="tab-${index}"
                lang=${this.lang}
                key=${tab.title}
                ns=${this.ns}
              >
              </foxy-i18n>

              <div slot="panel-${index}">${tab.content}</div>
            `
          )}
        </x-tabs>
      </div>
    `;
  };

  // #endregion

  render(): TemplateResult {
    const { hiddenSelector, lang, ns } = this;
    const isLoaded = this.in({ idle: 'snapshot' });
    const isBusy = this.in('busy');
    const tabs: Tab[] = [];

    if (!hiddenSelector.matches('transactions', true)) {
      tabs.push({ title: 'transaction_plural', content: this.__renderTransactions() });
    }

    if (!hiddenSelector.matches('subscriptions', true)) {
      tabs.push({ title: 'subscription_plural', content: this.__renderSubscriptions() });
    }

    return html`
      <div class="relative" data-testid="wrapper" aria-busy=${isBusy} aria-live="polite">
        <div
          class=${classMap({
            'font-lumo text-body text-m leading-m space-y-l': true,
            'opacity-50': !isLoaded,
          })}
        >
          ${hiddenSelector.matches('header', true) ? '' : this.__renderHeader()}
          ${hiddenSelector.matches('addresses', true) ? '' : this.__renderAddresses()}
          ${hiddenSelector.matches('payment-methods', true) ? '' : this.__renderPaymentMethods()}
          ${hiddenSelector.matches('attributes', true) ? '' : this.__renderAttributes()}
          ${tabs.length === 0 ? '' : this.__renderTabs(tabs)}
        </div>

        <div
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex items-center justify-center': true,
            'opacity-0 pointer-events-none': isLoaded,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in('fail') ? 'error' : isBusy ? 'busy' : 'empty'}
            lang=${lang}
            ns=${ns}
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
