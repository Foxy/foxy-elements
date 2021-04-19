import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  html,
} from 'lit-element';

import { API } from '../NucleonElement/API';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { EmailFieldElement } from '@vaadin/vaadin-text-field/vaadin-email-field';
import { I18n } from '../I18n/I18n';
import { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { createBooleanSelectorProperty } from '../../../utils/create-boolean-selector-property';

type State = 'invalid' | 'valid' | 'busy' | { fail: 'invalid' | 'unknown' };

/**
 * Form element for email/password sign in.
 *
 * @fires SignInForm#fetch - Instance of `SignInForm.API.FetchEvent`. Emitted before each API request.
 *
 * @element foxy-sign-in-form
 * @since 1.4.0
 */
export class SignInForm extends LitElement {
  /** API class constructor used by the instances of this class. */
  static readonly API = API;

  static readonly UpdateEvent = class extends CustomEvent<void> {};

  static get properties(): PropertyDeclarations {
    return {
      ...createBooleanSelectorProperty('readonly'),
      ...createBooleanSelectorProperty('disabled'),
      ...createBooleanSelectorProperty('excluded'),
      lang: { type: String },
      email: { type: String },
      password: { type: String },
    };
  }

  static get styles(): CSSResultArray | CSSResult {
    return Themeable.styles;
  }

  /** Optional ISO 639-1 code describing the language element content is written in. */
  lang = '';

  /** User email. Value of this property is bound to the form field. */
  email = '';

  /** User password. Value of this property is bound to the form field. */
  password = '';

  /** Makes the entire form or a part of it readonly. Customizable parts: `email` and `password`. */
  readonly = BooleanSelector.False;

  /** Disables the entire form or a part of it. Customizable parts: `email`, `password` and `submit`. */
  disabled = BooleanSelector.False;

  /** Hides the entire form or a part of it. Customizable parts: `email`, `password`, `submit`, `error` and `spinner`. */
  excluded = BooleanSelector.False;

  private __state: State = 'invalid';

  private __untrackTranslations?: () => void;

  private static __ns = 'sign-in-form';

  connectedCallback(): void {
    super.connectedCallback();
    const I18nElement = customElements.get('foxy-i18n') as typeof I18n;
    this.__untrackTranslations = I18nElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    return html`
      <div
        aria-live="polite"
        aria-busy=${this.__state === 'busy'}
        class="relative font-lumo text-m leading-m"
      >
        ${!this.excluded.matches('email')
          ? html`
              <vaadin-email-field
                class="w-full mb-m"
                label=${this.__t('email').toString()}
                value=${this.email}
                ?disabled=${this.__state === 'busy' || this.disabled.matches('email')}
                ?readonly=${this.readonly.matches('email')}
                required
                @input=${this.__handleEmailInput}
                @keydown=${this.__handleKeyDown}
              >
              </vaadin-email-field>
            `
          : ''}
        <!---->
        ${!this.excluded.matches('password')
          ? html`
              <vaadin-password-field
                class="w-full mb-m"
                label=${this.__t('password').toString()}
                value=${this.password}
                ?disabled=${this.__state === 'busy' || this.disabled.matches('password')}
                ?readonly=${this.readonly.matches('password')}
                required
                @input=${this.__handlePasswordInput}
                @keydown=${this.__handleKeyDown}
              >
              </vaadin-password-field>
            `
          : ''}
        <!---->
        ${typeof this.__state === 'object' && this.__state.fail && !this.excluded.matches('error')
          ? html`
              <div class="flex items-center text-s bg-error-10 rounded p-s text-error mb-m">
                <iron-icon icon="lumo:error" class="self-start flex-shrink-0 mr-s"></iron-icon>
                <foxy-i18n
                  class="leading-s"
                  lang=${this.lang}
                  ns=${SignInForm.__ns}
                  key=${this.__state.fail === 'invalid'
                    ? 'invalid_email_or_password_error'
                    : 'unknown_error'}
                >
                </foxy-i18n>
              </div>
            `
          : ''}
        <!---->
        ${!this.excluded.matches('submit')
          ? html`
              <vaadin-button
                class=${classMap({ 'w-full': true, 'mt-l': typeof this.__state === 'string' })}
                theme="primary"
                ?disabled=${this.__state === 'busy' || this.disabled.matches('submit')}
                @click=${this.__submit}
              >
                <foxy-i18n ns=${SignInForm.__ns} lang=${this.lang} key="sign_in"></foxy-i18n>
              </vaadin-button>
            `
          : ''}
        <!---->
        ${this.__state === 'busy' && !this.excluded.matches('spinner')
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  layout="vertical"
                  data-testid="spinner"
                >
                </foxy-spinner>
              </div>
            `
          : ''}
      </div>
    `;
  }

  /** Submits the form if it's valid. */
  submit(): void {
    this.__submit();
  }

  in(stateValue: State): boolean {
    if (typeof stateValue === 'string' && typeof this.__state === 'string') {
      return this.__state === stateValue;
    } else if (typeof stateValue === 'object' && typeof this.__state === 'object') {
      return this.__state.fail === stateValue.fail;
    } else {
      return false;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
  }

  private get __t() {
    const I18nElement = customElements.get('foxy-i18n') as typeof I18n;
    return I18nElement.i18next.getFixedT(this.lang, SignInForm.__ns);
  }

  private get __emailField() {
    return this.renderRoot.querySelector('vaadin-email-field') as EmailFieldElement;
  }

  private get __passwordField() {
    return this.renderRoot.querySelector('vaadin-password-field') as PasswordFieldElement;
  }

  private async __submit() {
    const isEmailValid = this.__emailField.validate();
    const isPasswordValid = this.__passwordField.validate();

    if (!isEmailValid || !isPasswordValid) return;
    this.__setState('busy');

    const response = await new API(this).fetch('foxy://auth/session', {
      method: 'POST',
      body: JSON.stringify({
        type: 'password',
        credential: { email: this.email, password: this.password },
      }),
    });

    this.__setState(
      response.ok ? 'valid' : { fail: response.status === 401 ? 'invalid' : 'unknown' }
    );
  }

  private __setState(newState: State) {
    this.__state = newState;
    this.dispatchEvent(new SignInForm.UpdateEvent('update'));
    this.requestUpdate();
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.__submit();
  }

  private __handleEmailInput(evt: InputEvent) {
    this.email = (evt.target as EmailFieldElement).value;
  }

  private __handlePasswordInput(evt: InputEvent) {
    this.password = (evt.target as PasswordFieldElement).value;
  }
}
