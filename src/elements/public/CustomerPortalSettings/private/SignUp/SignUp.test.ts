import type { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';

import { expect, fixture } from '@open-wc/testing';
import { Translatable } from '../../../../../mixins/translatable';
import { Switch } from '../../../../private/Switch/Switch';
import { SignUp } from './SignUp';
import { I18N } from '../../../../private/I18N/I18N';

class TestSignUp extends SignUp {
  get whenReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-sign-up', TestSignUp);

describe('CustomerPortalSettings >>> SignUp', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends Translatable', () => {
    expect(new TestSignUp()).to.be.instanceOf(Translatable);
  });

  it('has a reactive property "disabled"', () => {
    expect(TestSignUp).to.have.deep.nested.property('properties.disabled', { type: Boolean });
    expect(new TestSignUp()).to.have.property('disabled', false);
  });

  it('has a reactive property "value"', () => {
    expect(TestSignUp).to.have.deep.nested.property('properties.value', { type: Object });
    expect(new TestSignUp()).to.have.property('value', undefined);
  });

  it('uses namespace "customer-portal-settings"', () => {
    expect(new TestSignUp()).to.have.property('ns', 'customer-portal-settings');
  });

  it('renders title', async () => {
    const element = await fixture<TestSignUp>(`<x-sign-up></x-sign-up>`);
    await element.whenReady;

    const title = element.shadowRoot!.querySelector('[key="sign_up.title"]');
    expect(title).to.exist;
    expect(title).to.have.property('ns', element.ns);
    expect(title).to.have.property('lang', element.lang);
    expect(title).to.be.instanceOf(I18N);
  });

  it('renders subtitle', async () => {
    const element = await fixture<TestSignUp>(`<x-sign-up></x-sign-up>`);
    await element.whenReady;

    const subtitle = element.shadowRoot!.querySelector('[key="sign_up.subtitle"]');
    expect(subtitle).to.exist;
    expect(subtitle).to.have.property('ns', element.ns);
    expect(subtitle).to.have.property('lang', element.lang);
    expect(subtitle).to.be.instanceOf(I18N);
  });

  it('renders toggle', async () => {
    const element = await fixture<TestSignUp>(`<x-sign-up></x-sign-up>`);
    await element.whenReady;

    const toggle = element.shadowRoot!.querySelector('[data-testid="toggle"]');
    expect(toggle).to.exist;
    expect(toggle).to.have.property('disabled', false);
    expect(toggle).to.have.property('checked', false);
    expect(toggle).to.be.instanceOf(Switch);

    toggle?.dispatchEvent(new CustomEvent('change'));
    expect(element).to.have.nested.property('value.enabled', true);

    toggle?.dispatchEvent(new CustomEvent('change'));
    expect(element).to.have.nested.property('value.enabled', false);
  });

  it('renders password field for site key when signups are enabled', async () => {
    const element = await fixture<TestSignUp>(`<x-sign-up></x-sign-up>`);
    await element.whenReady;

    const noField = element.shadowRoot!.querySelector('[data-testid="site-key"]');
    expect(noField).to.not.exist;

    element.value = {
      verification: { type: 'hcaptcha', siteKey: 'abc', secretKey: '' },
      enabled: true,
    };

    await element.requestUpdate();
    const field = element.shadowRoot!.querySelector(
      '[data-testid="site-key"]'
    ) as PasswordFieldElement;

    expect(field).to.exist;
    expect(field).to.have.property('placeholder', 'sign_up.site_key_placeholder');
    expect(field).to.have.property('disabled', false);
    expect(field).to.have.property('label', 'sign_up.site_key_label');
    expect(field).to.have.property('value', 'abc');

    field.value = 'efg';
    field.dispatchEvent(new CustomEvent('input'));
    expect(element).to.have.nested.property('value.verification.siteKey', 'efg');
  });

  it('renders password field for secret key when signups are enabled', async () => {
    const element = await fixture<TestSignUp>(`<x-sign-up></x-sign-up>`);
    await element.whenReady;

    const noField = element.shadowRoot!.querySelector('[data-testid="secret-key"]');
    expect(noField).to.not.exist;

    element.value = {
      verification: { type: 'hcaptcha', siteKey: '', secretKey: 'abc' },
      enabled: true,
    };

    await element.requestUpdate();
    const field = element.shadowRoot!.querySelector(
      '[data-testid="secret-key"]'
    ) as PasswordFieldElement;

    expect(field).to.exist;
    expect(field).to.have.property('placeholder', 'sign_up.secret_key_placeholder');
    expect(field).to.have.property('disabled', false);
    expect(field).to.have.property('label', 'sign_up.secret_key_label');
    expect(field).to.have.property('value', 'abc');

    field.value = 'efg';
    field.dispatchEvent(new CustomEvent('input'));
    expect(element).to.have.nested.property('value.verification.secretKey', 'efg');
  });

  it('renders explainers when signups are enabled', async () => {
    const element = await fixture<TestSignUp>(`<x-sign-up></x-sign-up>`);
    await element.whenReady;

    const noExplainer = element.shadowRoot!.querySelector('[key="sign_up.hcaptcha_explainer"]');
    expect(noExplainer).to.not.exist;

    element.value = {
      verification: { type: 'hcaptcha', siteKey: '', secretKey: '' },
      enabled: true,
    };

    await element.requestUpdate();
    const explainer = element.shadowRoot!.querySelector(
      '[key="sign_up.hcaptcha_explainer"]'
    ) as I18N;

    expect(explainer).to.exist;
    expect(explainer).to.have.property('lang', element.lang);
    expect(explainer).to.have.property('key', 'sign_up.hcaptcha_explainer');
    expect(explainer).to.have.property('ns', element.ns);
  });

  it('disables all fields when disabled', async () => {
    const element = await fixture<TestSignUp>(`<x-sign-up></x-sign-up>`);
    await element.whenReady;

    element.disabled = true;
    element.value = {
      verification: { type: 'hcaptcha', siteKey: '', secretKey: '' },
      enabled: true,
    };

    await element.requestUpdate();

    const toggle = element.shadowRoot!.querySelector('[data-testid="toggle"]');
    expect(toggle).to.have.property('disabled', true);

    const siteKey = element.shadowRoot!.querySelector('[data-testid="site-key"]');
    expect(siteKey).to.have.property('disabled', true);

    const secretKey = element.shadowRoot!.querySelector('[data-testid="secret-key"]');
    expect(secretKey).to.have.property('disabled', true);
  });
});
