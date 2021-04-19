import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { API } from '@foxy.io/sdk/customer';
import { AccessRecoveryForm } from '../AccessRecoveryForm/AccessRecoveryForm';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { Customer } from '../Customer/Customer';
import { CustomerApi } from '../CustomerApi/CustomerApi';
import { Page } from './types';
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
      base: { type: String },
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

  readonly = new BooleanSelector('payment-method-card');

  disabled = BooleanSelector.False;

  excluded = new BooleanSelector(
    'customer-form:delete attributes create-address-button address-form:delete address-form:address-name'
  );

  lang = '';

  base = '';

  private static __ns = 'customer-portal';

  private __page: Page = localStorage.getItem(API.SESSION) ? Page.Main : Page.SignIn;

  render(): TemplateResult {
    return html`
      <foxy-customer-api
        id="connector"
        base=${this.base}
        level="5"
        storage="local"
        @signout=${this.__handleConnectorSignOut}
        @signin=${this.__handleConnectorSignIn}
      >
        ${this.__page === Page.AccessRecovery
          ? this.__renderAccessRecoveryPage()
          : this.__page === Page.SignIn
          ? this.__renderSignInPage()
          : this.__renderMainPage()}
      </foxy-customer-api>
    `;
  }

  private get __accessRecoveryFormElement() {
    return this.renderRoot.querySelector('#access-recovery-form') as AccessRecoveryForm | null;
  }

  private get __signInFormElement() {
    return this.renderRoot.querySelector('#sign-in-form') as SignInForm | null;
  }

  private get __connectorElement() {
    return this.renderRoot.querySelector('#connector') as CustomerApi;
  }

  private get __customerElement() {
    return this.renderRoot.querySelector('#customer') as Customer | null;
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
          <foxy-sign-in-form id="sign-in-form" lang=${this.lang} @update=${this.__handleUpdate}>
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
      <foxy-customer
        id="customer"
        lang=${this.lang}
        href=${this.base}
        excluded=${ifDefined(this.excluded.toAttribute() ?? undefined)}
        readonly=${ifDefined(this.readonly.toAttribute() ?? undefined)}
        disabled=${ifDefined(this.disabled.toAttribute() ?? undefined)}
        @update=${this.__handleUpdate}
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
      </foxy-customer>
    `;
  }

  private __setPage(page: Page) {
    this.__page = page;
    this.requestUpdate();
  }

  private async __handleSignOutButtonClick() {
    await this.__connectorElement.api.signOut();
    this.__setPage(Page.SignIn);
  }

  private __handleRecoverAccessButtonClick() {
    this.__setPage(Page.AccessRecovery);
  }

  private __handleBackToSignInButtonClick() {
    this.__setPage(Page.SignIn);
  }

  private __handleConnectorSignOut() {
    this.__setPage(Page.SignIn);
  }

  private __handleConnectorSignIn() {
    this.__setPage(Page.Main);
  }

  private __handleUpdate() {
    this.requestUpdate();
  }
}
