import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { API } from '../NucleonElement/API';
import { AccessRecoveryForm } from '../AccessRecoveryForm/AccessRecoveryForm';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { Customer } from '../Customer/Customer';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog/FormDialog';
import { ItemRendererContext } from '../CollectionPage/types';
import { Page } from './types';
import { PageRendererContext } from '../CollectionPages/types';
import { SignInForm } from '../SignInForm/SignInForm';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { createBooleanSelectorProperty } from '../../../utils/create-boolean-selector-property';
import { ifDefined } from 'lit-html/directives/if-defined';

export class CustomerPortal extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      ...createBooleanSelectorProperty('readonly'),
      ...createBooleanSelectorProperty('disabled'),
      ...createBooleanSelectorProperty('excluded'),
      group: { type: String },
      href: { type: String },
      lang: { type: String },
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
      css`
        .max-w-20rem {
          max-width: 20rem;
        }
      `,
    ];
  }

  readonly = BooleanSelector.False;

  disabled = BooleanSelector.False;

  excluded = new BooleanSelector(
    'subscriptions subscription-form:timestamps customer-form:delete attributes create-address-button address-form:delete address-form:address-name'
  );

  group = '';

  lang = '';

  href = '';

  private static __ns = 'customer-portal';

  private __page: Page = Page.Main;

  render(): TemplateResult {
    return this.__page === Page.AccessRecovery
      ? this.__renderAccessRecoveryPage()
      : this.__page === Page.SignIn
      ? this.__renderSignInPage()
      : this.__renderMainPage();
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
    `;
  }

  private __renderSignInPage() {
    const ns = CustomerPortal.__ns;
    const isBusy = !!this.__signInFormElement?.in('busy');

    return html`
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
    `;
  }

  private __renderMainPage() {
    return html`
      <foxy-form-dialog
        header="update"
        form="foxy-subscription-form"
        lang=${this.lang}
        ns=${CustomerPortal.__ns}
        id="subscription-dialog"
        readonly=${ifDefined(this.readonly.zoom('subscription-form').toAttribute() ?? undefined)}
        disabled=${ifDefined(this.disabled.zoom('subscription-form').toAttribute() ?? undefined)}
        excluded=${ifDefined(this.excluded.zoom('subscription-form').toAttribute() ?? undefined)}
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
          class="px-xs rounded-full"
          theme="icon large"
          slot="actions"
          ?disabled=${!this.__customerElement?.in({ idle: 'snapshot' })}
          @click=${this.__handleSignOutButtonClick}
        >
          <iron-icon icon="icons:exit-to-app"></iron-icon>
        </vaadin-button>

        <div slot="after-header" class="space-y-m pt-m border-t-4 border-contrast-5 mt-m">
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
      </foxy-customer>
    `;
  }

  private __setPage(page: Page) {
    this.__page = page;
    this.requestUpdate();
  }

  private async __handleSignOutButtonClick() {
    await new API(this).fetch('foxy://auth/session', { method: 'DELETE' });
    this.__setPage(Page.SignIn);
  }

  private __handleRecoverAccessButtonClick() {
    this.__setPage(Page.AccessRecovery);
  }

  private __handleBackToSignInButtonClick() {
    this.__setPage(Page.SignIn);
  }

  private __handleSignIn() {
    this.__setPage(Page.Main);
  }

  private __handleUpdate() {
    this.requestUpdate();
  }

  private __handleFetch(evt: Event) {
    if (evt instanceof FetchEvent && !evt.defaultPrevented) {
      evt.respondWith(
        new API(this).fetch(evt.request).then(response => {
          if (response.status === 401) this.__setPage(Page.SignIn);
          return response;
        })
      );
    }
  }
}
