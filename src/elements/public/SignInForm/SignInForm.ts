import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-element';

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
      ({ credential: c }) => (c?.new_password?.length === 0 ? 'new_password_required' : true),
    ];
  }

  templates: Templates = {};

  private readonly __emailValidator = () => !this.errors.some(err => err.startsWith('email'));

  private readonly __passwordValidator = () => !this.errors.some(err => err.startsWith('password'));

  private readonly __newPasswordValidator = () => {
    return !this.errors.some(err => err.startsWith('new_password') && !err.endsWith('_error'));
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
    const { hiddenSelector, errors, lang, ns } = this;

    const isNewPasswordRequired =
      typeof this.form.credential?.new_password === 'string' ||
      errors.some(error => error.startsWith('new_password_'));

    const isNewPasswordHidden = hiddenSelector.matches('new-password', true);
    const isFailed = errors.some(error => error.endsWith('_error'));
    const isBusy = this.in('busy');

    return html`
      <main aria-live="polite" aria-busy=${isBusy} class="relative font-lumo text-m leading-m">
        ${hiddenSelector.matches('email', true) ? '' : this.__renderEmail()}
        ${hiddenSelector.matches('password', true) ? '' : this.__renderPassword()}
        ${!isNewPasswordRequired || isNewPasswordHidden ? '' : this.__renderNewPassword()}
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
}
