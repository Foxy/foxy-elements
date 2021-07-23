import { Attributes, CustomerAddresses, Data, Tab, Templates } from './types';
import { CSSResultArray, TemplateResult, html } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';

import { Data as Attribute } from '../AttributeCard/types';
import { ButtonElement } from '@vaadin/vaadin-button';
import { Column } from '../Table/types';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data as CustomerAddress } from '../AddressCard/types';
import { FormDialog } from '../FormDialog/FormDialog';
import { Group } from '../../private/index';
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
      'foxy-transactions-table': customElements.get('foxy-transactions-table'),
      'foxy-collection-pages': customElements.get('foxy-collection-pages'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-attribute-card': customElements.get('foxy-attribute-card'),
      'foxy-address-card': customElements.get('foxy-address-card'),
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-table': customElements.get('foxy-table'),
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-group': Group,
      'x-tabs': Tabs,
    };
  }

  static get styles(): CSSResultArray {
    return [super.styles, styles];
  }

  templates: Templates = {};

  // #region header

  private readonly __renderHeaderActionsEdit = () => {
    const { readonlySelector, disabledSelector, hiddenSelector } = this;

    const actionId = 'header:actions:edit';
    const formId = 'header:actions:edit:form';
    const dialogId = 'customer-dialog';

    const isLoaded = this.in({ idle: 'snapshot' });
    const isEditActionDisabled = !isLoaded || disabledSelector.matches(actionId, true);

    return html`
      ${this.renderTemplateOrSlot('header:actions:edit:before')}

      <foxy-form-dialog
        data-testid="header:actions:edit:form"
        header="update"
        parent=${this.parent}
        group=${this.group}
        href=${this.href}
        form="foxy-customer-form"
        lang=${this.lang}
        ns=${this.ns}
        id=${dialogId}
        readonlycontrols=${readonlySelector.zoom(formId).toString()}
        disabledcontrols=${disabledSelector.zoom(formId).toString()}
        hiddencontrols=${hiddenSelector.zoom(formId).toString()}
        .templates=${this.getNestedTemplates('header:actions:edit:form')}
      >
      </foxy-form-dialog>

      <vaadin-button
        data-testid="header:actions:edit"
        aria-label=${this.t('update').toString()}
        class="px-xs rounded-full"
        theme="icon"
        ?disabled=${isEditActionDisabled}
        @click=${(evt: Event) => {
          const dialog = this.renderRoot.querySelector(`#${dialogId}`) as FormDialog;
          dialog.show(evt.currentTarget as HTMLElement);
        }}
      >
        <iron-icon icon="editor:mode-edit"></iron-icon>
      </vaadin-button>

      ${this.renderTemplateOrSlot('header:actions:edit:after')}
    `;
  };

  private readonly __renderHeaderActions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('header:actions');

    return html`
      <div class="flex" data-testid="header:actions">
        ${this.renderTemplateOrSlot('header:actions:before')}
        ${hiddenSelector.matches('edit', true) ? '' : this.__renderHeaderActionsEdit()}
        ${this.renderTemplateOrSlot('header:actions:after')}
      </div>
    `;
  };

  private readonly __renderHeader = () => {
    const variant = ifDefined(this.in('busy') ? undefined : 'static');

    return html`
      ${this.renderTemplateOrSlot('header:before')}

      <header
        class="flex items-center justify-between space-x-m pb-s border-b border-contrast-10"
        data-testid="header"
      >
        <h1 class="text-xxl font-bold truncate min-w-0 flex-1">
          ${this.in({ idle: 'snapshot' })
            ? html`${this.data.first_name} ${this.data.last_name}`
            : html`<x-skeleton class="w-full" variant=${variant}>&nbsp;</x-skeleton>`}
        </h1>

        ${this.hiddenSelector.matches('header:actions', true) ? '' : this.__renderHeaderActions()}
      </header>

      ${this.renderTemplateOrSlot('header:after')}
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
      ${this.renderTemplateOrSlot('addresses:actions:create:before')}

      <vaadin-button
        data-testid="addresses:actions:create"
        aria-label=${this.t('create').toString()}
        class="px-xs rounded-full"
        theme="small icon"
        ?disabled=${isDisabled}
        @click=${(evt: Event) => {
          if (data === null) return;
          const button = evt.target as HTMLButtonElement;
          const dialog = button.firstElementChild as FormDialog;
          dialog.show(button);
        }}
      >
        <foxy-form-dialog
          readonlycontrols=${readonlySelector.zoom('create:form').toString()}
          disabledcontrols=${disabledSelector.zoom('create:form').toString()}
          hiddencontrols=${hiddenSelector.zoom('create:form').toString()}
          data-testid="addresses:actions:create:form"
          parent=${data?._links['fx:customer_addresses'].href ?? ''}
          header="create"
          group=${this.group}
          form="foxy-address-form"
          lang=${lang}
          ns=${ns}
          id="address-dialog"
          .templates=${this.getNestedTemplates('addresses:actions:create:form')}
        >
        </foxy-form-dialog>

        <iron-icon slot="suffix" icon="icons:add"></iron-icon>
      </vaadin-button>

      ${this.renderTemplateOrSlot('addresses:actions:create:after')}
    `;
  };

  private readonly __renderAddressesActions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('addresses:actions');

    return html`
      <div data-testid="addresses:actions">
        ${this.renderTemplateOrSlot('addresses:actions:before')}
        ${hiddenSelector.matches('create', true) ? '' : this.__renderAddressesActionsCreate()}
        ${this.renderTemplateOrSlot('addresses:actions:after')}
      </div>
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
      'snap-start text-left p-m rounded-t-l rounded-b-l flex-shrink-0': true,
      'border border-contrast-10': true,
      'hover-border-contrast-30 focus-outline-none focus-border-primary': ctx.data !== null,
    });

    const isReadonly = this.readonlySelector.matches('addresses:list:card', true);
    const isDisabled = this.disabledSelector.matches('addresses:list:card', true);

    return html`
      <button
        data-testclass="addresses:list:card"
        class=${computedClass}
        ?disabled=${!ctx.data || isReadonly || isDisabled}
        @click=${handleClick}
      >
        <foxy-address-card
          hiddencontrols=${ctx.hiddenControls.toString()}
          parent=${ctx.parent}
          class="w-tile"
          group=${ctx.group}
          lang=${ctx.lang}
          href=${ctx.href}
          ns="${ctx.ns} ${customElements.get('foxy-address-card')?.defaultNS ?? ''}"
          .templates=${ctx.templates}
        >
        </foxy-address-card>
      </button>
    `;
  };

  private readonly __renderAddressesListPage: PageRenderer<CustomerAddresses> = ctx => {
    return ctx.html`
      <foxy-collection-page
        hiddencontrols=${ctx.hiddenControls.toString()}
        class="space-x-m flex"
        group=${ctx.group}
        lang=${ctx.lang}
        href=${ctx.href}
        ns=${ctx.ns}
        .item=${this.__renderAddressesListCard}
        .templates=${ctx.templates}
      >
      </foxy-collection-page>
    `;
  };

  private readonly __renderAddressesList = () => {
    const formId = 'addresses:list:form';
    const cardId = 'addresses:list:card';

    return html`
      ${this.renderTemplateOrSlot('addresses:list:before')}

      <foxy-form-dialog
        readonlycontrols=${this.readonlySelector.zoom(formId).toString()}
        disabledcontrols=${this.disabledSelector.zoom(formId).toString()}
        hiddencontrols=${this.hiddenSelector.zoom(formId).toString()}
        data-testid="addresses:list:form"
        parent=${this.data?._links['fx:customer_addresses'].href ?? ''}
        header="update"
        group=${this.group}
        form="foxy-address-form"
        lang=${this.lang}
        ns=${this.ns}
        id="addresses-list-form"
        .templates=${this.getNestedTemplates(formId)}
      >
      </foxy-form-dialog>

      <foxy-collection-pages
        hiddencontrols=${this.hiddenSelector.zoom(cardId).toString()}
        data-testid="addresses:list"
        first=${this.data?._links['fx:customer_addresses'].href ?? ''}
        class="snap-x-mandatory flex items-center space-x-m overflow-auto"
        group=${this.group}
        lang=${this.lang}
        ns=${this.ns}
        .page=${this.__renderAddressesListPage}
        .templates=${this.getNestedTemplates(cardId)}
      >
      </foxy-collection-pages>

      ${this.renderTemplateOrSlot('addresses:list:after')}
    `;
  };

  private readonly __renderAddresses = () => {
    const { lang, ns } = this;
    const hiddenSelector = this.hiddenSelector.zoom('addresses');

    return html`
      ${this.renderTemplateOrSlot('addresses:before')}

      <section class="pt-m" data-testid="addresses">
        <header class="space-x-m flex items-center mb-s">
          <h2 class="text-m font-semibold">
            <foxy-i18n ns=${ns} lang=${lang} key="address_plural"></foxy-i18n>
          </h2>

          ${hiddenSelector.matches('actions', true) ? '' : this.__renderAddressesActions()}
        </header>

        ${hiddenSelector.matches('list', true) ? '' : this.__renderAddressesList()}
      </section>

      ${this.renderTemplateOrSlot('addresses:after')}
    `;
  };

  // #endregion

  // #region payment-methods

  private readonly __renderPaymentMethodsList = () => {
    const cardId = 'payment-methods:list:card';

    return html`
      <div data-testid="payment-methods:list">
        ${this.renderTemplateOrSlot('payment-methods:list:before')}

        <foxy-payment-method-card
          readonlycontrols=${this.readonlySelector.zoom(cardId).toString()}
          disabledcontrols=${this.disabledSelector.zoom(cardId).toString()}
          hiddencontrols=${this.hiddenSelector.zoom(cardId).toString()}
          data-testid=${cardId}
          group=${this.group}
          class="w-payment-method-card border-radius-overflow-fix rounded-t-l rounded-b-l overflow-hidden"
          href=${this.data?._links['fx:default_payment_method'].href ?? ''}
          lang=${this.lang}
          ns="${this.ns} ${customElements.get('foxy-payment-method-card')?.defaultNS ?? ''}"
          .templates=${this.getNestedTemplates(cardId)}
        >
        </foxy-payment-method-card>

        ${this.renderTemplateOrSlot('payment-methods:list:after')}
      </div>
    `;
  };

  private readonly __renderPaymentMethods = () => {
    const hiddenSelector = this.hiddenSelector.zoom('payment-methods');

    return html`
      ${this.renderTemplateOrSlot('payment-methods:before')}

      <div class="pt-m" data-testid="payment-methods">
        <h2 class="text-m font-semibold mb-s">
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

      ${this.renderTemplateOrSlot('payment-methods:after')}
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
      ${this.renderTemplateOrSlot('attributes:actions:create:before')}

      <vaadin-button
        data-testid="attributes:actions:create"
        aria-label=${this.t('create').toString()}
        class="px-xs rounded-full"
        theme="small icon"
        ?disabled=${isDisabled}
        @click=${(evt: Event) => {
          if (data === null) return;
          const button = evt.target as HTMLButtonElement;
          const dialog = button.firstElementChild as FormDialog;
          dialog.show(button);
        }}
      >
        <foxy-form-dialog
          readonlycontrols=${readonlySelector.zoom('create:form').toString()}
          disabledcontrols=${disabledSelector.zoom('create:form').toString()}
          hiddencontrols=${hiddenSelector.zoom('create:form').toString()}
          data-testid="attributes:actions:create:form"
          parent=${data?._links['fx:attributes'].href ?? ''}
          header="create"
          group=${this.group}
          form="foxy-attribute-form"
          lang=${lang}
          ns=${ns}
          .templates=${this.getNestedTemplates('attributes:actions:create:form')}
        >
        </foxy-form-dialog>

        <iron-icon slot="suffix" icon="icons:add"></iron-icon>
      </vaadin-button>

      ${this.renderTemplateOrSlot('attributes:actions:create:after')}
    `;
  };

  private readonly __renderAttributesActions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('attributes:actions');

    return html`
      <div data-testid="attributes:actions">
        ${this.renderTemplateOrSlot('attributes:actions:before')}
        ${hiddenSelector.matches('create', true) ? '' : this.__renderAttributesActionsCreate()}
        ${this.renderTemplateOrSlot('attributes:actions:after')}
      </div>
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
      'snap-start text-left p-m rounded-t-l rounded-b-l flex-shrink-0 border border-contrast-10':
        true,
      'hover-border-contrast-30 focus-outline-none focus-border-primary': ctx.data !== null,
    });

    return ctx.html`
      <button 
        data-testclass="attributes:list:card"
        class=${computedClass}
        ?disabled=${ctx.data === null}
        @click=${handleClick}
      >
        <foxy-attribute-card
          hiddencontrols=${ctx.hiddenControls.toString()}
          parent=${ctx.parent}
          group=${ctx.group}
          class="w-tile"
          lang=${ctx.lang}
          href=${ctx.href}
          ns="${ctx.ns} ${customElements.get('foxy-attribute-card')?.defaultNS ?? ''}"
          .templates=${ctx.templates}
        >
        </foxy-attribute-card>
      </button>
    `;
  };

  private readonly __renderAttributesListPage: PageRenderer<Attributes> = ctx => {
    return html`
      <foxy-collection-page
        hiddencontrols=${ctx.hiddenControls.toString()}
        class="space-x-m flex"
        group=${ctx.group}
        lang=${ctx.lang}
        href=${ctx.href}
        ns=${ctx.ns}
        .item=${this.__renderAttributesListCard}
        .templates=${ctx.templates}
      >
      </foxy-collection-page>
    `;
  };

  private readonly __renderAttributesList = () => {
    const formId = 'attributes:list:form';
    const cardId = 'attributes:list:card';

    return html`
      ${this.renderTemplateOrSlot('attributes:list:before')}

      <foxy-form-dialog
        readonlycontrols=${this.readonlySelector.zoom(formId).toString()}
        disabledcontrols=${this.disabledSelector.zoom(formId).toString()}
        hiddencontrols=${this.hiddenSelector.zoom(formId).toString()}
        data-testclass="i18n"
        data-testid="attributes:list:form"
        parent=${this.data?._links['fx:attributes'].href ?? ''}
        header="update"
        group=${this.group}
        form="foxy-attribute-form"
        lang=${this.lang}
        ns=${this.ns}
        id="attributes-list-form"
        .templates=${this.getNestedTemplates(formId)}
      >
      </foxy-form-dialog>

      <foxy-collection-pages
        hiddencontrols=${this.hiddenControls.zoom(cardId).toString()}
        data-testid="attributes:list"
        first=${this.data?._links['fx:attributes'].href ?? ''}
        class="snap-x-mandatory flex items-center space-x-m overflow-auto"
        group=${this.group}
        lang=${this.lang}
        ns=${this.ns}
        .page=${this.__renderAttributesListPage}
        .templates=${this.getNestedTemplates(cardId)}
      >
      </foxy-collection-pages>

      ${this.renderTemplateOrSlot('attributes:list:after')}
    `;
  };

  private readonly __renderAttributes = () => {
    const { lang, ns } = this;
    const hiddenSelector = this.hiddenSelector.zoom('attributes');

    return html`
      ${this.renderTemplateOrSlot('attributes:before')}

      <section class="pt-m" data-testid="attributes">
        <header class="space-x-m flex items-center mb-s">
          <h2 class="text-m font-semibold">
            <foxy-i18n ns=${ns} lang=${lang} key="attribute_plural"></foxy-i18n>
          </h2>

          ${hiddenSelector.matches('actions', true) ? '' : this.__renderAttributesActions()}
        </header>

        ${hiddenSelector.matches('list', true) ? '' : this.__renderAttributesList()}
      </section>

      ${this.renderTemplateOrSlot('attributes:after')}
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
      ${this.renderTemplateOrSlot('transactions:before')}

      <x-group frame>
        <foxy-collection-pages
          data-testid="transactions"
          spinner="foxy-spinner"
          first=${transactionsLink}
          class="divide-y divide-contrast-10 block mx-m"
          group=${this.group}
          page="foxy-transactions-table"
          lang=${this.lang}
          ns=${this.ns}
          .templates=${this.getNestedTemplates('transactions:table')}
        >
        </foxy-collection-pages>
      </x-group>

      ${this.renderTemplateOrSlot('transactions:after')}
    `;
  };

  // #endregion

  // #region subscriptions

  private readonly __subscriptionsTableColumns: Column<Subscriptions>[] = [
    SubscriptionsTable.priceColumn,
    SubscriptionsTable.summaryColumn,
    SubscriptionsTable.statusColumn,
    {
      cell: ({ html, lang, data }) => html`
        <vaadin-button
          data-testclass="edit"
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
      <foxy-table
        data-testclass="subscriptions:pages:table"
        group=${ctx.group}
        href=${ctx.href}
        lang=${ctx.lang}
        ns=${ctx.ns}
        .columns=${this.__subscriptionsTableColumns}
        .templates=${ctx.templates}
      >
      </foxy-table>
    `;
  };

  private readonly __renderSubscriptions = () => {
    const formId = 'subscriptions:form';
    let subscriptionsLink = '';

    if (this.in({ idle: 'snapshot' })) {
      const subscriptionsURL = new URL(this.data._links['fx:subscriptions'].href);
      subscriptionsURL.searchParams.set('zoom', 'last_transaction,transaction_template:items');
      subscriptionsLink = subscriptionsURL.toString();
    }

    return html`
      <div data-testid="subscriptions">
        ${this.renderTemplateOrSlot('subscriptions:before')}

        <foxy-form-dialog
          readonlycontrols=${this.readonlySelector.zoom(formId).toString()}
          disabledcontrols=${this.disabledSelector.zoom(formId).toString()}
          hiddencontrols=${this.hiddenSelector.zoom(formId).toString()}
          data-testid=${formId}
          header="update"
          group=${this.group}
          form="foxy-subscription-form"
          lang=${this.lang}
          ns=${this.ns}
          id="subscriptions-form"
          .templates=${this.getNestedTemplates(formId)}
        >
        </foxy-form-dialog>

        <x-group frame>
          <foxy-collection-pages
            data-testid="subscriptions:pages"
            spinner="foxy-spinner"
            first=${subscriptionsLink}
            class="divide-y divide-contrast-10 block mx-m"
            group=${this.group}
            lang=${this.lang}
            ns=${this.ns}
            .page=${this.__renderSubscriptionsPage}
            .templates=${this.getNestedTemplates('subscriptions:table')}
          >
          </foxy-collection-pages>
        </x-group>

        ${this.renderTemplateOrSlot('subscriptions:after')}
      </div>
    `;
  };

  // #endregion

  // #region tabs

  private readonly __renderTabs = (tabs: Tab[]) => {
    return html`
      <div class="pt-m">
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
            'font-lumo text-body text-m leading-m space-y-s': true,
            'opacity-50': !isLoaded,
          })}
        >
          ${hiddenSelector.matches('header', true) ? '' : this.__renderHeader()}
          ${hiddenSelector.matches('default', true) ? '' : this.renderTemplateOrSlot()}
          ${hiddenSelector.matches('addresses', true) ? '' : this.__renderAddresses()}
          ${hiddenSelector.matches('payment-methods', true) ? '' : this.__renderPaymentMethods()}
          ${hiddenSelector.matches('attributes', true) ? '' : this.__renderAttributes()}
          ${tabs.length === 0 ? '' : this.__renderTabs(tabs)}
        </div>

        <div
          data-testid="spinner"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': isLoaded,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in('fail') ? 'error' : isBusy ? 'busy' : 'empty'}
            lang=${lang}
            ns="${ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
