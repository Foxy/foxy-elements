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

  readonly = new BooleanSelector('payment-method-card');

  disabled = BooleanSelector.False;

  excluded = new BooleanSelector(
    'customer-form:delete attributes create-address-button address-form:delete address-form:address-name'
  );

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

  private get __signInFormElement() {
    return this.renderRoot.querySelector('#sign-in-form') as SignInForm | null;
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
