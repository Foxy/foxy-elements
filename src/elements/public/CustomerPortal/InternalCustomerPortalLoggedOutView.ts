import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { AccessRecoveryForm } from '../AccessRecoveryForm/AccessRecoveryForm';
import type { CustomerForm } from '../CustomerForm/CustomerForm';
import type { SignInForm } from '../SignInForm/SignInForm';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/customer';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { css, html } from 'lit-element';

type Data = Resource<Rels.CustomerPortalSettings>;
const Base = TranslatableMixin(InternalForm);

export class InternalCustomerPortalLoggedOutView extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      group: { type: String },
      page: { type: String },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .max-w-25rem {
          max-width: 25rem;
        }
      `,
    ];
  }

  page: 'sign-up' | 'sign-in' | 'access-recovery' = 'sign-in';

  private readonly __renderAccessRecoveryHeader = () => {
    const { lang, ns } = this;
    const formId = '#access-recovery-form';
    const form = this.renderRoot.querySelector(formId) as AccessRecoveryForm | null;
    const isBusy = !!form?.in('busy');

    return html`
      <div class="flex flex-col leading-s font-lumo" data-testid="access-recovery:header">
        ${this.renderTemplateOrSlot('access-recovery:header:before')}

        <foxy-i18n
          class="text-xxl font-medium ${isBusy ? 'text-disabled' : 'text-body'}"
          lang=${lang}
          key="recover_access"
          ns="${ns} ${customElements.get('foxy-access-recovery-form')?.defaultNS ?? ''}"
        >
        </foxy-i18n>

        <foxy-i18n
          class="text-l ${isBusy ? 'text-disabled' : 'text-secondary'}"
          lang=${lang}
          key="recover_access_hint"
          ns="${ns} ${customElements.get('foxy-access-recovery-form')?.defaultNS ?? ''}"
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('access-recovery:header:after')}
      </div>
    `;
  };

  private readonly __renderAccessRecoveryBack = () => {
    const formId = '#access-recovery-form';
    const form = this.renderRoot.querySelector(formId) as AccessRecoveryForm | null;
    const disabledSelector = this.disabledSelector.zoom('access-recovery');

    return html`
      <div>
        ${this.renderTemplateOrSlot('access-recovery:back:before')}

        <vaadin-button
          data-testid="access-recovery:back"
          class="w-full"
          theme="tertiary"
          ?disabled=${!!form?.in('busy') || disabledSelector.matches('back', true)}
          @click=${() => (this.page = 'sign-in')}
        >
          <foxy-i18n
            lang=${this.lang}
            key="back"
            ns="${this.ns} ${customElements.get('foxy-access-recovery-form')?.defaultNS ?? ''}"
          >
          </foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('access-recovery:back:after')}
      </div>
    `;
  };

  private readonly __renderAccessRecoveryForm = () => {
    const scope = 'access-recovery:form';
    const hiddenSelector = this.hiddenSelector.zoom(scope);

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <foxy-access-recovery-form
          readonlycontrols=${this.readonlySelector.zoom(scope).toString()}
          disabledcontrols=${this.disabledSelector.zoom(scope).toString()}
          hiddencontrols=${hiddenSelector.toString()}
          data-testid="access-recovery:form"
          parent="foxy://customer-api/recover"
          group=${this.group}
          lang=${this.lang}
          ns="${this.ns} ${customElements.get('foxy-access-recovery-form')?.defaultNS ?? ''}"
          id="access-recovery-form"
          .templates=${this.getNestedTemplates(scope)}
          @update=${() => this.requestUpdate()}
        >
        </foxy-access-recovery-form>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  };

  private readonly __renderAccessRecovery = () => {
    const scope = 'access-recovery';
    const hiddenSelector = this.hiddenSelector.zoom(scope);

    return html`
      <div class="h-full flex" data-testid="access-recovery">
        <div class="m-auto max-w-25rem flex-1">
          ${this.renderTemplateOrSlot(`${scope}:before`)}

          <div class="space-y-m">
            ${hiddenSelector.matches('header', true) ? '' : this.__renderAccessRecoveryHeader()}
            <div class="space-y-s">
              ${hiddenSelector.matches('form', true) ? '' : this.__renderAccessRecoveryForm()}
              ${hiddenSelector.matches('back', true) ? '' : this.__renderAccessRecoveryBack()}
            </div>
          </div>

          ${this.renderTemplateOrSlot(`${scope}:after`)}
        </div>
      </div>
    `;
  };

  private readonly __renderSignInHeader = () => {
    const { lang, ns } = this;
    const formId = '#sign-in-form';
    const form = this.renderRoot.querySelector(formId) as SignInForm | null;
    const isBusy = !!form?.in('busy');

    return html`
      <div class="flex flex-col leading-s font-lumo" data-testid="sign-in:header">
        ${this.renderTemplateOrSlot('sign-in:header:before')}

        <foxy-i18n
          class="text-xxl font-medium ${isBusy ? 'text-disabled' : 'text-body'}"
          lang=${lang}
          key="sign_in"
          ns="${ns} ${customElements.get('foxy-sign-in-form')?.defaultNS ?? ''}"
        >
        </foxy-i18n>

        <foxy-i18n
          class="text-l ${isBusy ? 'text-disabled' : 'text-secondary'}"
          lang=${lang}
          key="sign_in_hint"
          ns="${ns} ${customElements.get('foxy-sign-in-form')?.defaultNS ?? ''}"
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('sign-in:header:after')}
      </div>
    `;
  };

  private readonly __renderSignInRecover = () => {
    const form = this.renderRoot.querySelector<AccessRecoveryForm>('#sign-in-form');
    const disabledSelector = this.disabledSelector.zoom('sign-in');

    return html`
      <div>
        ${this.renderTemplateOrSlot('sign-in:recover:before')}

        <vaadin-button
          data-testid="sign-in:recover"
          class="w-full"
          theme="tertiary"
          ?disabled=${!!form?.in('busy') || disabledSelector.matches('recover', true)}
          @click=${() => (this.page = 'access-recovery')}
        >
          <foxy-i18n
            lang=${this.lang}
            key="recover_access"
            ns="${this.ns} ${customElements.get('foxy-sign-in-form')?.defaultNS ?? ''}"
          >
          </foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('sign-in:recover:after')}
      </div>
    `;
  };

  private readonly __renderSignInSignUp = () => {
    const form = this.renderRoot.querySelector<AccessRecoveryForm>('#sign-in-form');
    const disabledSelector = this.disabledSelector.zoom('sign-in');

    return html`
      <div>
        ${this.renderTemplateOrSlot('sign-in:signup:before')}

        <vaadin-button
          data-testid="sign-in:signup"
          class="w-full"
          theme="tertiary"
          ?disabled=${!!form?.in('busy') || disabledSelector.matches('signup', true)}
          @click=${() => (this.page = 'sign-up')}
        >
          <foxy-i18n lang=${this.lang} key="sign_up" ns="${this.ns} sign-in-form"> </foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('sign-in:signup:after')}
      </div>
    `;
  };

  private readonly __renderSignInForm = () => {
    const scope = 'sign-in:form';
    const hiddenSelector = this.hiddenSelector.zoom(scope);

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <foxy-sign-in-form
          readonlycontrols=${this.readonlySelector.zoom(scope).toString()}
          disabledcontrols=${this.disabledSelector.zoom(scope).toString()}
          hiddencontrols=${hiddenSelector.toString()}
          data-testid="sign-in:form"
          parent="foxy://customer-api/session"
          group=${this.group}
          lang=${this.lang}
          id="sign-in-form"
          ns="${this.ns} ${customElements.get('foxy-sign-in-form')?.defaultNS ?? ''}"
          .templates=${this.getNestedTemplates('sign-in:form')}
          @update=${() => this.requestUpdate()}
        >
        </foxy-sign-in-form>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  };

  private readonly __renderSignIn = () => {
    const scope = 'sign-in';
    const hiddenSelector = this.hiddenSelector.zoom(scope);
    const isSignUpEnabled = this.data?.sign_up?.enabled === true;
    const isSignUpButtonHidden = hiddenSelector.matches('signup', true) || !isSignUpEnabled;

    return html`
      <div class="h-full flex" data-testid="sign-in">
        <div class="m-auto max-w-25rem flex-1">
          ${this.renderTemplateOrSlot(`${scope}:before`)}

          <div class="space-y-m">
            ${hiddenSelector.matches('header', true) ? '' : this.__renderSignInHeader()}
            <div class="space-y-s">
              ${hiddenSelector.matches('form', true) ? '' : this.__renderSignInForm()}
              <div class="flex justify-center gap-s">
                ${isSignUpButtonHidden ? '' : this.__renderSignInSignUp()}
                ${hiddenSelector.matches('recover', true) ? '' : this.__renderSignInRecover()}
              </div>
            </div>
          </div>

          ${this.renderTemplateOrSlot(`${scope}:after`)}
        </div>
      </div>
    `;
  };

  private readonly __renderSignUpHeader = () => {
    const { lang, ns } = this;
    const formId = '#sign-up-form';
    const form = this.renderRoot.querySelector(formId) as CustomerForm | null;
    const isBusy = !!form?.in('busy');

    return html`
      <div class="flex flex-col leading-s font-lumo" data-testid="sign-up:header">
        ${this.renderTemplateOrSlot('sign-up:header:before')}

        <foxy-i18n
          class="text-xxl font-medium ${isBusy ? 'text-disabled' : 'text-body'}"
          lang=${lang}
          key="sign_up"
          ns="${ns} sign-up-form"
        >
        </foxy-i18n>

        <foxy-i18n
          class="text-l ${isBusy ? 'text-disabled' : 'text-secondary'}"
          lang=${lang}
          key="sign_up_hint"
          ns="${ns} sign-up-form"
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('sign-up:header:after')}
      </div>
    `;
  };

  private readonly __renderSignUpGoBack = () => {
    const form = this.renderRoot.querySelector<CustomerForm>('#sign-up-form');
    const disabledSelector = this.disabledSelector.zoom('sign-up');

    return html`
      <div>
        ${this.renderTemplateOrSlot('sign-up:go-back:before')}

        <vaadin-button
          data-testid="sign-up:go-back"
          class="w-full"
          theme="tertiary-inline"
          ?disabled=${!!form?.in('busy') || disabledSelector.matches('go-back', true)}
          @click=${() => (this.page = 'sign-in')}
        >
          <foxy-i18n lang=${this.lang} key="go_back" ns="${this.ns} sign-up-form"> </foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('sign-up:go-back:after')}
      </div>
    `;
  };

  private readonly __renderSignUpForm = () => {
    const scope = 'sign-up:form';
    const hidden = [
      'header',
      'tax-id',
      'is-anonymous',
      'password-old',
      'forgot-password',
      'timestamps',
      'delete',
      this.hiddenSelector.zoom(scope).toString(),
    ];

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <foxy-customer-form
          readonlycontrols=${this.readonlySelector.zoom(scope).toString()}
          disabledcontrols=${this.disabledSelector.zoom(scope).toString()}
          hiddencontrols=${new BooleanSelector(hidden.join(' ').trim())}
          data-testid="sign-up:form"
          parent="foxy://customer-api/signup"
          group=${this.group}
          lang=${this.lang}
          id="sign-up-form"
          ns="${this.ns} sign-up-form"
          .templates=${this.getNestedTemplates('sign-up:form')}
          .settings=${this.data}
          @update=${() => this.requestUpdate()}
        >
        </foxy-customer-form>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  };

  private readonly __renderSignUp = () => {
    const scope = 'sign-up';
    const hiddenSelector = this.hiddenSelector.zoom(scope);

    return html`
      <div class="h-full flex" data-testid="sign-up">
        <div class="m-auto max-w-25rem flex-1">
          ${this.renderTemplateOrSlot(`${scope}:before`)}

          <div class="space-y-m">
            ${hiddenSelector.matches('header', true) ? '' : this.__renderSignUpHeader()}
            ${hiddenSelector.matches('form', true) ? '' : this.__renderSignUpForm()}
            ${hiddenSelector.matches('go-back', true) ? '' : this.__renderSignUpGoBack()}
          </div>

          ${this.renderTemplateOrSlot(`${scope}:after`)}
        </div>
      </div>
    `;
  };

  renderBody(): TemplateResult {
    const { page, hiddenSelector } = this;

    if (page === 'access-recovery' && !hiddenSelector.matches('access-recovery', true)) {
      return this.__renderAccessRecovery();
    }

    if (page === 'sign-in' && !hiddenSelector.matches('sign-in', true)) {
      return this.__renderSignIn();
    }

    if (page === 'sign-up' && !hiddenSelector.matches('sign-up', true)) {
      return this.__renderSignUp();
    }

    return html``;
  }
}
