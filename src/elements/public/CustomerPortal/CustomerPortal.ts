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
import { BooleanSelector } from '@foxy.io/sdk/core';
import { ComputedElementProperties } from './types';
import { Customer } from '../Customer/Customer';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog/FormDialog';
import { FormRendererContext } from '../FormDialog/types';
import { ItemRendererContext } from '../CollectionPage/types';
import { PageRendererContext } from '../CollectionPages/types';
import { SignInForm } from '../SignInForm/SignInForm';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { createBooleanSelectorProperty } from '../../../utils/create-boolean-selector-property';
import { ifDefined } from 'lit-html/directives/if-defined';
import { interpret } from 'xstate';

export class CustomerPortal extends LitElement {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...createBooleanSelectorProperty('readonly'),
      ...createBooleanSelectorProperty('disabled'),
      ...createBooleanSelectorProperty('excluded'),
      group: { type: String, noAccessor: true },
      href: { type: String, noAccessor: true },
      lang: { type: String },
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
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

  readonly = BooleanSelector.False;

  disabled = BooleanSelector.False;

  excluded = new BooleanSelector(
    'tabs subscription-form:timestamps customer-form:delete attributes create-address-button address-form:delete address-form:address-name'
  );

  private static __ns = 'customer-portal';

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
    if (this.in({ idle: 'accessRecovery' })) return this.__renderAccessRecoveryPage();
    if (this.in({ idle: 'signIn' })) return this.__renderSignInPage();
    if (this.in({ idle: 'home' })) return this.__renderMainPage();

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

  private get __accessRecoveryFormElement() {
    return this.renderRoot.querySelector('#access-recovery-form') as AccessRecoveryForm | null;
  }

  private get __subscriptionDialog() {
    return this.renderRoot.querySelector('#subscription-dialog') as FormDialog;
  }

  private get __signInFormElement() {
    return this.renderRoot.querySelector('#sign-in-form') as SignInForm | null;
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

  private __renderAccessRecoveryPage() {
    const ns = CustomerPortal.__ns;
    const isBusy = !!this.__accessRecoveryFormElement?.in('busy');

    return html`
      <div class="flex items-center justify-center">
        <div class="space-y-l mx-auto max-w-20rem">
          <div class="flex flex-col leading-m font-lumo">
            <foxy-i18n
              class=${classMap({
                'text-xxl font-bold': true,
                'text-disabled': isBusy,
                'text-body': !isBusy,
              })}
              lang=${this.lang}
              key="recover_access"
              ns=${ns}
            >
            </foxy-i18n>

            <foxy-i18n
              class=${classMap({
                'text-l': true,
                'text-disabled': isBusy,
                'text-secondary': !isBusy,
              })}
              lang=${this.lang}
              key="recover_access_hint"
              ns=${ns}
            >
            </foxy-i18n>
          </div>

          <div class="space-y-s">
            <foxy-access-recovery-form
              id="access-recovery-form"
              lang=${this.lang}
              @update=${this.__handleUpdate}
            >
            </foxy-access-recovery-form>

            <vaadin-button
              class="w-full"
              theme="tertiary"
              ?disabled=${isBusy}
              @click=${this.__handleBackToSignInButtonClick}
            >
              <foxy-i18n ns=${ns} lang=${this.lang} key="cancel"></foxy-i18n>
            </vaadin-button>
          </div>
        </div>
      </div>
    `;
  }

  private __renderSignInPage() {
    const ns = CustomerPortal.__ns;
    const isBusy = !!this.__signInFormElement?.in('busy');

    return html`
      <div class="flex items-center justify-center">
        <div class="space-y-l mx-auto max-w-20rem">
          <div class="flex flex-col leading-m text-m text-body font-lumo">
            <foxy-i18n
              class=${classMap({
                'text-xxl font-bold': true,
                'text-disabled': isBusy,
                'text-body': !isBusy,
              })}
              lang=${this.lang}
              key="sign_in"
              ns=${ns}
            >
            </foxy-i18n>

            <foxy-i18n
              class=${classMap({
                'text-l': true,
                'text-disabled': isBusy,
                'text-secondary': !isBusy,
              })}
              lang=${this.lang}
              key="sign_in_hint"
              ns=${ns}
            >
            </foxy-i18n>
          </div>

          <div class="space-y-s">
            <foxy-sign-in-form
              id="sign-in-form"
              lang=${this.lang}
              @update=${this.__handleUpdate}
              @signin=${this.__handleSignIn}
            >
            </foxy-sign-in-form>

            <vaadin-button
              class="w-full"
              theme="tertiary"
              ?disabled=${isBusy}
              @click=${this.__handleRecoverAccessButtonClick}
            >
              <foxy-i18n ns=${ns} lang=${this.lang} key="recover_access"></foxy-i18n>
            </vaadin-button>
          </div>
        </div>
      </div>
    `;
  }

  private __renderMainPage() {
    const customer = this.__customerElement;
    const ns = CustomerPortal.__ns;

    let updateBillingLink = '';
    let transactionsLink = '';
    let updateItemsLink = '';
    let cancelLink = '';

    if (customer?.in({ idle: 'snapshot' })) {
      const transactionsURL = new URL(customer.data._links['fx:transactions'].href);
      transactionsURL.searchParams.set('zoom', 'items');
      transactionsLink = transactionsURL.toString();

      if ('fx:sub_token_url' in customer.data._links) {
        const link = (customer.data._links['fx:sub_token_url'] as any).href as string;
        const cancelURL = new URL(link);
        const updateBillingURL = new URL(link);

        cancelURL.searchParams.set('sub_cancel', 'true');
        cancelLink = cancelURL.toString();

        updateBillingURL.searchParams.set('cart', 'checkout');
        updateBillingURL.searchParams.set('sub_restart', 'auto');
        updateBillingLink = updateBillingURL.toString();
      }

      if ('fx:sub_modification_url' in customer.data._links) {
        updateItemsLink = (customer.data._links['fx:sub_modification_url'] as any).href as string;
      }
    }

    return html`
      <foxy-form-dialog
        header="update"
        lang=${this.lang}
        ns=${CustomerPortal.__ns}
        id="subscription-dialog"
        readonly=${ifDefined(this.readonly.zoom('subscription-form').toAttribute() ?? undefined)}
        disabled=${ifDefined(this.disabled.zoom('subscription-form').toAttribute() ?? undefined)}
        excluded=${ifDefined(this.excluded.zoom('subscription-form').toAttribute() ?? undefined)}
        .form=${(ctx: FormRendererContext) => ctx.html`
          <foxy-subscription-form
            id="form"
            href=${ctx.href}
            lang=${ctx.lang}
            parent=${ctx.parent}
            settings=${JSON.stringify(this.settings)}
            disabled=${ctx.disabled}
            readonly=${ctx.readonly}
            excluded="end-button ${ctx.excluded}"
            @fetch=${ctx.handleFetch}
            @update=${ctx.handleUpdate}
          >
            <div slot="after-status" class="space-x-s mt-s">
              ${
                !this.excluded.zoom('subscription-form').matches('update-billing-link') &&
                updateBillingLink.length > 0
                  ? html`
                      <a
                        target="_blank"
                        class="inline-block font-medium tracking-wide cursor-pointer text-primary text-s rounded-s hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50 focus-ring-offset-2"
                        href=${updateBillingLink}
                        rel="nofollow noreferrer noopener"
                      >
                        <foxy-i18n key="update_billing" lang=${ctx.lang} ns=${ns}></foxy-i18n>
                        <iron-icon icon="icons:open-in-new" class="icon-inline"></iron-icon>
                      </a>
                    `
                  : ''
              }

              ${
                !this.excluded.zoom('subscription-form').matches('end-subscription-link') &&
                cancelLink.length > 0
                  ? html`
                      <a
                        target="_blank"
                        class="inline-block font-medium tracking-wide cursor-pointer text-primary text-s rounded-s hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50 focus-ring-offset-2"
                        href=${cancelLink}
                        rel="nofollow noreferrer noopener"
                      >
                        <foxy-i18n lang=${ctx.lang} key="end_subscription" ns=${ns}></foxy-i18n>
                        <iron-icon icon="icons:open-in-new" class="icon-inline"></iron-icon>
                      </a>
                    `
                  : ''
              }
            </div>

            ${
              !this.excluded.zoom('subscription-form').matches('update-items-link') &&
              updateItemsLink.length > 0
                ? html`
                    <div slot="items-header" class="flex items-center justify-between">
                      <foxy-i18n
                        class="text-l font-medium tracking-wide"
                        lang=${this.lang}
                        key="item_plural"
                        ns=${ns}
                      >
                      </foxy-i18n>

                      <a
                        target="_blank"
                        class="inline-block font-medium tracking-wide cursor-pointer text-primary text-s rounded-s hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50 focus-ring-offset-2"
                        href=${updateItemsLink}
                        rel="nofollow noreferrer noopener"
                      >
                        <foxy-i18n key="update" lang=${ctx.lang} ns=${ns}></foxy-i18n>
                        <iron-icon icon="icons:open-in-new" class="icon-inline"></iron-icon>
                      </a>
                    </div>
                  `
                : ''
            }
          </foxy-subscription-form>
        `}
      >
      </foxy-form-dialog>

      <foxy-customer
        id="customer"
        lang=${this.lang}
        href=${this.href}
        excluded=${ifDefined(this.excluded.toAttribute() ?? undefined)}
        readonly=${ifDefined(this.readonly.toAttribute() ?? undefined)}
        disabled=${ifDefined(this.disabled.toAttribute() ?? undefined)}
        @update=${this.__handleUpdate}
        @fetch=${this.__handleFetch}
      >
        <vaadin-button
          class="ml-m px-xs rounded-full"
          theme="icon large"
          slot="actions"
          ?disabled=${!this.__customerElement?.in({ idle: 'snapshot' })}
          @click=${this.__handleSignOutButtonClick}
        >
          <iron-icon icon="icons:exit-to-app"></iron-icon>
        </vaadin-button>

        <div slot="after-header" class="space-y-l mt-m">
          <div class="space-y-m pt-m border-t-4 border-contrast-5">
            <foxy-i18n
              class="block text-l font-medium tracking-wide"
              lang=${this.lang}
              key="subscription_plural"
              ns=${CustomerPortal.__ns}
            >
            </foxy-i18n>

            <foxy-collection-pages
              class="block space-y-m"
              first=${this.__activeSubscriptionsLink}
              group=${this.group}
              lang=${this.lang}
              .page=${(pageContext: PageRendererContext<any>) => pageContext.html`
              <foxy-collection-page
                href=${pageContext.href}
                lang=${pageContext.lang}
                group=${pageContext.group}
                class="space-y-m"
                .item=${(itemContext: ItemRendererContext) => itemContext.html`
                  <button
                    class=${classMap({
                      'block w-full border border-contrast-10 p-m rounded-t-l rounded-b-l focus-outline-none focus-border-primary': true,
                      'hover-border-contrast-30': itemContext.data !== null,
                    })}
                    ?disabled=${itemContext.data === null}
                    @click=${(evt: Event) => {
                      const url = new URL(itemContext.href);
                      url.searchParams.set('zoom', 'last_transaction,transaction_template:items');
                      this.__subscriptionDialog.href = url.toString();
                      this.__subscriptionDialog.show(evt.currentTarget as HTMLButtonElement);
                    }}
                  >
                    <foxy-subscription-card
                      parent=${itemContext.parent}
                      group=${itemContext.group}
                      lang=${itemContext.lang}
                      href=${itemContext.href}
                    >
                    </foxy-subscription-card>
                  </button>
                `}
              >
              </foxy-collection-page>
            `}
            >
            </foxy-collection-pages>
          </div>

          <div class="space-y-m pt-m border-t-4 border-contrast-5">
            <foxy-i18n
              class="text-l font-medium tracking-wide"
              ns=${CustomerPortal.__ns}
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
            >
            </foxy-collection-pages>
          </div>
        </div>
      </foxy-customer>
    `;
  }

  private async __handleSignOutButtonClick() {
    this.__service.send('SIGN_OUT');
  }

  private __handleRecoverAccessButtonClick() {
    this.__service.send('RECOVER_ACCESS');
  }

  private __handleBackToSignInButtonClick() {
    this.__service.send('SIGN_IN');
  }

  private __handleSignIn() {
    this.__service.send('SIGN_IN');
  }

  private __handleUpdate() {
    this.requestUpdate();
  }

  private __handleFetch(evt: Event) {
    if (evt instanceof FetchEvent && !evt.defaultPrevented) {
      evt.respondWith(
        new API(this).fetch(evt.request).then(response => {
          if (response.status === 401) this.__service.send('SIGN_OUT');
          return response;
        })
      );
    }
  }
}
