import { TemplateResult, html } from 'lit-html';

import { API } from '../NucleonElement/API';
import { ConfigurableMixin } from '../../../mixins/configurable';
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
import { Templates } from './types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

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

  private readonly __renderSubscriptionsForm = (ctx: FormRendererContext) => {
    const customer = this.__customerElement;

    let updateBillingLink = '';
    let updateItemsLink = '';
    let cancelLink = '';

    if (customer?.in({ idle: 'snapshot' })) {
      const link = (customer.data._links['fx:sub_token_url'] as any).href as string;
      const cancelURL = new URL(link);
      const updateBillingURL = new URL(link);

      cancelURL.searchParams.set('sub_cancel', 'true');
      cancelLink = cancelURL.toString();

      updateBillingURL.searchParams.set('cart', 'checkout');
      updateBillingURL.searchParams.set('sub_restart', 'auto');
      updateBillingLink = updateBillingURL.toString();

      updateItemsLink = (customer.data._links['fx:sub_modification_url'] as any).href as string;
    }

    return html`
      <foxy-subscription-form
        disabledcontrols=${ctx.dialog.disabledControls.toString()}
        readonlycontrols=${ctx.dialog.readonlyControls.toString()}
        hiddencontrols="end-button ${ctx.dialog.hiddenControls.toString()}"
        settings=${JSON.stringify(this.data)}
        parent=${ctx.dialog.parent}
        lang=${ctx.dialog.lang}
        href=${ctx.dialog.href}
        id="form"
        ?disabled=${ctx.dialog.disabled}
        ?readonly=${ctx.dialog.readonly}
        ?hidden=${ctx.dialog.hidden}
        @update=${ctx.handleUpdate}
        @fetch=${ctx.handleFetch}
      >
        <div slot="header:after" class="space-x-s flex mt-s pt-xs border-t border-contrast-10">
          <a
            class="flex-auto font-medium tracking-wide cursor-pointer text-secondary text-s rounded-s hover-text-primary focus-text-primary focus-outline-none focus-ring-2 focus-ring-primary-50 focus-ring-offset-2"
            href=${updateBillingLink}
            rel="nofollow noopener"
          >
            <iron-icon icon="icons:credit-card" class="icon-inline"></iron-icon>
            <foxy-i18n key="update_billing" lang=${ctx.dialog.lang}></foxy-i18n>
          </a>

          <a
            class="flex-auto text-right font-medium tracking-wide cursor-pointer text-secondary text-s rounded-s hover-text-primary focus-text-primary focus-outline-none focus-ring-2 focus-ring-tertiary-50 focus-ring-offset-2"
            href=${cancelLink}
            rel="nofollow noopener"
          >
            <iron-icon icon="icons:block" class="icon-inline"></iron-icon>
            <foxy-i18n lang=${ctx.dialog.lang} key="end_subscription"></foxy-i18n>
          </a>
        </div>

        <a
          class="flex-auto text-right font-medium tracking-wide cursor-pointer text-primary text-s rounded-s hover-text-primary-50 focus-outline-none focus-ring-2 focus-ring-tertiary-50 focus-ring-offset-2"
          slot="items:actions:after"
          href=${updateItemsLink}
          rel="nofollow noopener"
        >
          <foxy-i18n key="update_items" lang=${ctx.dialog.lang}></foxy-i18n>
        </a>
      </foxy-subscription-form>
    `;
  };

  private readonly __renderSubscriptionsPageItem: ItemRenderer = ({ html, ...ctx }) => {
    return html`
      <button
        class=${classMap({
          'block w-full border border-contrast-10 p-m rounded-t-l rounded-b-l focus-outline-none focus-border-primary':
            true,
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
      ${this._renderTemplateOrSlot('customer:subscriptions:header:before')}

      <foxy-i18n
        class="block text-l font-medium tracking-wide"
        lang=${this.lang}
        key="subscription_plural"
        ns=${this.ns}
      >
      </foxy-i18n>

      ${this._renderTemplateOrSlot('customer:subscriptions:header:after')}
    `;
  };

  private readonly __renderSubscriptionsList = () => {
    const disabledSelector = this.disabledSelector.zoom('customer:subscriptions:list');
    const readonlySelector = this.readonlySelector.zoom('customer:subscriptions:list');
    const hiddenSelector = this.hiddenSelector.zoom('customer:subscriptions:list');
    const extendedHiddenControlsArray = [hiddenSelector.zoom('form').toString(), 'end-date'];

    return html`
      ${this._renderTemplateOrSlot('customer:subscriptions:list:before')}

      <foxy-form-dialog
        readonlycontrols=${readonlySelector.zoom('form').toString()}
        disabledcontrols=${disabledSelector.zoom('form').toString()}
        hiddencontrols=${extendedHiddenControlsArray.join(' ').trim()}
        header="update"
        group=${this.group}
        lang=${this.lang}
        ns=${this.ns}
        id="subscription-dialog"
        .form=${this.__renderSubscriptionsForm}
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

      ${this._renderTemplateOrSlot('customer:subscriptions:list:after')}
    `;
  };

  private readonly __renderSubscriptions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('customer:subscriptions');

    return html`
      ${this._renderTemplateOrSlot('customer:subscriptions:before')}

      <div class="space-y-m pt-m border-t-4 border-contrast-5" data-testid="subscriptions">
        ${hiddenSelector.matches('header', true) ? '' : this.__renderSubscriptionsHeader()}
        ${hiddenSelector.matches('list', true) ? '' : this.__renderSubscriptionsList()}
      </div>

      ${this._renderTemplateOrSlot('customer:subscriptions:after')}
    `;
  };

  private readonly __renderTransactionsHeader = () => {
    return html`
      <div>
        ${this._renderTemplateOrSlot('customer:transactions:header:before')}

        <foxy-i18n
          class="text-l font-medium tracking-wide"
          lang=${this.lang}
          key="transaction_plural"
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this._renderTemplateOrSlot('customer:transactions:header:after')}
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
        ${this._renderTemplateOrSlot('customer:transactions:list:before')}

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

        ${this._renderTemplateOrSlot('customer:transactions:list:after')}
      </div>
    `;
  };

  private readonly __renderTransactions = () => {
    const hiddenSelector = this.hiddenSelector.zoom('customer:transactions');

    return html`
      ${this._renderTemplateOrSlot('customer:transactions:before')}

      <div class="space-y-m pt-m border-t-4 border-contrast-5" data-testid="transactions">
        ${hiddenSelector.matches('header') ? '' : this.__renderTransactionsHeader()}
        ${hiddenSelector.matches('list') ? '' : this.__renderTransactionsList()}
      </div>

      ${this._renderTemplateOrSlot('customer:transactions:after')}
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
        ${this._renderTemplateOrSlot(`${scope}:before`)}

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

        ${this._renderTemplateOrSlot(`${scope}:after`)}
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

    const templates: CustomerTemplates = this._getNestedTemplates('customer');
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
