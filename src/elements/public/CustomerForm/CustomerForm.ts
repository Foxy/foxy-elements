import type { VanillaHCaptchaWebComponent } from 'vanilla-hcaptcha';
import type { Data, Settings } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { ScopedElementsMap } from '@open-wc/scoped-elements';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { validate as isEmail } from 'email-validator';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

import checkPasswordStrength from 'check-password-strength';

const NS = 'customer-form';
const Base = ScopedElementsMixin(TranslatableMixin(InternalForm, NS));
const passwordStrength = checkPasswordStrength.passwordStrength;

/**
 * Form element for creating or editing customers.
 *
 * @element foxy-customer-form
 * @since 1.2.0
 */
export class CustomerForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-customer-form-legal-notice-control': customElements.get(
        'foxy-internal-customer-form-legal-notice-control'
      ),
      'foxy-internal-radio-group-control': customElements.get('foxy-internal-radio-group-control'),
      'foxy-internal-timestamps-control': customElements.get('foxy-internal-timestamps-control'),
      'foxy-internal-password-control': customElements.get('foxy-internal-password-control'),
      'foxy-internal-create-control': customElements.get('foxy-internal-create-control'),
      'foxy-internal-delete-control': customElements.get('foxy-internal-delete-control'),
      'foxy-internal-text-control': customElements.get('foxy-internal-text-control'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'h-captcha': customElements.get('h-captcha'),
      'vaadin-button': customElements.get('vaadin-button'),
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      passwordless: { type: Boolean },
      settings: { type: Object },
    };
  }

  static get v8n(): NucleonV8N<Data, CustomerForm> {
    return [
      ({ password, _links, is_anonymous = true }, host) => {
        if (host.passwordless) return true;
        return !_links && !is_anonymous && !password ? 'password:v8n_required' : true;
      },
      ({ password_old, password, _links }, host) => {
        if (!_links) return true;
        if (host.settings?.sign_up === undefined) return true;
        return password && !password_old ? 'password-old:v8n_required' : true;
      },
      ({ first_name: v }) => !v || v.length <= 50 || 'first-name:v8n_too_long',
      ({ last_name: v }) => !v || v.length <= 50 || 'last-name:v8n_too_long',
      ({ password: v }) => !v || passwordStrength(v).id >= 2 || 'password:v8n_too_weak',
      ({ password: v }) => !v || v.length <= 50 || 'password:v8n_too_long',
      ({ tax_id: v }) => !v || v.length <= 50 || 'tax-id:v8n_too_long',
      ({ email: v }) => (v && v.length > 0) || 'email:v8n_required',
      ({ email: v }) => !v || v.length <= 100 || 'email:v8n_too_long',
      ({ email: v }) => !v || isEmail(v) || 'email:v8n_invalid_email',
    ];
  }

  /** If true, won't require password when creating a customer. */
  passwordless = false;

  /** Full `fx:customer_portal_settings` resource from Customer API. If present, switches this element into the Customer API mode, enabling client verification. */
  settings: Settings | null = null;

  private readonly __isAnonymousGetValue = () => {
    return this.form?.is_anonymous === false ? 'false' : 'true';
  };

  private readonly __isAnonymousSetValue = (newValue: string) => {
    const isAnonymous = newValue === 'true';
    this.edit({ is_anonymous: isAnonymous });
    if (isAnonymous && this.form.password) this.edit({ password: '' });
    if (isAnonymous && this.form.password_old) this.edit({ password_old: '' });
    if (isAnonymous && this.form.forgot_password) this.edit({ forgot_password: '' });
  };

  private readonly __isAnonymousOptions = [
    { value: 'true', label: 'option_true' },
    { value: 'false', label: 'option_false' },
  ];

  private __refreshInterval: NodeJS.Timeout | null = null;

  get hiddenSelector(): BooleanSelector {
    const hidden = new Set<string>(super.hiddenSelector.toString().split(' '));

    if (this.settings) {
      hidden.add('forgot-password');
      hidden.add('is-anonymous');
      if (!this.form.password) hidden.add('password-old');
      if (this.settings.tos_checkbox_settings.usage === 'none') hidden.add('legal-notice');
    } else {
      if (this.form.is_anonymous !== false) {
        hidden.add('forgot-password');
        hidden.add('password');
      }
      hidden.add('password-old');
      hidden.add('legal-notice');
    }

    if (this.href) {
      hidden.add('is-anonymous');
      hidden.add('legal-notice');
    }

    return new BooleanSelector(Array.from(hidden).join(' ').trim());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    const interval = this.__refreshInterval;
    if (interval) clearInterval(interval);
  }

  connectedCallback(): void {
    super.connectedCallback();
    const interval = setInterval(() => this.requestUpdate(), 60 * 1000);
    this.__refreshInterval = interval;
  }

  renderBody(): TemplateResult {
    const isFirstNameHidden = this.hiddenSelector.matches('first-name', true);
    const isLastNameHidden = this.hiddenSelector.matches('last-name', true);

    return html`
      <div
        class=${classMap({
          'grid-cols-2': !isFirstNameHidden && !isLastNameHidden,
          'hidden': isFirstNameHidden && isLastNameHidden,
          'gap-m': true,
          'grid': !isFirstNameHidden || !isLastNameHidden,
        })}
      >
        <foxy-internal-text-control infer="first-name"></foxy-internal-text-control>
        <foxy-internal-text-control infer="last-name"></foxy-internal-text-control>
      </div>

      <foxy-internal-text-control helper-text=${this.__emailHelperText} infer="email">
      </foxy-internal-text-control>

      <foxy-internal-radio-group-control
        infer="is-anonymous"
        .getValue=${this.__isAnonymousGetValue}
        .setValue=${this.__isAnonymousSetValue}
        .options=${this.__isAnonymousOptions}
      >
      </foxy-internal-radio-group-control>

      <foxy-internal-password-control
        placeholder=${this.__passwordPlaceholder}
        helper-text=${this.__passwordHelperText}
        infer="password"
        show-generator
      >
      </foxy-internal-password-control>

      <foxy-internal-password-control infer="password-old"></foxy-internal-password-control>

      <foxy-internal-password-control
        helper-text=${this.__forgotPasswordHelperText}
        infer="forgot-password"
        show-generator
      >
      </foxy-internal-password-control>

      <foxy-internal-text-control infer="tax-id"></foxy-internal-text-control>

      <foxy-internal-customer-form-legal-notice-control infer="legal-notice">
      </foxy-internal-customer-form-legal-notice-control>

      ${!this.data &&
      this.settings?.sign_up?.enabled &&
      this.settings?.sign_up?.verification.type === 'hcaptcha'
        ? html`
            <h-captcha
              site-key=${this.settings.sign_up.verification.site_key}
              class="hidden"
              size="invisible"
              hl=${this.lang}
              @verified=${({ token }: Record<'token' | 'eKey', string>) => {
                this.edit({ verification: { type: 'hcaptcha', token } });
                super.submit();
              }}
            >
            </h-captcha>
          `
        : ''}
      ${super.renderBody()}
    `;
  }

  submit(): void {
    if (this.settings?.sign_up?.verification?.type === 'hcaptcha' && !this.data) {
      this.__hcaptcha?.reset();
      this.__hcaptcha?.execute();
    } else {
      super.submit();
    }
  }

  protected async _sendPatch(edits: Partial<Data>): Promise<Data> {
    const data = await super._sendPatch(edits);

    if (edits.password) {
      const status = { key: 'password_change_success', options: { email: data.email } };
      this.status = status;
    }

    return data;
  }

  protected async _sendGet(): Promise<Data> {
    this.status = null;
    return await super._sendGet();
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    try {
      return await super._fetch(...args);
    } catch (err) {
      let message;

      try {
        message = (await (err as Response).json())._embedded['fx:errors'][0].message;
      } catch {
        throw err;
      }

      if (message === 'Conflict' || message.startsWith('This email address is already in use')) {
        throw ['error:email_already_used'];
      } else if (message.startsWith('Customer registration is disabled')) {
        throw ['error:registration_disabled'];
      } else if (message.startsWith('Client verification failed')) {
        throw ['error:verification_failed'];
      } else if (message.startsWith('Provided password is incorrect')) {
        throw ['error:old_password_incorrect'];
      } else {
        throw err;
      }
    }
  }

  private get __forgotPasswordHelperText() {
    const createdOn = this.data?.forgot_password_timestamp;
    const password = this.data?.forgot_password;
    const i18nKey = 'forgot-password.helper_text';

    if (password && createdOn) {
      const expiresOn = new Date(new Date(createdOn).getTime() + 30 * 60 * 1000);
      const expiresInMin = Math.floor((expiresOn.getTime() - Date.now()) / 1000 / 60);
      if (expiresInMin <= 0) return this.t(`${i18nKey}_expired_on`, { expiresOn });
      return this.t(`${i18nKey}_expires_in`, { expiresInMin: `${expiresInMin}minutes` });
    } else {
      return this.t(i18nKey);
    }
  }

  private get __passwordPlaceholder() {
    return this.data ? this.t('password.placeholder_new') : this.t('password.placeholder');
  }

  private get __passwordHelperText() {
    return this.data ? this.t('password.helper_text_new') : this.t('password.helper_text');
  }

  private get __emailHelperText() {
    return this.data?.last_login_date
      ? this.t('email.helper_text_last_login_date', { date: this.data.last_login_date })
      : this.t('email.helper_text');
  }

  private get __hcaptcha() {
    return this.renderRoot.querySelector<VanillaHCaptchaWebComponent>('h-captcha');
  }
}
