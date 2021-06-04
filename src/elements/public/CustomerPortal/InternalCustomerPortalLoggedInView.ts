import { ConfigurableMixin, Renderer } from '../../../mixins/configurable';
import { TemplateResult, html } from 'lit-html';

import { API } from '../NucleonElement/API';
import { Customer } from '../Customer/Customer';
import { Templates as CustomerTemplates } from '../Customer/types';
import { FormDialog } from '..';
import { FormRendererContext } from '../FormDialog/types';
import { ItemRenderer } from '../CollectionPage/types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PageRenderer } from '../CollectionPages/types';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';
import { SubscriptionForm } from '../SubscriptionForm';
import { Templates } from './types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

const NS = 'customer-portal';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)));
type Data = Resource<Rels.CustomerPortalSettings>;

export class InternalCustomerPortalLoggedInView extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      customer: { type: String },
      loggingOutState: { attribute: false },
      loggingOutStateResetTimeout: { attribute: false },
    };
  }

  templates: Templates = {};

  customer = '';

  loggingOutState: 'idle' | 'busy' | 'fail' = 'idle';

  loggingOutStateResetTimeout: NodeJS.Timeout | null = null;

  private readonly __renderSubscriptionsFormHeaderActionsUpdate: Renderer<SubscriptionForm> = (
    html,
    host
  ) => {
    const customer = this.__customerElement;
    let billingLink = '';

    if (customer?.in({ idle: 'snapshot' })) {
      const link = (customer.data._links['fx:sub_token_url'] as any).href as string;

      const updateBillingURL = new URL(link);

      updateBillingURL.searchParams.set('cart', 'checkout');
      updateBillingURL.searchParams.set('sub_restart', 'auto');
      billingLink = updateBillingURL.toString();
    }

    return html`
      ${host.renderTemplateOrSlot('header:actions:update:before')}

      <foxy-internal-customer-portal-link href=${billingLink} icon="icons:credit-card">
        <foxy-i18n lang=${host.lang} key="update_billing"></foxy-i18n>
      </foxy-internal-customer-portal-link>

      ${host.renderTemplateOrSlot('header:actions:update:after')}
    `;
  };

  private readonly __renderSubscriptionsFormHeaderActionsEnd: Renderer<SubscriptionForm> = (
    html,
    host
  ) => {
    const customer = this.__customerElement;
    let cancelLink = '';

    if (customer?.in({ idle: 'snapshot' })) {
      const link = (customer.data._links['fx:sub_token_url'] as any).href as string;
      const cancelURL = new URL(link);

      cancelURL.searchParams.set('sub_cancel', 'true');
      cancelLink = cancelURL.toString();
    }

    return html`
      ${host.renderTemplateOrSlot('header:actions:end:before')}

      <foxy-internal-customer-portal-link href=${cancelLink} icon="icons:block">
        <foxy-i18n lang=${host.lang} key="end_subscription"></foxy-i18n>
      </foxy-internal-customer-portal-link>

      ${host.renderTemplateOrSlot('header:actions:end:after')}
    `;
  };

  private readonly __renderSubscriptionsFormHeaderActions: Renderer<SubscriptionForm> = (
    html,
    host
  ) => {
    const isUpdateActionHidden = host.hiddenSelector.matches('header:actions:update');
    const isEndActionHidden = host.hiddenSelector.matches('header:actions:end');

    return html`
      <style>
        main {
          display: flex;
          justify-content: space-between;
          padding-top: var(--lumo-space-xs);
          margin-top: var(--lumo-space-s);
          border-top: 1px solid var(--lumo-contrast-10pct);
          color: var(--lumo-secondary-color);
        }
      </style>

      ${host.renderTemplateOrSlot('header:actions:before')}

      <main>
        ${isUpdateActionHidden ? '' : this.__renderSubscriptionsFormHeaderActionsUpdate(html, host)}
        ${isEndActionHidden ? '' : this.__renderSubscriptionsFormHeaderActionsEnd(html, host)}
      </main>

      ${host.renderTemplateOrSlot('header:actions:after')}
    `;
  };

  private readonly __renderSubscriptionsFormItemsActionsUpdate: Renderer<SubscriptionForm> = (
    html,
    host
  ) => {
    const customer = this.__customerElement;
    let itemsLink = '';

    if (customer?.in({ idle: 'snapshot' })) {
      itemsLink = customer.data._links['fx:sub_modification_url'].href;
    }

    return html`
      ${host.renderTemplateOrSlot('items:actions:update:before')}

      <foxy-internal-customer-portal-link class="text-primary" href=${itemsLink}>
        <foxy-i18n lang=${host.lang} key="update_items"></foxy-i18n>
      </foxy-internal-customer-portal-link>

      ${host.renderTemplateOrSlot('items:actions:update:after')}
    `;
  };

  private readonly __renderSubscriptionsForm = (ctx: FormRendererContext) => {
    const templates = { ...ctx.dialog.templates };
    const originalHeaderAfterRenderer = templates['header:after'];
    const originalItemsActionsAfterRenderer = templates['items:actions:after'];

    templates['header:after'] = (html, host) => {
      const actionsHidden = host.hiddenSelector.matches('header:actions', true);
      return html`
        ${actionsHidden ? '' : this.__renderSubscriptionsFormHeaderActions(html, host)}
        ${originalHeaderAfterRenderer?.(html, host)}
      `;
    };

    templates['items:actions:after'] = (html, host) => {
      const updateHidden = host.hiddenSelector.matches('items:actions:update', true);
      return html`
        ${updateHidden ? '' : this.__renderSubscriptionsFormItemsActionsUpdate(html, host)}
        ${originalItemsActionsAfterRenderer?.(html, host)}
      `;
    };

    return html`
      <foxy-subscription-form
        disabledcontrols=${ctx.dialog.disabledControls.toString()}
        readonlycontrols=${ctx.dialog.readonlyControls.toString()}
        hiddencontrols=${ctx.dialog.hiddenControls.toString()}
        settings=${JSON.stringify(this.data)}
        parent=${ctx.dialog.parent}
        group=${ctx.dialog.group}
        lang=${ctx.dialog.lang}
        href=${ctx.dialog.href}
        id="form"
        .templates=${templates}
        @update=${ctx.handleUpdate}
        @fetch=${ctx.handleFetch}
      >
      </foxy-subscription-form>
    `;
  };

  private readonly __renderSubscriptionsPageItem: ItemRenderer = ({ html, ...ctx }) => {
    return html`
      <button
        class=${classMap({
          'block w-full border border-contrast-10 p-m rounded-t-l rounded-b-l': true,
          'focus-outline-none focus-border-primary': true,
          'hover-border-contrast-30': ctx.data !== null,
        })}
        ?disabled=${ctx.data === null}
        @click=${(evt: Event) => {
          const url = new URL(ctx.href);
          url.searchParams.set('zoom', 'last_transaction,transaction_template:items');
          this.__subscriptionDialog.href = url.toString();
          this.__subscriptionDialog.show(evt.currentTarget as HTMLButtonElement);
        }}
      >
        <foxy-subscription-card
          parent=${ctx.parent}
          group=${ctx.group}
          lang=${ctx.lang}
          href=${ctx.href}
        >
        </foxy-subscription-card>
      </button>
    `;
  };

  private readonly __renderSubscriptionsPage: PageRenderer<any> = ({ html, ...ctx }) => {
    return html`
      <foxy-collection-page
        href=${ctx.href}
        lang=${ctx.lang}
        group=${ctx.group}
        class="space-y-m"
        .item=${this.__renderSubscriptionsPageItem}
      >
      </foxy-collection-page>
    `;
  };

  private readonly __renderSubscriptionsHeader = () => {
    return html`
      ${this.renderTemplateOrSlot('customer:subscriptions:header:before')}

      <foxy-i18n
        class="block text-l font-medium tracking-wide"
        lang=${this.lang}
        key="subscription_plural"
        ns=${this.ns}
      >
      </foxy-i18n>

      ${this.renderTemplateOrSlot('customer:subscriptions:header:after')}
    `;
  };

  private readonly __renderSubscriptionsList = () => {
    const disabledSelector = this.disabledSelector.zoom('customer:subscriptions:list');
    const readonlySelector = this.readonlySelector.zoom('customer:subscriptions:list');
    const hiddenSelector = this.hiddenSelector.zoom('customer:subscriptions:list');
    const extendedHiddenControlsArray = [hiddenSelector.zoom('form').toString(), 'end-date'];

    return html`
      ${this.renderTemplateOrSlot('customer:subscriptions:list:before')}

      <foxy-form-dialog
        readonlycontrols=${readonlySelector.zoom('form').toString()}
        disabledcontrols=${disabledSelector.zoom('form').toString()}
        hiddencontrols=${extendedHiddenControlsArray.join(' ').trim()}
        header="update"
        parent=${ifDefined(this.__customerElement?.data?._links['fx:subscriptions'].href)}
        group=${this.group}
        lang=${this.lang}
        ns=${this.ns}
        id="subscription-dialog"
        .form=${this.__renderSubscriptionsForm}
        .templates=${this.getNestedTemplates('customer:subscriptions:list:form')}
      >
      </foxy-form-dialog>

      <foxy-collection-pages
        class="block space-y-m"
        first=${this.__activeSubscriptionsLink}
        group=${this.group}
        lang=${this.lang}
        manual
        .page=${this.__renderSubscriptionsPage}
      >
      </foxy-collection-pages>

      ${this.renderTemplateOrSlot('customer:subscriptions:list:after')}
    `;
  };

  private readonly __renderSubscriptions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('customer:subscriptions');

    return html`
      ${this.renderTemplateOrSlot('customer:subscriptions:before')}

      <div class="space-y-m pt-m border-t-4 border-contrast-5" data-testid="subscriptions">
        ${hiddenSelector.matches('header', true) ? '' : this.__renderSubscriptionsHeader()}
        ${hiddenSelector.matches('list', true) ? '' : this.__renderSubscriptionsList()}
      </div>

      ${this.renderTemplateOrSlot('customer:subscriptions:after')}
    `;
  };

  private readonly __renderTransactionsHeader = () => {
    return html`
      <div>
        ${this.renderTemplateOrSlot('customer:transactions:header:before')}

        <foxy-i18n
          class="text-l font-medium tracking-wide"
          lang=${this.lang}
          key="transaction_plural"
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('customer:transactions:header:after')}
      </div>
    `;
  };

  private readonly __renderTransactionsList = () => {
    const customer = this.__customerElement;

    let first = '';

    if (customer?.in({ idle: 'snapshot' })) {
      const firstURL = new URL(customer.data._links['fx:transactions'].href);
      firstURL.searchParams.set('zoom', 'items');
      first = firstURL.toString();
    }

    return html`
      <div>
        ${this.renderTemplateOrSlot('customer:transactions:list:before')}

        <foxy-collection-pages
          spinner="foxy-spinner"
          group=${this.group}
          first=${first}
          class="block divide-y divide-contrast-10 px-m border border-contrast-10 rounded-t-l rounded-b-l"
          page="foxy-transactions-table"
          lang=${this.lang}
          manual
        >
        </foxy-collection-pages>

        ${this.renderTemplateOrSlot('customer:transactions:list:after')}
      </div>
    `;
  };

  private readonly __renderTransactions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('customer:transactions');

    return html`
      ${this.renderTemplateOrSlot('customer:transactions:before')}

      <div class="space-y-m pt-m border-t-4 border-contrast-5" data-testid="transactions">
        ${hiddenSelector.matches('header') ? '' : this.__renderTransactionsHeader()}
        ${hiddenSelector.matches('list') ? '' : this.__renderTransactionsList()}
      </div>

      ${this.renderTemplateOrSlot('customer:transactions:after')}
    `;
  };

  private readonly __renderHeaderActionsSignOut = () => {
    const scope = 'customer:header:actions:sign-out';
    const state = this.loggingOutState;
    const isCustomerLoaded = !!this.__customerElement?.in({ idle: 'snapshot' });
    const handleClick = async () => {
      try {
        this.loggingOutState = 'busy';
        await new API(this).fetch('foxy://customer-api/session', { method: 'DELETE' });
        this.loggingOutState = 'idle';
      } catch {
        this.loggingOutState = 'fail';
        this.loggingOutStateResetTimeout = setTimeout(() => {
          this.loggingOutState = 'idle';
          this.loggingOutStateResetTimeout = null;
        }, 1000);
      }
    };

    return html`
      <div style="display: flex; margin-left: var(--lumo-space-m)">
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <vaadin-button
          data-testid="sign-out"
          aria-label=${this.t('sign_out').toString()}
          style="padding: var(--lumo-space-xs); margin: 0; border-radius: 100%; display: flex"
          theme="icon large"
          ?disabled=${this.disabledSelector.matches(scope) || !isCustomerLoaded || state !== 'idle'}
          @click=${handleClick}
        >
          ${state === 'idle'
            ? html`<iron-icon icon="icons:exit-to-app"></iron-icon>`
            : html`
                <foxy-spinner
                  layout="no-label"
                  state=${state === 'fail' ? 'error' : 'busy'}
                  style="margin: auto"
                  lang=${this.lang}
                  ns=${this.ns}
                >
                </foxy-spinner>
              `}
        </vaadin-button>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  };

  render(): TemplateResult {
    const hiddenSelector = this.hiddenSelector.zoom('customer');
    const extendedHiddenControlsArray = [
      hiddenSelector.toString(),
      'header:actions:edit:form:delete',
      'attributes',
      'transactions',
      'subscriptions',
      'addresses:actions:create',
      'payment-methods:list:card',
    ];

    const templates: CustomerTemplates = this.getNestedTemplates('customer');
    const originalHeaderActionsAfterTemplate = templates['header:actions:after'];

    templates['header:actions:after'] = (html, host) => {
      const isSignOutHidden = host.hiddenSelector.matches('header:actions:sign-out', true);
      return html`
        <div style="display:flex">
          ${isSignOutHidden ? '' : this.__renderHeaderActionsSignOut()}
          ${originalHeaderActionsAfterTemplate?.(html, host)}
        </div>
      `;
    };

    return html`
      <foxy-customer
        readonlycontrols=${this.readonlySelector.zoom('customer').toString()}
        disabledcontrols=${this.disabledSelector.zoom('customer').toString()}
        hiddencontrols=${extendedHiddenControlsArray.join(' ').trim()}
        data-testid="customer"
        group=${this.group}
        href=${this.customer}
        lang=${this.lang}
        id="customer"
        .templates=${templates}
        @update=${() => this.requestUpdate()}
      >
        <div class="space-y-l mt-m">
          ${hiddenSelector.matches('subscriptions', true) ? '' : this.__renderSubscriptions()}
          ${hiddenSelector.matches('transactions', true) ? '' : this.__renderTransactions()}
        </div>
      </foxy-customer>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.loggingOutStateResetTimeout) clearTimeout(this.loggingOutStateResetTimeout);
  }

  private get __customerElement() {
    return this.renderRoot.querySelector('#customer') as Customer | null;
  }

  private get __subscriptionDialog() {
    return this.renderRoot.querySelector('#subscription-dialog') as FormDialog;
  }

  private get __activeSubscriptionsLink() {
    try {
      const url = new URL(this.__customerElement!.data!._links['fx:subscriptions'].href);
      url.searchParams.set('zoom', 'last_transaction,transaction_template:items');
      url.searchParams.set('is_active', 'true');
      return url.toString();
    } catch {
      return '';
    }
  }
}
