import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { AccessRecoveryForm } from '..';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { SignInForm } from '../SignInForm';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';

const NS = 'customer-portal';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(LitElement, NS)));

export class InternalCustomerPortalLoggedOutView extends Base {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      page: { type: String, attribute: false },
    };
  }

  page: 'sign-in' | 'access-recovery' = 'sign-in';

  private readonly __renderAccessRecoveryHeader = () => {
    const { lang, ns } = this;
    const formId = '#access-recovery-form';
    const form = this.renderRoot.querySelector(formId) as AccessRecoveryForm | null;
    const isBusy = !!form?.in('busy');

    return html`
      <div class="flex flex-col leading-m font-lumo">
        ${this._renderTemplateOrSlot('access-recovery:header:before')}

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

        ${this._renderTemplateOrSlot('access-recovery:header:after')}
      </div>
    `;
  };

  private readonly __renderAccessRecoveryBack = () => {
    const formId = '#access-recovery-form';
    const form = this.renderRoot.querySelector(formId) as AccessRecoveryForm | null;
    const disabledSelector = this.disabledSelector.zoom('access-recovery');

    return html`
      <div>
        ${this._renderTemplateOrSlot('access-recovery:back:before')}

        <vaadin-button
          class="w-full"
          theme="tertiary"
          ?disabled=${!!form?.in('busy') || disabledSelector.matches('back', true)}
          @click=${() => (this.page = 'sign-in')}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="cancel"></foxy-i18n>
        </vaadin-button>

        ${this._renderTemplateOrSlot('access-recovery:back:after')}
      </div>
    `;
  };

  private readonly __renderAccessRecovery = () => {
    const scope = 'access-recovery';
    const hiddenSelector = this.hiddenSelector.zoom(scope);

    return html`
      <div class="mx-auto max-w-20rem flex items-center justify-center">
        ${this._renderTemplateOrSlot(`${scope}:before`)}

        <div class="space-y-l">
          ${hiddenSelector.matches('header', true) ? '' : this.__renderAccessRecoveryHeader()}

          <div class="space-y-s">
            <foxy-access-recovery-form
              readonlycontrols=${this.readonlySelector.zoom(scope).toString()}
              disabledcontrols=${this.disabledSelector.zoom(scope).toString()}
              hiddencontrols=${hiddenSelector.toString()}
              parent="foxy://customer-api/recover"
              lang=${this.lang}
              id="${scope}-form"
              .templates=${this._getNestedTemplates('access-recovery')}
              @update=${() => this.requestUpdate()}
            >
            </foxy-access-recovery-form>

            ${hiddenSelector.matches('back', true) ? '' : this.__renderAccessRecoveryBack()}
          </div>
        </div>

        ${this._renderTemplateOrSlot(`${scope}:after`)}
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
        ${this._renderTemplateOrSlot('sign-in:header:before')}

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

        ${this._renderTemplateOrSlot('sign-in:header:after')}
      </div>
    `;
  };

  private readonly __renderSignInRecover = () => {
    const formId = '#sign-in-form';
    const form = this.renderRoot.querySelector(formId) as AccessRecoveryForm | null;
    const disabledSelector = this.disabledSelector.zoom('sign-in');

    return html`
      <div>
        ${this._renderTemplateOrSlot('sign-in:recover:before')}

        <vaadin-button
          class="w-full"
          theme="tertiary"
          ?disabled=${!!form?.in('busy') || disabledSelector.matches('recover', true)}
          @click=${() => (this.page = 'access-recovery')}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="recover_access"></foxy-i18n>
        </vaadin-button>

        ${this._renderTemplateOrSlot('sign-in:recover:after')}
      </div>
    `;
  };

  private readonly __renderSignIn = () => {
    const scope = 'sign-in';
    const hiddenSelector = this.hiddenSelector.zoom(scope);

    return html`
      <div class="mx-auto max-w-20rem flex items-center justify-center">
        ${this._renderTemplateOrSlot(`${scope}:before`)}

        <div class="space-y-l">
          ${hiddenSelector.matches('header', true) ? '' : this.__renderSignInHeader()}

          <div class="space-y-s">
            <foxy-sign-in-form
              readonlycontrols=${this.readonlySelector.zoom(scope).toString()}
              disabledcontrols=${this.disabledSelector.zoom(scope).toString()}
              hiddencontrols=${hiddenSelector.toString()}
              parent="foxy://customer-api/session"
              lang=${this.lang}
              id="${scope}-form"
              .templates=${this._getNestedTemplates('sign-in')}
            >
            </foxy-sign-in-form>

            ${hiddenSelector.matches('recover', true) ? '' : this.__renderSignInRecover()}
          </div>
        </div>

        ${this._renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  };

  render(): TemplateResult {
    if (this.page === 'access-recovery') return this.__renderAccessRecovery();
    return this.__renderSignIn();
  }
}
