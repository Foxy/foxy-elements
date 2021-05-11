import { TemplateResult, html } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data } from './types';
import { EmailFieldElement } from '@vaadin/vaadin-text-field/vaadin-email-field';
import { NucleonElement } from '..';
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
 * Configurable controls:
 *
 * - `email`
 * - `password`
 * - `error`
 * - `submit`
 *
 * @slot email:before
 * @slot email:after
 * @slot password:before
 * @slot password:after
 * @slot error:before
 * @slot error:after
 * @slot submit:before
 * @slot submit:after
 *
 * @element foxy-sign-in-form
 * @since 1.4.0
 */
export class SignInForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ credential: c }) => !!c?.email || 'email_required',
      ({ credential: c }) => isEmail(c?.email ?? '') || 'email_invalid_email',
      ({ credential: c }) => !!c?.password || 'password_required',
    ];
  }

  private readonly __emailValidator = () => !this.errors.some(err => err.startsWith('email'));

  private readonly __passwordValidator = () => !this.errors.some(err => err.startsWith('password'));

  private readonly __renderEmail = () => {
    const { disabledSelector, readonlySelector, errors } = this;

    const emailError = errors.find(err => err.startsWith('email'));
    const emailErrorKey = emailError?.replace('email', 'v8n');
    const emailErrorMessage = emailErrorKey ? this.t(emailErrorKey).toString() : '';

    const isBusy = this.in('busy');

    return html`
      <div>
        <slot name="email:before"></slot>

        <vaadin-email-field
          error-message=${emailErrorMessage}
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

        <slot name="email:after"></slot>
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
        <slot name="password:before"></slot>

        <vaadin-password-field
          error-message=${passwordErrorMessage}
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

        <slot name="password:after"></slot>
      </div>
    `;
  };

  private readonly __renderError = () => {
    return html`
      <div>
        <slot name="error:before"></slot>

        <p class="leading-s flex items-start text-s rounded p-s bg-error-10 text-error">
          <iron-icon class="flex-shrink-0 mr-s" icon="lumo:error"></iron-icon>
          <foxy-i18n lang=${this.lang} key=${this.errors[0]} ns=${this.ns}></foxy-i18n>
        </p>

        <slot name="error:after"></slot>
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
        <slot name="submit:before"></slot>

        <vaadin-button
          class=${classMap({ 'w-full': true, 'mt-l': !this.in('fail') })}
          theme="primary"
          ?disabled=${!isValid || this.in('busy') || this.disabledSelector.matches('submit', true)}
          @click=${this.submit}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="sign_in"></foxy-i18n>
        </vaadin-button>

        <slot name="submit:after"></slot>
      </div>
    `;
  };

  render(): TemplateResult {
    const { hiddenSelector, errors, lang, ns } = this;

    const isCredentialUnknown = errors.includes('invalid_email_or_password_error');
    const isErrorUnknown = errors.includes('unknown_error');
    const isFailed = isErrorUnknown || isCredentialUnknown;
    const isBusy = this.in('busy');

    return html`
      <main aria-live="polite" aria-busy=${isBusy} class="relative font-lumo text-m leading-m">
        ${hiddenSelector.matches('email', true) ? '' : this.__renderEmail()}
        ${hiddenSelector.matches('password', true) ? '' : this.__renderPassword()}
        ${hiddenSelector.matches('error', true) || !isFailed ? '' : this.__renderError()}
        ${hiddenSelector.matches('submit', true) ? '' : this.__renderSubmit()}

        <div
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex items-center justify-center': true,
            'opacity-0 pointer-events-none': !isBusy,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            lang=${lang}
            ns=${ns}
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
      const status = (err as Response).status;
      throw [status === 401 ? 'invalid_email_or_password_error' : 'unknown_error'];
    }
  }
}
