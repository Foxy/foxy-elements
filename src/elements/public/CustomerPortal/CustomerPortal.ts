import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';
import { Settings, State, machine } from './machine';

import { API } from '../NucleonElement/API';
import { AccessRecoveryForm } from '../AccessRecoveryForm/AccessRecoveryForm';
import { ComputedElementProperties } from './types';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { Customer } from '../Customer/Customer';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog/FormDialog';
import { FormRendererContext } from '../FormDialog/types';
import { ItemRenderer } from '../CollectionPage/types';
import { PageRenderer } from '../CollectionPages/types';
import { SignInForm } from '../SignInForm/SignInForm';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { interpret } from 'xstate';

const NS = 'customer-portal';
const Base = TranslatableMixin(ConfigurableMixin(ThemeableMixin(LitElement)), NS);

/**
 * Drop-in customer portal.
 *
 * Configurable controls:
 *
 * - `sign-in`
 * - `sign-in:header`
 * - `sign-in:email`
 * - `sign-in:password`
 * - `sign-in:error`
 * - `sign-in:submit`
 * - `sign-in:recover`
 *
 * - `access-recovery`
 * - `access-recovery:header`
 * - `access-recovery:email`
 * - `access-recovery:message`
 * - `access-recovery:submit`
 * - `access-recovery:back`
 *
 * - `customer`
 * - `customer:header`
 * - `customer:header:actions`
 * - `customer:header:actions:edit`
 * - `customer:header:actions:edit:form` + any control in `foxy-customer-form`
 * - `customer:header:actions:sign-out`
 * - `customer:addresses`
 * - `customer:addresses:actions`
 * - `customer:addresses:list`
 * - `customer:addresses:list:card` + any control in `foxy-address-card`
 * - `customer:addresses:list:form` + any control in `foxy-address-form`
 * - `customer:payment-methods`
 * - `customer:payment-methods:list`
 * - `customer:payment-methods:list:card` + any control in `foxy-payment-method-card`
 * - `customer:transactions`
 * - `customer:subscriptions`
 * - `customer:subscriptions:form` + any control in `foxy-subscriptions-form`
 *
 * @slot sign-in:before
 * @slot sign-in:after
 * @slot sign-in:header:before
 * @slot sign-in:header:after
 * @slot sign-in:email:before
 * @slot sign-in:email:after
 * @slot sign-in:password:before
 * @slot sign-in:password:after
 * @slot sign-in:error:before
 * @slot sign-in:error:after
 * @slot sign-in:submit:before
 * @slot sign-in:submit:after
 * @slot sign-in:back:before
 * @slot sign-in:back:after
 *
 * @slot access-recovery:before
 * @slot access-recovery:after
 * @slot access-recovery:header:before
 * @slot access-recovery:header:after
 * @slot access-recovery:email:before
 * @slot access-recovery:email:after
 * @slot access-recovery:message:before
 * @slot access-recovery:message:after
 * @slot access-recovery:submit:before
 * @slot access-recovery:submit:after
 * @slot access-recovery:back:before
 * @slot access-recovery:back:after
 *
 * @slot customer:before
 * @slot customer:after
 * @slot customer:header:before
 * @slot customer:header:after
 * @slot customer:header:actions:before
 * @slot customer:header:actions:after
 * @slot customer:header:actions:edit:before
 * @slot customer:header:actions:edit:after
 * @slot customer:header:actions:sign-out:before
 * @slot customer:header:actions:sign-out:after
 * @slot customer:addresses:before
 * @slot customer:addresses:after
 * @slot customer:addresses:actions:before
 * @slot customer:addresses:actions:after
 * @slot customer:addresses:list:before
 * @slot customer:addresses:list:after
 * @slot customer:payment-methods:before
 * @slot customer:payment-methods:after
 * @slot customer:payment-methods:list:before
 * @slot customer:payment-methods:list:after
 * @slot customer:transactions:before
 * @slot customer:transactions:after
 * @slot customer:subscriptions:before
 * @slot customer:subscriptions:after
 *
 * @element foxy-customer-portal
 * @since 1.4.0
 */
export class CustomerPortal extends Base {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      group: { type: String, noAccessor: true },
      href: { type: String, noAccessor: true },
      lang: { type: String },
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          display: flex;
          flex-direction: column;
        }

        :host > div {
          flex: 1;
        }

        .max-w-20rem {
          max-width: 20rem;
        }

        foxy-collection-pages[manual] > vaadin-button {
          border-top: none;
          display: block;
          margin: var(--lumo-space-m) auto;
        }
      `,
    ];
  }

  /** Optional ISO 639-1 code describing the language element content is written in. */
  lang = '';

  /**
   * Rumour group. Elements in different groups will not share updates. Empty by default.
   * @example element.group = 'my-group'
   */
  group = '';

  private readonly __renderAccessRecoveryHeader = () => {
    const { lang, ns } = this;
    const formId = '#access-recovery-form';
    const form = this.renderRoot.querySelector(formId) as AccessRecoveryForm | null;
    const isBusy = !!form?.in('busy');

    return html`
      <div class="flex flex-col leading-m font-lumo">
        <slot name="access-recovery:header:before"></slot>

        <foxy-i18n
          class="text-xxl font-bold ${isBusy ? 'text-disabled' : 'text-body'}"
          lang=${lang}
          key="recover_access"
          ns=${ns}
        >
        </foxy-i18n>

        <foxy-i18n
          class="text-l ${isBusy ? 'text-disabled' : 'text-secondary'}"
          lang=${lang}
          key="recover_access_hint"
          ns=${ns}
        >
        </foxy-i18n>

        <slot name="access-recovery:header:after"></slot>
      </div>
    `;
  };

  private readonly __renderAccessRecoveryBack = () => {
    const formId = '#access-recovery-form';
    const form = this.renderRoot.querySelector(formId) as AccessRecoveryForm | null;
    const disabledSelector = this.disabledSelector.zoom('access-recovery');

    return html`
      <div>
        <slot name="access-recovery:back:before"></slot>

        <vaadin-button
          class="w-full"
          theme="tertiary"
          ?disabled=${!!form?.in('busy') || disabledSelector.matches('back', true)}
          @click=${() => this.__service.send('SIGN_IN')}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="cancel"></foxy-i18n>
        </vaadin-button>

        <slot name="access-recovery:back:after"></slot>
      </div>
    `;
  };

  private readonly __renderAccessRecovery = () => {
    const scope = 'access-recovery';
    const hiddenSelector = this.hiddenSelector.zoom(scope);

    return html`
      <div class="mx-auto max-w-20rem flex items-center justify-center">
        <slot name="${scope}:before"></slot>

        <div class="space-y-l">
          ${hiddenSelector.matches('header', true) ? '' : this.__renderAccessRecoveryHeader()}

          <div class="space-y-s">
            <foxy-access-recovery-form
              id="${scope}-form"
              lang=${this.lang}
              parent="foxy://auth/recover"
              readonlycontrols=${this.readonlySelector.zoom(scope).toString()}
              disabledcontrols=${this.disabledSelector.zoom(scope).toString()}
              hiddencontrols=${hiddenSelector.toString()}
              @update=${() => this.requestUpdate()}
            >
              <slot name="${scope}:email:before" slot="email:before"></slot>
              <slot name="${scope}:email:after" slot="email:after"></slot>
              <slot name="${scope}:message:before" slot="message:before"></slot>
              <slot name="${scope}:message:after" slot="message:after"></slot>
              <slot name="${scope}:submit:before" slot="submit:before"></slot>
              <slot name="${scope}:submit:after" slot="submit:after"></slot>
            </foxy-access-recovery-form>

            ${hiddenSelector.matches('back', true) ? '' : this.__renderAccessRecoveryBack()}
          </div>
        </div>

        <slot name="${scope}:after"></slot>
      </div>
    `;
  };

  private readonly __renderSignInHeader = () => {
    const { lang, ns } = this;
    const formId = '#sign-in-form';
    const form = this.renderRoot.querySelector(formId) as SignInForm | null;
    const isBusy = !!form?.in('busy');

    return html`
      <div class="flex flex-col leading-m font-lumo">
        <slot name="sign-in:header:before"></slot>

        <foxy-i18n
          class="text-xxl font-bold ${isBusy ? 'text-disabled' : 'text-body'}"
          lang=${lang}
          key="sign_in"
          ns=${ns}
        >
        </foxy-i18n>

        <foxy-i18n
          class="text-l ${isBusy ? 'text-disabled' : 'text-secondary'}"
          lang=${lang}
          key="sign_in_hint"
          ns=${ns}
        >
        </foxy-i18n>

        <slot name="sign-in:header:after"></slot>
      </div>
    `;
  };

  private readonly __renderSignInRecover = () => {
    const formId = '#sign-in-form';
    const form = this.renderRoot.querySelector(formId) as AccessRecoveryForm | null;
    const disabledSelector = this.disabledSelector.zoom('sign-in');

    return html`
      <div>
        <slot name="sign-in:recover:before"></slot>

        <vaadin-button
          class="w-full"
          theme="tertiary"
          ?disabled=${!!form?.in('busy') || disabledSelector.matches('recover', true)}
          @click=${() => this.__service.send('RECOVER_ACCESS')}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="recover_access"></foxy-i18n>
        </vaadin-button>

        <slot name="sign-in:recover:after"></slot>
      </div>
    `;
  };

  private readonly __renderSignIn = () => {
    const scope = 'sign-in';
    const hiddenSelector = this.hiddenSelector.zoom(scope);

    return html`
      <div class="mx-auto max-w-20rem flex items-center justify-center">
        <slot name="${scope}:before"></slot>

        <div class="space-y-l">
          ${hiddenSelector.matches('header', true) ? '' : this.__renderSignInHeader()}

          <div class="space-y-s">
            <foxy-sign-in-form
              id="${scope}-form"
              lang=${this.lang}
              parent="foxy://auth/session"
              readonlycontrols=${this.readonlySelector.zoom(scope).toString()}
              disabledcontrols=${this.disabledSelector.zoom(scope).toString()}
              hiddencontrols=${hiddenSelector.toString()}
              @signin=${() => this.__service.send('SIGN_IN')}
              @update=${(evt: Event) => {
                const form = evt.currentTarget as SignInForm;
                if (form.in({ idle: 'snapshot' })) this.__service.send('SIGN_IN');
                this.requestUpdate();
              }}
            >
              <slot name="${scope}:email:before" slot="email:before"></slot>
              <slot name="${scope}:email:after" slot="email:after"></slot>
              <slot name="${scope}:password:before" slot="password:before"></slot>
              <slot name="${scope}:password:after" slot="password:after"></slot>
              <slot name="${scope}:error:before" slot="error:before"></slot>
              <slot name="${scope}:error:after" slot="error:after"></slot>
              <slot name="${scope}:submit:before" slot="submit:before"></slot>
              <slot name="${scope}:submit:after" slot="submit:after"></slot>
            </foxy-sign-in-form>

            ${hiddenSelector.matches('recover', true) ? '' : this.__renderSignInRecover()}
          </div>
        </div>

        <slot name="${scope}:after"></slot>
      </div>
    `;
  };

  private readonly __renderCustomerSubscriptionsForm = (ctx: FormRendererContext) => {
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
        settings=${JSON.stringify(this.settings)}
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

  private readonly __renderCustomerSubscriptionsPageItem: ItemRenderer = ({ html, ...ctx }) => {
    return html`
      <button
        class=${classMap({
          'block w-full border border-contrast-10 p-m rounded-t-l rounded-b-l focus-outline-none focus-border-primary': true,
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

  private readonly __renderCustomerSubscriptionsPage: PageRenderer<any> = ({ html, ...ctx }) => {
    return html`
      <foxy-collection-page
        href=${ctx.href}
        lang=${ctx.lang}
        group=${ctx.group}
        class="space-y-m"
        .item=${this.__renderCustomerSubscriptionsPageItem}
      >
      </foxy-collection-page>
    `;
  };

  private readonly __renderCustomerSubscriptions = () => {
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
        .form=${this.__renderCustomerSubscriptionsForm}
      >
      </foxy-form-dialog>

      <slot name="customer:subscriptions:before"></slot>

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
          .page=${this.__renderCustomerSubscriptionsPage}
        >
        </foxy-collection-pages>
      </div>

      <slot name="customer:subscriptions:after"></slot>
    `;
  };

  private readonly __renderCustomerHeaderActionsSignOut = () => {
    const scope = 'customer:header:actions:sign-out';
    const isCustomerLoaded = this.__customerElement?.in({ idle: 'snapshot' });

    return html`
      <div class="ml-m flex">
        <slot name="${scope}:before"></slot>

        <vaadin-button
          class="px-xs rounded-full"
          theme="icon large"
          ?disabled=${this.disabledSelector.matches(scope) || !isCustomerLoaded}
          @click=${this.__handleSignOutButtonClick}
        >
          <iron-icon icon="icons:exit-to-app"></iron-icon>
        </vaadin-button>

        <slot name="${scope}:after"></slot>
      </div>
    `;
  };

  private readonly __renderCustomerTransactions = () => {
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
      <slot name="customer:transactions:before"></slot>

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

      <slot name="customer:transactions:after"></slot>
    `;
  };

  private readonly __renderCustomer = () => {
    const extendedHiddenControlsArray = [
      this.hiddenSelector.zoom('customer').toString(),
      'header:actions:edit:form:delete',
      'attributes',
      'transactions',
      'subscriptions',
      'addresses:actions:create',
      'payment-methods:list:card',
    ];

    return html`
      <slot name="customer:before"></slot>

      <foxy-customer
        readonlycontrols=${this.readonlySelector.zoom('customer').toString()}
        disabledcontrols=${this.disabledSelector.zoom('customer').toString()}
        hiddencontrols=${extendedHiddenControlsArray.join(' ')}
        href=${this.href}
        lang=${this.lang}
        id="customer"
        @update=${() => this.requestUpdate()}
        @fetch=${(evt: Event) => {
          if (evt instanceof FetchEvent && !evt.defaultPrevented) {
            evt.respondWith(
              new API(this).fetch(evt.request).then(response => {
                if (response.status === 401) this.__service.send('SIGN_OUT');
                return response;
              })
            );
          }
        }}
      >
        <slot name="customer:header:before" slot="header:before"></slot>
        <slot name="customer:header:after" slot="header:after"></slot>
        <slot name="customer:header:actions:before" slot="header:actions:before"></slot>
        <slot name="customer:header:actions:after" slot="header:actions:after"></slot>
        <slot name="customer:header:actions:edit:before" slot="header:actions:edit:before"></slot>
        <slot name="customer:header:actions:edit:after" slot="header:actions:edit:after"></slot>
        <slot name="customer:addresses:before" slot="addresses:before"></slot>
        <slot name="customer:addresses:after" slot="addresses:after"></slot>
        <slot name="customer:addresses:list:before" slot="addresses:list:before"></slot>
        <slot name="customer:addresses:list:after" slot="addresses:list:after"></slot>
        <slot name="customer:payment-methods:before" slot="payment-methods:before"></slot>
        <slot name="customer:payment-methods:after" slot="payment-methods:after"></slot>
        <slot name="customer:payment-methods:list:before" slot="payment-methods:list:before"></slot>
        <slot name="customer:payment-methods:list:after" slot="payment-methods:list:after"></slot>

        <div slot="header:actions:after">
          ${this.hiddenSelector.matches('customer:header:actions:sign-out', true)
            ? ''
            : this.__renderCustomerHeaderActionsSignOut()}
        </div>

        <div slot="header:after" class="space-y-l mt-m">
          ${this.hiddenSelector.matches('customer:subscriptions', true)
            ? ''
            : this.__renderCustomerSubscriptions()}
          ${this.hiddenSelector.matches('customer:transactions', true)
            ? ''
            : this.__renderCustomerTransactions()}
        </div>
      </foxy-customer>

      <slot name="customer:after"></slot>
    `;
  };

  private __href = '';

  private __service = interpret(
    machine.withConfig({
      services: {
        load: async () => {
          const response = await new API(this).fetch(`${this.href}/customer_portal_settings`);
          if (!response.ok) throw new Error(await response.text());
          return response.json();
        },

        signOut: async () => {
          const response = await new API(this).fetch('foxy://auth/session', { method: 'DELETE' });
          if (!response.ok) throw new Error(await response.text());
        },
      },
    })
  );

  get settings(): Settings | null {
    return this.__service.state.context.settings;
  }

  /**
   * Optional URL of the resource to load. Switches element to `idle.template` state if empty (default).
   * @example element.href = 'https://demo.foxycart.com/s/customer/attributes/0'
   */
  get href(): string {
    return this.__href;
  }

  set href(value: string) {
    this.__href = value;
    this.__service.send({ type: 'RESET' });
  }

  /**
   * Checks if this element is in the given state.
   * @example element.in({ idle: 'snapshot' })
   */
  in<TStateValue extends State['value']>(
    stateValue: TStateValue
  ): this is this & ComputedElementProperties<TStateValue> {
    return this.__service.state.matches(stateValue);
  }

  render(): TemplateResult {
    if (this.in({ idle: 'accessRecovery' })) return this.__renderAccessRecovery();
    if (this.in({ idle: 'signIn' })) return this.__renderSignIn();
    if (this.in({ idle: 'home' })) return this.__renderCustomer();

    return html`
      <div class="flex items-center justify-center">
        <foxy-spinner lang=${this.lang} state=${this.in('fail') ? 'error' : 'busy'}></foxy-spinner>
      </div>
    `;
  }

  /** @readonly */
  connectedCallback(): void {
    super.connectedCallback();
    this.__createService();
  }

  /** @readonly */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__destroyService();
  }

  private __createService() {
    this.__service.onTransition(state => {
      if (!state.changed) return;

      const flags = state.toStrings().reduce((p, c) => [...p, ...c.split('.')], [] as string[]);
      this.setAttribute('state', [...new Set(flags)].join(' '));

      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('update'));
    });

    this.__service.onChange(() => {
      this.requestUpdate();
      this.dispatchEvent(new CustomEvent('update'));
    });

    this.__service.start();
  }

  private __destroyService() {
    this.__service.stop();
  }

  private get __subscriptionDialog() {
    return this.renderRoot.querySelector('#subscription-dialog') as FormDialog;
  }

  private get __customerElement() {
    return this.renderRoot.querySelector('#customer') as Customer | null;
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

  private async __handleSignOutButtonClick() {
    this.__service.send('SIGN_OUT');
  }
}
