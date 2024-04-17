import type { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import type { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import type { InternalFrequencyControl } from '../../internal/InternalFrequencyControl/InternalFrequencyControl';
import type { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import type { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';

import './index';

import { CustomerPortalSettingsForm as Form } from './CustomerPortalSettingsForm';
import { expect, fixture, html } from '@open-wc/testing';

describe('CustomerPortalSettingsForm', () => {
  it('imports and defines foxy-internal-checkbox-group-control', () => {
    expect(customElements.get('foxy-internal-checkbox-group-control')).to.exist;
  });

  it('imports and defines foxy-internal-editable-list-control', () => {
    expect(customElements.get('foxy-internal-editable-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-frequency-control', () => {
    expect(customElements.get('foxy-internal-frequency-control')).to.exist;
  });

  it('imports and defines foxy-internal-password-control', () => {
    expect(customElements.get('foxy-internal-password-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form', () => {
    expect(
      customElements.get(
        'foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form'
      )
    ).to.exist;
  });

  it('imports and defines foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card', () => {
    expect(
      customElements.get(
        'foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card'
      )
    ).to.exist;
  });

  it('imports and defines foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form', () => {
    expect(
      customElements.get(
        'foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form'
      )
    ).to.exist;
  });

  it('imports and defines foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card', () => {
    expect(
      customElements.get(
        'foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card'
      )
    ).to.exist;
  });

  it('defines itself as foxy-customer-portal-settings-form', () => {
    expect(customElements.get('foxy-customer-portal-settings-form')).to.equal(Form);
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('produces "session-lifespan-in-minutes:v8n_too_long" error when session lifespan is too long', () => {
    const form = new Form();
    expect(form.errors).to.not.include('session-lifespan-in-minutes:v8n_too_long');

    form.edit({ sessionLifespanInMinutes: 40321 });
    expect(form.errors).to.include('session-lifespan-in-minutes:v8n_too_long');
  });

  it('produces "allowed-origins:v8n_too_many" error when there are too many allowed origins', () => {
    const form = new Form();
    expect(form.errors).to.not.include('allowed-origins:v8n_too_many');

    form.edit({ allowedOrigins: new Array(11).fill('https://example.com') });
    expect(form.errors).to.include('allowed-origins:v8n_too_many');
  });

  it('produces "allowed-origins:v8n_invalid" error when one or more allowed origins are invalid', () => {
    const form = new Form();
    expect(form.errors).to.not.include('allowed-origins:v8n_invalid');

    form.edit({ allowedOrigins: ['invalid'] });
    expect(form.errors).to.include('allowed-origins:v8n_invalid');
  });

  it('produces "jwt-shared-secret:v8n_invalid" error when JWT shared secret is invalid', () => {
    const form = new Form();
    expect(form.errors).to.not.include('jwt-shared-secret:v8n_invalid');

    form.edit({ jwtSharedSecret: 'foo!?' });
    expect(form.errors).to.include('jwt-shared-secret:v8n_invalid');
  });

  it('produces "jwt-shared-secret:v8n_too_short" error when JWT shared secret is too short', () => {
    const form = new Form();
    expect(form.errors).to.not.include('jwt-shared-secret:v8n_too_short');

    form.edit({ jwtSharedSecret: 'abc' });
    expect(form.errors).to.include('jwt-shared-secret:v8n_too_short');

    form.edit({ jwtSharedSecret: 'a'.repeat(40) });
    expect(form.errors).to.not.include('jwt-shared-secret:v8n_too_short');
  });

  it('produces "jwt-shared-secret:v8n_too_long" error when JWT shared secret is too long', () => {
    const form = new Form();
    expect(form.errors).to.not.include('jwt-shared-secret:v8n_too_long');

    form.edit({ jwtSharedSecret: 'a'.repeat(101) });
    expect(form.errors).to.include('jwt-shared-secret:v8n_too_long');

    form.edit({ jwtSharedSecret: 'a'.repeat(100) });
    expect(form.errors).to.not.include('jwt-shared-secret:v8n_too_long');
  });

  it('produces "sign-up-verification-hcaptcha-site-key:v8n_too_long" error when hCaptcha site key is too long', () => {
    const form = new Form();

    expect(form.errors).to.not.include('sign-up-verification-hcaptcha-site-key:v8n_too_long');

    form.edit({
      signUp: {
        enabled: true,
        verification: { secretKey: '', siteKey: 'a'.repeat(101), type: 'hcaptcha' },
      },
    });

    expect(form.errors).to.include('sign-up-verification-hcaptcha-site-key:v8n_too_long');

    form.edit({
      signUp: {
        enabled: true,
        verification: { secretKey: '', siteKey: 'a'.repeat(100), type: 'hcaptcha' },
      },
    });

    expect(form.errors).to.not.include('sign-up-verification-hcaptcha-site-key:v8n_too_long');
  });

  it('produces "sign-up-verification-hcaptcha-secret-key:v8n_too_long" error when hCaptcha secret key is too long', () => {
    const form = new Form();

    expect(form.errors).to.not.include('sign-up-verification-hcaptcha-secret-key:v8n_too_long');

    form.edit({
      signUp: {
        enabled: true,
        verification: { siteKey: '', secretKey: 'a'.repeat(101), type: 'hcaptcha' },
      },
    });

    expect(form.errors).to.include('sign-up-verification-hcaptcha-secret-key:v8n_too_long');

    form.edit({
      signUp: {
        enabled: true,
        verification: { siteKey: '', secretKey: 'a'.repeat(100), type: 'hcaptcha' },
      },
    });

    expect(form.errors).to.not.include('sign-up-verification-hcaptcha-secret-key:v8n_too_long');
  });

  it('hides sign-up verification settings when sign-up is disabled', () => {
    const form = new Form();

    expect(form.hiddenSelector.matches('sign-up-verification-hcaptcha-site-key', true)).to.be.true;
    expect(form.hiddenSelector.matches('sign-up-verification-hcaptcha-secret-key', true)).to.be
      .true;

    form.edit({
      signUp: {
        enabled: true,
        verification: {
          secretKey: '',
          siteKey: '',
          type: 'hcaptcha',
        },
      },
    });

    expect(form.hiddenSelector.matches('sign-up-verification-hcaptcha-site-key', true)).to.be.false;
    expect(form.hiddenSelector.matches('sign-up-verification-hcaptcha-secret-key', true)).to.be
      .false;
  });

  it('hides frequency modification rules when the list is empty', () => {
    const form = new Form();

    expect(form.hiddenSelector.matches('subscriptions-allow-frequency-modification', true)).to.be
      .true;

    form.edit({
      subscriptions: {
        allowFrequencyModification: [],
        allowNextDateModification: false,
      },
    });

    expect(form.hiddenSelector.matches('subscriptions-allow-frequency-modification', true)).to.be
      .true;

    form.edit({
      subscriptions: {
        allowFrequencyModification: [{ jsonataQuery: '*', values: ['1w'] }],
        allowNextDateModification: false,
      },
    });

    expect(form.hiddenSelector.matches('subscriptions-allow-frequency-modification', true)).to.be
      .false;
  });

  it('hides next date modification rules when modification is not allowed', () => {
    const form = new Form();

    expect(form.hiddenSelector.matches('subscriptions-allow-next-date-modification', true)).to.be
      .true;

    form.edit({
      subscriptions: {
        allowFrequencyModification: [],
        allowNextDateModification: true,
      },
    });

    expect(form.hiddenSelector.matches('subscriptions-allow-next-date-modification', true)).to.be
      .false;
  });

  it('renders editable list control for allowed origins', async () => {
    const element = await fixture<Form>(
      html`<foxy-customer-portal-settings-form></foxy-customer-portal-settings-form>`
    );

    const control = element.renderRoot.querySelector<InternalEditableListControl>(
      'foxy-internal-editable-list-control[infer="allowed-origins"]'
    )!;

    expect(control).to.exist;
    expect(control.getValue()).to.be.undefined;

    control.setValue([{ value: 'https://example.com' }]);
    expect(control.getValue()).to.deep.equal([{ value: 'https://example.com' }]);
    expect(element).to.have.deep.nested.property('form.allowedOrigins', ['https://example.com']);
  });

  it('renders checkbox group control for portal features', async () => {
    const element = await fixture<Form>(
      html`<foxy-customer-portal-settings-form></foxy-customer-portal-settings-form>`
    );

    const control = element.renderRoot.querySelector<InternalCheckboxGroupControl>(
      'foxy-internal-checkbox-group-control[infer="features"]'
    )!;

    expect(control).to.exist;
    expect(control.getValue()).to.deep.equal([]);
    expect(control).to.have.deep.property('options', [
      { value: 'sso', label: 'option_sso' },
      { value: 'sign-up', label: 'option_sign_up' },
      { value: 'frequency-modification', label: 'option_frequency_modification' },
      { value: 'next-date-modification', label: 'option_next_date_modification' },
    ]);

    element.edit({ sso: true });
    expect(control.getValue()).to.deep.equal(['sso']);
    control.setValue([]);
    expect(element).to.have.nested.property('form.sso', false);

    element.undo();
    element.edit({
      signUp: {
        enabled: true,
        verification: {
          secretKey: '',
          siteKey: '',
          type: 'hcaptcha',
        },
      },
    });

    expect(control.getValue()).to.deep.equal(['sign-up']);
    control.setValue([]);
    expect(element).to.have.nested.property('form.signUp.enabled', false);

    element.undo();
    element.edit({
      subscriptions: {
        allowFrequencyModification: [{ jsonataQuery: '*', values: ['1w'] }],
        allowNextDateModification: false,
      },
    });

    expect(control.getValue()).to.deep.equal(['frequency-modification']);
    control.setValue([]);
    expect(element).to.have.deep.nested.property(
      'form.subscriptions.allowFrequencyModification',
      []
    );

    element.undo();
    element.edit({
      subscriptions: {
        allowFrequencyModification: [],
        allowNextDateModification: true,
      },
    });

    expect(control.getValue()).to.deep.equal(['next-date-modification']);
    control.setValue([]);
    expect(element).to.have.nested.property('form.subscriptions.allowNextDateModification', false);
  });

  it('renders password control for hcaptcha site key', async () => {
    const element = await fixture<Form>(
      html`<foxy-customer-portal-settings-form></foxy-customer-portal-settings-form>`
    );

    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      'foxy-internal-password-control[infer="sign-up-verification-hcaptcha-site-key"]'
    )!;

    expect(control).to.exist;
    expect(control.getValue()).to.equal('');

    control.setValue('foo');
    expect(element).to.have.deep.nested.property('form.signUp.verification.siteKey', 'foo');
    expect(control.getValue()).to.equal('foo');
  });

  it('renders password control for hcaptcha secret key', async () => {
    const element = await fixture<Form>(
      html`<foxy-customer-portal-settings-form></foxy-customer-portal-settings-form>`
    );

    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      'foxy-internal-password-control[infer="sign-up-verification-hcaptcha-secret-key"]'
    )!;

    expect(control).to.exist;
    expect(control.getValue()).to.equal('');

    control.setValue('foo');
    expect(element).to.have.deep.nested.property('form.signUp.verification.secretKey', 'foo');
    expect(control.getValue()).to.equal('foo');
  });

  it('renders async list control for frequency modification rules', async () => {
    const element = await fixture<Form>(
      html`<foxy-customer-portal-settings-form></foxy-customer-portal-settings-form>`
    );

    const control = element.renderRoot.querySelector<InternalAsyncListControl>(
      'foxy-internal-async-list-control[infer="subscriptions-allow-frequency-modification"]'
    )!;

    expect(control).to.exist;
    expect(control).to.have.attribute(
      'first',
      `foxy://${element.virtualHost}/form/subscriptions/allowFrequencyModification`
    );
    expect(control).to.have.attribute('limit', '20');
    expect(control).to.have.attribute(
      'form',
      'foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form'
    );
    expect(control).to.have.attribute(
      'item',
      'foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card'
    );
    expect(control).to.have.attribute('alert');
  });

  it('renders async list control for next date modification rules', async () => {
    const element = await fixture<Form>(
      html`<foxy-customer-portal-settings-form></foxy-customer-portal-settings-form>`
    );

    const control = element.renderRoot.querySelector<InternalAsyncListControl>(
      'foxy-internal-async-list-control[infer="subscriptions-allow-next-date-modification"]'
    )!;

    expect(control).to.exist;
    expect(control).to.have.attribute(
      'first',
      `foxy://${element.virtualHost}/form/subscriptions/allowNextDateModification`
    );
    expect(control).to.have.attribute('limit', '20');
    expect(control).to.have.attribute(
      'form',
      'foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form'
    );
    expect(control).to.have.attribute(
      'item',
      'foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card'
    );
    expect(control).to.have.attribute('alert');
  });

  it('renders frequency control for session lifespan', async () => {
    const element = await fixture<Form>(
      html`<foxy-customer-portal-settings-form></foxy-customer-portal-settings-form>`
    );

    const control = element.renderRoot.querySelector<InternalFrequencyControl>(
      'foxy-internal-frequency-control[infer="session-lifespan-in-minutes"]'
    )!;

    expect(control).to.exist;
    expect(control.getValue()).to.equal('0w');
    expect(control).to.have.deep.property('options', [
      { value: 'm', label: 'option_minute' },
      { value: 'h', label: 'option_hour' },
      { value: 'd', label: 'option_day' },
      { value: 'w', label: 'option_week' },
    ]);

    control.setValue('2d');
    expect(element).to.have.deep.nested.property('form.sessionLifespanInMinutes', 2880);
  });

  it('renders password control for JWT shared secret', async () => {
    const element = await fixture<Form>(
      html`<foxy-customer-portal-settings-form></foxy-customer-portal-settings-form>`
    );

    const control = element.renderRoot.querySelector<InternalPasswordControl>(
      'foxy-internal-password-control[infer="jwt-shared-secret"]'
    )!;

    expect(control).to.exist;
    expect(control.getValue()).to.equal(undefined);
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.attribute('property', 'jwtSharedSecret');
    expect(control).to.have.deep.property('generatorOptions', {
      charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
      length: 64,
    });

    control.setValue('foo');
    expect(element).to.have.deep.nested.property('form.jwtSharedSecret', 'foo');
  });
});
