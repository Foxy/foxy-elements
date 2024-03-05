import './index';

import type { VanillaHCaptchaWebComponent } from 'vanilla-hcaptcha';
import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { CustomerForm } from './CustomerForm';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { getTestData } from '../../../testgen/getTestData';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { InternalRadioGroupControl } from '../../internal/InternalRadioGroupControl/InternalRadioGroupControl';
import { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';
import { InternalCustomerFormLegalNoticeControl } from './internal/InternalCustomerFormLegalNoticeControl/InternalCustomerFormLegalNoticeControl';
import { createRouter } from '../../../server/hapi';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { stub } from 'sinon';
import { Data } from './types';

const portalSettings = {
  _links: { self: { href: '' } },
  allowed_origins: [],
  subscriptions: {
    allow_frequency_modification: [],
    allow_next_date_modification: false,
  },
  session_lifespan_in_minutes: 40320,
  tos_checkbox_settings: {
    usage: 'optional' as const,
    url: 'https://foxy.io/terms-of-service/',
    initial_state: 'unchecked' as const,
    is_hidden: false,
  },
  sign_up: {
    verification: { type: 'hcaptcha' as const, site_key: '123' },
    enabled: true,
  },
  sso: true,
  date_created: '',
  date_modified: '',
};

describe('CustomerForm', () => {
  it('imports and defines h-captcha element', () => {
    expect(customElements.get('h-captcha')).to.exist;
  });

  it('imports and defines foxy-internal-radio-group-control element', () => {
    expect(customElements.get('foxy-internal-radio-group-control')).to.exist;
  });

  it('imports and defines foxy-internal-password-control element', () => {
    expect(customElements.get('foxy-internal-password-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control element', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-customer-form-legal-notice-control element', () => {
    expect(customElements.get('foxy-internal-customer-form-legal-notice-control')).to.exist;
  });

  it('imports and defines foxy-internal-form element', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines itself as foxy-customer-form', () => {
    expect(customElements.get('foxy-customer-form')).to.equal(CustomerForm);
  });

  it('extends InternalForm', () => {
    expect(new CustomerForm()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace of customer-form', () => {
    expect(CustomerForm).to.have.property('defaultNS', 'customer-form');
    expect(new CustomerForm()).to.have.property('ns', 'customer-form');
  });

  it('has a reactive property passwordless (false by default)', () => {
    expect(CustomerForm).to.have.deep.nested.property('properties.passwordless', { type: Boolean });
    expect(new CustomerForm()).to.have.property('passwordless', false);
  });

  it('has a reactive property settings (null by default)', () => {
    expect(CustomerForm).to.have.deep.nested.property('properties.settings', { type: Object });
    expect(new CustomerForm()).to.have.property('settings', null);
  });

  it('requires password when creating non-guest customers, unless passwordless', async () => {
    const form = new CustomerForm();
    expect(form.errors).to.not.include('password:v8n_required');

    form.edit({ is_anonymous: true });
    expect(form.errors).to.not.include('password:v8n_required');

    form.edit({ is_anonymous: false });
    expect(form.errors).to.include('password:v8n_required');

    form.passwordless = true;
    form.edit({ password: '' });
    expect(form.errors).to.not.include('password:v8n_required');

    form.edit({ password: '123' });
    expect(form.errors).to.not.include('password:v8n_required');

    form.passwordless = false;
    form.edit({ password: '' });
    expect(form.errors).to.include('password:v8n_required');

    form.data = await getTestData('./hapi/customers/0');
    expect(form.errors).to.not.include('password:v8n_required');
  });

  it('requires old password when updating password as customer', async () => {
    const form = new CustomerForm();
    expect(form.errors).to.not.include('password-old:v8n_required');

    form.data = await getTestData('./hapi/customers/0');
    expect(form.errors).to.not.include('password-old:v8n_required');

    form.edit({ password: '123' });
    expect(form.errors).to.not.include('password-old:v8n_required');

    form.settings = portalSettings;
    form.edit({ password: '123' });
    expect(form.errors).to.include('password-old:v8n_required');

    form.edit({ password_old: '456' });
    expect(form.errors).to.not.include('password-old:v8n_required');
  });

  it('prevents first name from exceeding 50 characters', () => {
    const form = new CustomerForm();
    expect(form.errors).to.not.include('first-name:v8n_too_long');

    form.edit({ first_name: 'a'.repeat(50) });
    expect(form.errors).to.not.include('first-name:v8n_too_long');

    form.edit({ first_name: 'a'.repeat(51) });
    expect(form.errors).to.include('first-name:v8n_too_long');
  });

  it('prevents last name from exceeding 50 characters', () => {
    const form = new CustomerForm();
    expect(form.errors).to.not.include('last-name:v8n_too_long');

    form.edit({ last_name: 'a'.repeat(50) });
    expect(form.errors).to.not.include('last-name:v8n_too_long');

    form.edit({ last_name: 'a'.repeat(51) });
    expect(form.errors).to.include('last-name:v8n_too_long');
  });

  it('requires strong password', () => {
    const form = new CustomerForm();
    expect(form.errors).to.not.include('password:v8n_too_weak');

    form.edit({ password: 'a'.repeat(8) });
    expect(form.errors).to.include('password:v8n_too_weak');

    form.edit({ password: 'jKdfhkYGJH822__21!!*ssdn-s++' });
    expect(form.errors).to.not.include('password:v8n_too_weak');
  });

  it('prevents password from exceeding 50 characters', () => {
    const form = new CustomerForm();
    expect(form.errors).to.not.include('password:v8n_too_long');

    form.edit({ password: 'a'.repeat(50) });
    expect(form.errors).to.not.include('password:v8n_too_long');

    form.edit({ password: 'a'.repeat(51) });
    expect(form.errors).to.include('password:v8n_too_long');
  });

  it('prevents tax id from exceeding 50 characters', () => {
    const form = new CustomerForm();
    expect(form.errors).to.not.include('tax-id:v8n_too_long');

    form.edit({ tax_id: 'a'.repeat(50) });
    expect(form.errors).to.not.include('tax-id:v8n_too_long');

    form.edit({ tax_id: 'a'.repeat(51) });
    expect(form.errors).to.include('tax-id:v8n_too_long');
  });

  it('requires email', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    expect(form.errors).to.include('email:v8n_required');

    form.edit({ email: 'test@test.com' });
    expect(form.errors).to.not.include('email:v8n_required');
  });

  it('prevents email from exceeding 100 characters', () => {
    const form = new CustomerForm();
    expect(form.errors).to.not.include('email:v8n_too_long');

    form.edit({ email: 'a'.repeat(100) });
    expect(form.errors).to.not.include('email:v8n_too_long');

    form.edit({ email: 'a'.repeat(101) });
    expect(form.errors).to.include('email:v8n_too_long');
  });

  it('requires email to be valid', () => {
    const form = new CustomerForm();
    expect(form.errors).to.not.include('email:v8n_invalid_email');

    form.edit({ email: 'aaaa' });
    expect(form.errors).to.include('email:v8n_invalid_email');

    form.edit({ email: 'test@test.com' });
    expect(form.errors).to.not.include('email:v8n_invalid_email');
  });

  it('renders a text field for first name', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const control = form.renderRoot.querySelector('[infer="first-name"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text field for last name', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const control = form.renderRoot.querySelector('[infer="last-name"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text field for tax id', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const control = form.renderRoot.querySelector('[infer="tax-id"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
  });

  it('renders a text field for email', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const control = form.renderRoot.querySelector('[infer="email"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('helper-text', 'email.helper_text');

    const data = await getTestData<Data>('./hapi/customers/0');
    data.last_login_date = new Date().toISOString();
    form.data = data;
    await form.requestUpdate();

    expect(control).to.have.attribute('helper-text', 'email.helper_text_last_login_date');
  });

  it('renders a radio group control for anonymity selection', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const root = form.renderRoot;
    const control = root.querySelector<InternalRadioGroupControl>('[infer="is-anonymous"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalRadioGroupControl);
    expect(control?.getValue()).to.equal('true');
    expect(control).to.have.deep.property('options', [
      { value: 'true', label: 'option_true' },
      { value: 'false', label: 'option_false' },
    ]);

    form.edit({ is_anonymous: false });
    expect(control?.getValue()).to.equal('false');

    form.edit({ is_anonymous: true });
    expect(control?.getValue()).to.equal('true');

    form.edit({ password: '123', password_old: '456', forgot_password: '789' });
    control?.setValue('false');
    expect(form).to.have.nested.property('form.is_anonymous', false);
    expect(form).to.have.nested.property('form.password', '123');
    expect(form).to.have.nested.property('form.password_old', '456');
    expect(form).to.have.nested.property('form.forgot_password', '789');

    control?.setValue('true');
    expect(form).to.have.nested.property('form.is_anonymous', true);
    expect(form).to.have.nested.property('form.password', '');
    expect(form).to.have.nested.property('form.password_old', '');
    expect(form).to.have.nested.property('form.forgot_password', '');
  });

  it('renders a password field for password', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const control = form.renderRoot.querySelector('[infer="password"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.attribute('placeholder', 'password.placeholder');
    expect(control).to.have.attribute('helper-text', 'password.helper_text');

    form.data = await getTestData<Data>('./hapi/customers/0');
    await form.requestUpdate();
    expect(control).to.have.attribute('placeholder', 'password.placeholder_new');
    expect(control).to.have.attribute('helper-text', 'password.helper_text_new');
  });

  it('renders a password field for old password', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const control = form.renderRoot.querySelector('[infer="password-old"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
  });

  it('renders a password field for one-time password', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const control = form.renderRoot.querySelector('[infer="forgot-password"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalPasswordControl);
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.attribute('helper-text', 'forgot-password.helper_text');

    const data = await getTestData<Data>('./hapi/customers/0');
    data.forgot_password = '123';
    data.forgot_password_timestamp = new Date().toISOString();
    form.data = data;
    await form.requestUpdate();
    expect(control).to.have.attribute('helper-text', 'forgot-password.helper_text_expires_in');

    data.forgot_password_timestamp = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    form.data = data;
    await form.requestUpdate();
    expect(control).to.have.attribute('helper-text', 'forgot-password.helper_text_expired_on');
  });

  it('renders a custom control for legal notice', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const control = form.renderRoot.querySelector('[infer="legal-notice"]');

    expect(control).to.exist;
    expect(control).to.be.instanceOf(InternalCustomerFormLegalNoticeControl);
  });

  it('renders a hCaptcha element when enabled in signup settings', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    let control = form.renderRoot.querySelector('h-captcha');
    expect(control).to.not.exist;

    form.settings = portalSettings;
    form.lang = 'tr';
    await form.requestUpdate();
    control = form.renderRoot.querySelector('h-captcha');
    expect(control).to.exist;

    expect(control).to.have.attribute('site-key', '123');
    expect(control).to.have.attribute('size', 'invisible');
    expect(control).to.have.attribute('hl', 'tr');
  });

  it('request captcha token when form is submitted in customer mode', async () => {
    const VerifiedEvent = class extends CustomEvent<unknown> {
      token = '456';

      eKey = '789';
    };

    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    form.settings = portalSettings;
    form.edit({ password: 'jfkdfdhKJHGjh834))33!', email: 'foo@bar.com' });
    await form.requestUpdate();

    const captcha = form.renderRoot.querySelector('h-captcha') as VanillaHCaptchaWebComponent;
    stub(captcha, 'reset').resolves();
    stub(captcha, 'execute').callsFake(() => {
      captcha.dispatchEvent(new VerifiedEvent('verified'));
    });

    const whenFetchIsFired = oneEvent(form, 'fetch');
    form.submit();
    const evt = (await whenFetchIsFired) as unknown as FetchEvent;
    evt.preventDefault();

    expect(await evt.request.json()).to.deep.equal({
      verification: { type: 'hcaptcha', token: '456' },
      password: 'jfkdfdhKJHGjh834))33!',
      email: 'foo@bar.com',
    });
  });

  it('submits the form if verification token is required and provided', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    const whenFetchIsFired = oneEvent(form, 'fetch');

    form.settings = portalSettings;
    form.edit({
      verification: { type: 'hcaptcha', token: '456' },
      password: 'jfkdfdhKJHGjh834))33!',
      email: 'foo@bar.com',
    });

    const VerifiedEvent = class extends CustomEvent<unknown> {
      token = '456';

      eKey = '789';
    };

    await form.requestUpdate();
    const captcha = form.renderRoot.querySelector('h-captcha') as VanillaHCaptchaWebComponent;
    captcha.dispatchEvent(new VerifiedEvent('verified'));

    const evt = (await whenFetchIsFired) as unknown as FetchEvent;
    evt.preventDefault();

    expect(await evt.request.json()).to.deep.equal({
      verification: { type: 'hcaptcha', token: '456' },
      password: 'jfkdfdhKJHGjh834))33!',
      email: 'foo@bar.com',
    });
  });

  it('makes customer type switch readonly when editing existing customer', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    expect(form.readonlySelector.matches('is-anonymous', true)).to.be.false;

    form.data = await getTestData<Data>('./hapi/customers/0');
    expect(form.readonlySelector.matches('is-anonymous', true)).to.be.true;
  });

  it('hides one-time password field in customer mode or for guest customers in admin mode', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    expect(form.hiddenSelector.matches('forgot-password', true)).to.be.true;

    form.edit({ is_anonymous: false });
    expect(form.hiddenSelector.matches('forgot-password', true)).to.be.false;

    form.undo();
    form.settings = portalSettings;
    expect(form.hiddenSelector.matches('forgot-password', true)).to.be.true;
  });

  it('hides customer type switch in customer mode', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    expect(form.hiddenSelector.matches('is-anonymous', true)).to.be.false;

    form.settings = portalSettings;
    expect(form.hiddenSelector.matches('is-anonymous', true)).to.be.true;
  });

  it('hides old password field in customer mode if password is empty', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    expect(form.hiddenSelector.matches('password-old', true)).to.be.true;

    form.edit({ password: '123' });
    expect(form.hiddenSelector.matches('password-old', true)).to.be.true;

    form.settings = portalSettings;
    form.undo();
    expect(form.hiddenSelector.matches('password-old', true)).to.be.true;

    form.edit({ password: '123' });
    expect(form.hiddenSelector.matches('password-old', true)).to.be.false;
  });

  it('hides legal notice in admin mode, when loaded or if tos checkbox usage is none in customer mode', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    expect(form.hiddenSelector.matches('legal-notice', true)).to.be.true;

    const settings = JSON.parse(JSON.stringify(portalSettings));
    settings.tos_checkbox_settings.usage = 'none';
    form.settings = settings;
    expect(form.hiddenSelector.matches('legal-notice', true)).to.be.true;

    settings.tos_checkbox_settings.usage = 'optional';
    form.settings = { ...settings };
    expect(form.hiddenSelector.matches('legal-notice', true)).to.be.false;

    settings.tos_checkbox_settings.usage = 'required';
    form.settings = { ...settings };
    expect(form.hiddenSelector.matches('legal-notice', true)).to.be.false;

    form.data = await getTestData<Data>('./hapi/customers/0');
    expect(form.hiddenSelector.matches('legal-notice', true)).to.be.true;
  });

  it('hides password field for guest customers in admin mode', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);
    expect(form.hiddenSelector.matches('password', true)).to.be.true;

    form.edit({ is_anonymous: false });
    expect(form.hiddenSelector.matches('password', true)).to.be.false;
  });

  it('sets "password_change_success" status when password is changed, clears it on GET', async () => {
    const router = createRouter();
    const form = await fixture<CustomerForm>(
      html`
        <foxy-customer-form
          href="https://demo.api/hapi/customers/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-customer-form>
      `
    );

    await waitUntil(() => !!form.data);
    form.edit({ password: 'HLLLajdhfksh8779__!!a' });
    form.submit();
    await waitUntil(() => form.status !== null);

    expect(form).to.have.deep.property('status', {
      options: { email: form.data?.email },
      key: 'password_change_success',
    });

    form.href = 'https://demo.api/hapi/customers/1';
    await waitUntil(() => !!form.data);
    expect(form).to.have.deep.property('status', null);
  });

  it('renders "email_already_used" general error when email is already used', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);

    form.data = await getTestData<Data>('./hapi/customers/0');
    form.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      const body = JSON.stringify({
        _embedded: { 'fx:errors': [{ message: 'This email address is already in use' }] },
      });

      event.respondWith(Promise.resolve(new Response(body, { status: 400 })));
    });

    form.edit({ email: 'test@test.com' });
    form.submit();

    await waitUntil(() => !!form.in('idle'));
    expect(form.errors).to.include('error:email_already_used');
  });

  it('renders "registration_disabled" general error when customer signups are disabled', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);

    form.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      const body = JSON.stringify({
        _embedded: { 'fx:errors': [{ message: 'Customer registration is disabled' }] },
      });

      event.respondWith(Promise.resolve(new Response(body, { status: 400 })));
    });

    form.edit({ email: 'test@test.com' });
    form.submit();

    await waitUntil(() => !!form.in('idle'));
    expect(form.errors).to.include('error:registration_disabled');
  });

  it('renders "verification_failed" general error when captcha is expired', async () => {
    const form = await fixture<CustomerForm>(html`<foxy-customer-form></foxy-customer-form>`);

    form.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      const body = JSON.stringify({
        _embedded: { 'fx:errors': [{ message: 'Client verification failed' }] },
      });

      event.respondWith(Promise.resolve(new Response(body, { status: 400 })));
    });

    form.edit({ email: 'test@test.com' });
    form.submit();

    await waitUntil(() => !!form.in('idle'));
    expect(form.errors).to.include('error:verification_failed');
  });
});
