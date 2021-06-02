import { TemplateResult, html } from 'lit-html';

import { API } from '../NucleonElement/API';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { Customer } from '../Customer/Customer';
import { FormDialog } from '..';
import { FormRendererContext } from '../FormDialog/types';
import { ItemRenderer } from '../CollectionPage/types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PageRenderer } from '../CollectionPages/types';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';
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

  private readonly __renderSubscriptions = () => {
    const extendedHiddenControlsArray = [
      this.hiddenSelector.zoom('customer:subscriptions:form').toString(),
      'end-date',
    ];

    return html`
      <foxy-form-dialog
        readonlycontrols=${this.readonlySelector.zoom('customer:subscriptions:form').toString()}
        disabledcontrols=${this.disabledSelector.zoom('customer:subscriptions:form').toString()}
        hiddencontrols=${extendedHiddenControlsArray.join(' ')}
        header="update"
        lang=${this.lang}
        ns=${this.ns}
        id="subscription-dialog"
        .form=${this.__renderSubscriptionsForm}
      >
      </foxy-form-dialog>

      ${this._renderTemplateOrSlot('customer:subscriptions:before')}

      <div class="space-y-m pt-m border-t-4 border-contrast-5">
        <foxy-i18n
          class="block text-l font-medium tracking-wide"
          lang=${this.lang}
          key="subscription_plural"
          ns=${this.ns}
        >
        </foxy-i18n>

        <foxy-collection-pages
          class="block space-y-m"
          first=${this.__activeSubscriptionsLink}
          group=${this.group}
          lang=${this.lang}
          manual
          .page=${this.__renderSubscriptionsPage}
        >
        </foxy-collection-pages>
      </div>

      ${this._renderTemplateOrSlot('customer:subscriptions:after')}
    `;
  };

  private readonly __renderTransactions = () => {
    const customer = this.__customerElement;

    let transactionsLink = '';

    if (customer?.in({ idle: 'snapshot' })) {
      const transactionsURL = new URL(customer.data._links['fx:transactions'].href);
      transactionsURL.searchParams.set('zoom', 'items');
      transactionsLink = transactionsURL.toString();

      if ('fx:sub_token_url' in customer.data._links) {
        const link = customer.data._links['fx:sub_token_url'].href;
        const cancelURL = new URL(link);
        cancelURL.searchParams.set('sub_cancel', 'true');
      }
    }

    return html`
      ${this._renderTemplateOrSlot('customer:transactions:before')}

      <div class="space-y-m pt-m border-t-4 border-contrast-5">
        <foxy-i18n
          class="text-l font-medium tracking-wide"
          ns=${this.ns}
          key="transaction_plural"
          lang=${this.lang}
        >
        </foxy-i18n>

        <foxy-collection-pages
          spinner="foxy-spinner"
          first=${transactionsLink}
          class="block divide-y divide-contrast-10 px-m border border-contrast-10 rounded-t-l rounded-b-l"
          page="foxy-transactions-table"
          lang=${this.lang}
          manual
        >
        </foxy-collection-pages>
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
      <div class="ml-m flex">
        ${this._renderTemplateOrSlot(`${scope}:before`)}

        <vaadin-button
          class="px-xs rounded-full flex"
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
                  class="m-auto"
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

    return html`
      ${this._renderTemplateOrSlot('customer:before')}

      <foxy-customer
        readonlycontrols=${this.readonlySelector.zoom('customer').toString()}
        disabledcontrols=${this.disabledSelector.zoom('customer').toString()}
        hiddencontrols=${extendedHiddenControlsArray.join(' ')}
        href=${this.customer}
        lang=${this.lang}
        id="customer"
        .templates=${this._getNestedTemplates('customer')}
        @update=${() => this.requestUpdate()}
      >
        <div slot="header:actions:after">
          ${hiddenSelector.matches('header:actions:sign-out', true)
            ? ''
            : this.__renderHeaderActionsSignOut()}
        </div>

        <div slot="header:after" class="space-y-l mt-m">
          ${hiddenSelector.matches('subscriptions', true) ? '' : this.__renderSubscriptions()}
          ${hiddenSelector.matches('transactions', true) ? '' : this.__renderTransactions()}
        </div>
      </foxy-customer>

      ${this._renderTemplateOrSlot('customer:after')}
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
