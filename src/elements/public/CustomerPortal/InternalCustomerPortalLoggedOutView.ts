import {
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { AccessRecoveryForm } from '..';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { SignInForm } from '../SignInForm';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';

const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(LitElement)));

export class InternalCustomerPortalLoggedOutView extends Base {
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
        .max-w-20rem {
          max-width: 20rem;
        }
      `,
    ];
  }

  group = '';

  page: 'sign-in' | 'access-recovery' = 'sign-in';

  private readonly __renderAccessRecoveryHeader = () => {
    const { lang, ns } = this;
    const formId = '#access-recovery-form';
    const form = this.renderRoot.querySelector(formId) as AccessRecoveryForm | null;
    const isBusy = !!form?.in('busy');

    return html`
      <div class="flex flex-col leading-m font-lumo" data-testid="access-recovery:header">
        ${this.renderTemplateOrSlot('access-recovery:header:before')}

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
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="cancel"></foxy-i18n>
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
        <div class="m-auto max-w-20rem flex-1">
          ${this.renderTemplateOrSlot(`${scope}:before`)}

          <div class="space-y-l">
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
      <div class="flex flex-col leading-m font-lumo" data-testid="sign-in:header">
        ${this.renderTemplateOrSlot('sign-in:header:before')}

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
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="recover_access"></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('sign-in:recover:after')}
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

    return html`
      <div class="h-full flex" data-testid="sign-in">
        <div class="m-auto max-w-20rem flex-1">
          ${this.renderTemplateOrSlot(`${scope}:before`)}

          <div class="space-y-l">
            ${hiddenSelector.matches('header', true) ? '' : this.__renderSignInHeader()}
            <div class="space-y-s">
              ${hiddenSelector.matches('form', true) ? '' : this.__renderSignInForm()}
              ${hiddenSelector.matches('recover', true) ? '' : this.__renderSignInRecover()}
            </div>
          </div>

          ${this.renderTemplateOrSlot(`${scope}:after`)}
        </div>
      </div>
    `;
  };

  render(): TemplateResult {
    const { page, hiddenSelector } = this;

    if (page === 'access-recovery' && !hiddenSelector.matches('access-recovery', true)) {
      return this.__renderAccessRecovery();
    }

    if (page === 'sign-in' && !hiddenSelector.matches('sign-in', true)) {
      return this.__renderSignIn();
    }

    return html``;
  }
}
