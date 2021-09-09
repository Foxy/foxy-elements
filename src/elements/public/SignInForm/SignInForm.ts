import { Data, Templates } from './types';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { CheckboxElement } from '@vaadin/vaadin-checkbox';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { EmailFieldElement } from '@vaadin/vaadin-text-field/vaadin-email-field';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { validate as isEmail } from 'email-validator';

const NS = 'sign-in-form';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Form element for email/password sign in.
 *
 * @slot email:before
 * @slot email:after
 * @slot password:before
 * @slot password:after
 * @slot new-password:before
 * @slot new-password:after
 * @slot mfa-secret-code:before
 * @slot mfa-secret-code:after
 * @slot mfa-totp-code:before
 * @slot mfa-totp-code:after
 * @slot mfa-remember-device:before
 * @slot mfa-remember-device:after
 * @slot error:before
 * @slot error:after
 * @slot submit:before
 * @slot submit:after
 *
 * @element foxy-sign-in-form
 * @since 1.4.0
 */
export class SignInForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      issuer: { type: String },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ credential: c }) => !!c?.email || 'email_required',
      ({ credential: c }) => isEmail(c?.email ?? '') || 'email_invalid_email',
      ({ credential: c }) => !!c?.password || 'password_required',
      ({ credential: c }) => (c?.new_password?.length === 0 ? 'new_password_required' : true),
      ({ credential: c }) => (c?.mfa_totp_code?.length === 0 ? 'mfa_totp_code_required' : true),
    ];
  }

  templates: Templates = {};

  issuer = 'Unknown';

  private readonly __emailValidator = () => !this.errors.some(err => err.startsWith('email'));

  private readonly __passwordValidator = () => !this.errors.some(err => err.startsWith('password'));

  private readonly __newPasswordValidator = () => {
    return !this.errors.some(err => err.startsWith('new_password') && !err.endsWith('_error'));
  };

  private readonly __mfaTotpCodeValidator = () => {
    return !this.errors.some(err => err.startsWith('mfa_totp_code') && !err.endsWith('_error'));
  };

  private readonly __renderEmail = () => {
    const { disabledSelector, readonlySelector, errors } = this;

    const emailError = errors.find(err => err.startsWith('email'));
    const emailErrorKey = emailError?.replace('email', 'v8n');
    const emailErrorMessage = emailErrorKey ? this.t(emailErrorKey).toString() : '';

    const isBusy = this.in('busy');

    return html`
      <div>
        ${this.renderTemplateOrSlot('email:before')}

        <vaadin-email-field
          error-message=${emailErrorMessage}
          data-testid="email"
          class="w-full mb-m"
          label=${this.t('email').toString()}
          value=${ifDefined(this.form.credential?.email)}
          ?disabled=${isBusy || disabledSelector.matches('email', true)}
          ?readonly=${readonlySelector.matches('email', true)}
          .checkValidity=${this.__emailValidator}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @input=${(evt: InputEvent) => {
            const email = (evt.target as EmailFieldElement).value;
            const password = this.form.credential?.password ?? '';
            this.edit({ credential: { email, password }, type: 'password' });
          }}
        >
        </vaadin-email-field>

        ${this.renderTemplateOrSlot('email:after')}
      </div>
    `;
  };

  private readonly __renderPassword = () => {
    const { disabledSelector, readonlySelector, errors } = this;

    const passwordError = errors.find(err => err.startsWith('password'));
    const passwordErrorKey = passwordError?.replace('password', 'v8n');
    const passwordErrorMessage = passwordErrorKey ? this.t(passwordErrorKey).toString() : '';

    const isBusy = this.in('busy');

    return html`
      <div>
        ${this.renderTemplateOrSlot('password:before')}

        <vaadin-password-field
          error-message=${passwordErrorMessage}
          data-testid="password"
          class="w-full mb-m"
          label=${this.t('password').toString()}
          value=${ifDefined(this.form.credential?.password)}
          ?disabled=${isBusy || disabledSelector.matches('password', true)}
          ?readonly=${readonlySelector.matches('password', true)}
          .checkValidity=${this.__passwordValidator}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @input=${(evt: InputEvent) => {
            const email = this.form.credential?.email ?? '';
            const password = (evt.target as PasswordFieldElement).value;
            this.edit({ credential: { email, password }, type: 'password' });
          }}
        >
        </vaadin-password-field>

        ${this.renderTemplateOrSlot('password:after')}
      </div>
    `;
  };

  private readonly __renderNewPassword = () => {
    const { disabledSelector, readonlySelector, errors } = this;

    const error = errors.find(err => err.startsWith('new_password') && !err.endsWith('_error'));
    const errorKey = error?.replace('new_password', 'v8n');
    const errorMessage = errorKey ? this.t(errorKey).toString() : '';

    const isBusy = this.in('busy');

    return html`
      <div>
        ${this.renderTemplateOrSlot('new-password:before')}

        <vaadin-password-field
          error-message=${errorMessage}
          data-testid="new-password"
          class="w-full mb-m"
          label=${this.t('new_password').toString()}
          value=${ifDefined(this.form.credential?.new_password)}
          ?disabled=${isBusy || disabledSelector.matches('new-password', true)}
          ?readonly=${readonlySelector.matches('new-password', true)}
          .checkValidity=${this.__newPasswordValidator}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @input=${(evt: InputEvent) => {
            this.edit({
              type: 'password',
              credential: {
                email: this.form.credential?.email ?? '',
                password: this.form.credential?.password ?? '',
                new_password: (evt.target as PasswordFieldElement).value,
              },
            });
          }}
        >
        </vaadin-password-field>

        ${this.renderTemplateOrSlot('new-password:after')}
      </div>
    `;
  };

  private readonly __renderMfaTotpCode = () => {
    const { disabledSelector, readonlySelector, errors } = this;

    const mfaSecretCode = this.__mfaSecretCode;
    const prefix = 'mfa_totp_code';
    const scope = 'mfa-totp-code';
    const error = errors.find(err => err.startsWith(prefix) && !err.endsWith('_error'));
    const errorKey = error?.replace(prefix, 'v8n');
    const errorMessage = errorKey ? this.t(errorKey).toString() : '';

    const isBusy = this.in('busy');

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <vaadin-text-field
          error-message=${errorMessage}
          helper-text=${mfaSecretCode ? this.t('mfa_totp_code_hint') : ''}
          placeholder="123456"
          data-testid=${scope}
          class="w-full mb-m"
          label=${this.t(prefix).toString()}
          value=${ifDefined(this.form.credential?.mfa_totp_code)}
          ?disabled=${isBusy || disabledSelector.matches(scope, true)}
          ?readonly=${readonlySelector.matches(scope, true)}
          .checkValidity=${this.__mfaTotpCodeValidator}
          autofocus
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @input=${(evt: InputEvent) => {
            const mfaTotpCode = (evt.target as PasswordFieldElement).value;
            const credential = { ...this.form.credential!, mfa_totp_code: mfaTotpCode };
            if (mfaSecretCode) credential.mfa_secret_code = mfaSecretCode;
            this.edit({ type: 'password', credential });
          }}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  };

  private readonly __renderMfaSecretCode = () => {
    const scope = 'mfa-secret-code';
    const mfaSecretCode = this.__mfaSecretCode!;
    const issuer = encodeURIComponent(this.issuer);
    const email = encodeURIComponent(this.form.credential?.email ?? '');
    const otpauthUrl = new URL(`otpauth://totp/${issuer}:${email}`);

    otpauthUrl.searchParams.set('secret', mfaSecretCode);
    otpauthUrl.searchParams.set('issuer', this.issuer);

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <div
          data-testid=${scope}
          class="flex space-x-m overflow-hidden rounded border p-m mb-m border-contrast-10"
          style="background: white; color: black;"
        >
          <qr-code
            modulesize="2"
            margin="0"
            format="svg"
            class="inline-flex"
            data=${otpauthUrl.toString()}
          >
          </qr-code>

          <div class="break-all font-semibold leading-s text-xs tracking-widest">
            ${mfaSecretCode}
          </div>
        </div>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  };

  private readonly __renderMfaRememberDevice = () => {
    const { __mfaSecretCode: mfaSecretCode, form, lang, ns } = this;
    const scope = 'mfa-remember-device';
    const isBusy = this.in('busy');
    const isDisabled = isBusy || this.disabledSelector.matches(scope, true);

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <vaadin-checkbox
          data-testid=${scope}
          class="mb-m"
          ?disabled=${isDisabled}
          ?checked=${!!form.credential?.mfa_remember_device}
          @change=${(evt: CustomEvent) => {
            const target = evt.currentTarget as CheckboxElement;
            const credential = {
              ...form.credential!,
              mfa_remember_device: target.checked,
              mfa_totp_code: form.credential?.mfa_totp_code ?? '',
            };

            if (mfaSecretCode) credential.mfa_secret_code = mfaSecretCode;
            this.edit({ credential });
          }}
        >
          <foxy-i18n class="block" lang=${lang} key="mfa_remember_device" ns=${ns}></foxy-i18n>
          <foxy-i18n
            class="block text-xs ${isDisabled ? 'text-disabled' : 'text-secondary'}"
            lang=${lang}
            key="mfa_remember_device_hint"
            ns=${ns}
          >
          </foxy-i18n>
        </vaadin-checkbox>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  };

  private readonly __renderError = () => {
    return html`
      <div>
        ${this.renderTemplateOrSlot('error:before')}

        <p class="leading-s flex items-start text-s rounded p-s bg-error-10 text-error">
          <iron-icon class="flex-shrink-0 mr-s" icon="lumo:error"></iron-icon>
          <foxy-i18n data-testid="error" lang=${this.lang} key=${this.errors[0]} ns=${this.ns}>
          </foxy-i18n>
        </p>

        ${this.renderTemplateOrSlot('error:after')}
      </div>
    `;
  };

  private readonly __renderSubmit = () => {
    const isValid =
      this.in({ idle: { snapshot: { dirty: 'valid' } } }) ||
      this.in({ idle: { snapshot: { clean: 'valid' } } }) ||
      this.in({ idle: { template: { dirty: 'valid' } } }) ||
      this.in({ idle: { template: { clean: 'valid' } } });

    return html`
      <div>
        ${this.renderTemplateOrSlot('submit:before')}

        <vaadin-button
          data-testid="submit"
          class="w-full mt-m"
          theme="primary"
          ?disabled=${!isValid || this.in('busy') || this.disabledSelector.matches('submit', true)}
          @click=${() => this.submit()}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="sign_in"></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('submit:after')}
      </div>
    `;
  };

  render(): TemplateResult {
    const { hiddenSelector, errors, lang, form, ns } = this;
    const mfaSecretCode = this.__mfaSecretCode;
    const mfaTotpCode = form.credential?.mfa_totp_code;

    const isMfaRequired =
      !!mfaSecretCode || !!mfaTotpCode || errors.some(err => err.startsWith('mfa'));

    const isNewPasswordRequired =
      typeof this.form.credential?.new_password === 'string' ||
      errors.some(error => error.startsWith('new_password_'));

    const isMfaTotpCodeHidden =
      (!isMfaRequired && !mfaTotpCode) || hiddenSelector.matches('mfa-totp-code', true);

    const isMfaRememberDeviceHidden =
      !isMfaRequired ||
      (isMfaRequired && mfaSecretCode) ||
      hiddenSelector.matches('mfa-remember-device', true);

    const isMfaSecretCodeHidden = !mfaSecretCode || hiddenSelector.matches('mfa-secret-code', true);
    const isNewPasswordHidden = isMfaRequired || hiddenSelector.matches('new-password', true);
    const isFailed = errors.some(error => error.endsWith('_error'));
    const isBusy = this.in('busy');

    return html`
      <main aria-live="polite" aria-busy=${isBusy} class="relative font-lumo text-m leading-m">
        ${hiddenSelector.matches('email', true) ? '' : this.__renderEmail()}
        ${isMfaRequired || hiddenSelector.matches('password', true) ? '' : this.__renderPassword()}
        ${isNewPasswordHidden || !isNewPasswordRequired ? '' : this.__renderNewPassword()}
        ${isMfaTotpCodeHidden ? '' : this.__renderMfaTotpCode()}
        ${isMfaSecretCodeHidden ? '' : this.__renderMfaSecretCode()}
        ${isMfaRememberDeviceHidden ? '' : this.__renderMfaRememberDevice()}
        ${hiddenSelector.matches('error', true) || !isFailed ? '' : this.__renderError()}
        ${hiddenSelector.matches('submit', true) ? '' : this.__renderSubmit()}

        <div
          data-testid="spinner"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !isBusy,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state="busy"
            lang=${lang}
            ns="${ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </main>
    `;
  }

  protected async _fetch(...args: Parameters<Window['fetch']>): Promise<Data> {
    try {
      return await super._fetch(...args);
    } catch (err) {
      let v8nError = 'unknown_error';

      try {
        const code = (await (err as Response).json())._embedded['fx:errors'][0].code;
        if (typeof code === 'string') v8nError = code;
      } catch {
        // Unknown error format, ignoring.
      }

      throw [v8nError];
    }
  }

  private get __mfaSecretCode() {
    const storedSecret = this.form.credential?.mfa_secret_code;
    if (storedSecret) return storedSecret;

    const prefix = 'mfa_required';
    const mfaSetupError = this.errors.find(error => error.startsWith(prefix));
    return mfaSetupError?.replace(prefix, '').trim();
  }
}
