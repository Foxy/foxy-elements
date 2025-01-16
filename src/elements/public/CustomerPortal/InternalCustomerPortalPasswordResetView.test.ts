import type { InternalPasswordControl } from '../../internal/InternalPasswordControl/InternalPasswordControl';

import './index';

import { InternalCustomerPortalPasswordResetView as View } from './InternalCustomerPortalPasswordResetView';
import { expect, fixture, html } from '@open-wc/testing';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { stub } from 'sinon';

describe('InternalCustomerPortalPasswordResetView', () => {
  it('extends InternalForm', () => {
    expect(new View()).to.be.instanceOf(InternalForm);
  });

  it('has a reactive property "passwordOld"', () => {
    expect(new View()).to.have.property('passwordOld', null);
    expect(View.properties).to.have.deep.property('passwordOld', { attribute: 'password-old' });
  });

  it('produces "password:v8n_required" error when password is empty', () => {
    const view = new View();
    expect(view.errors).to.include('password:v8n_required');
  });

  it('produces "password:v8n_too_long" error when password is longer than 50 characters', () => {
    const view = new View();
    expect(view.errors).to.not.include('password:v8n_too_long');
    view.edit({ password: 'a'.repeat(50) });
    expect(view.errors).to.not.include('password:v8n_too_long');
    view.edit({ password: 'a'.repeat(51) });
    expect(view.errors).to.include('password:v8n_too_long');
  });

  it('produces "password:v8n_too_weak" error when password is too weak', () => {
    const view = new View();
    expect(view.errors).to.not.include('password:v8n_too_weak');
    view.edit({ password: 'a' });
    expect(view.errors).to.include('password:v8n_too_weak');
    view.edit({ password: 'a'.repeat(10) });
    expect(view.errors).to.include('password:v8n_too_weak');
    view.edit({ password: 'abc34a-Yl18na-prl1Hb' });
    expect(view.errors).to.not.include('password:v8n_too_weak');
  });

  it('renders translatable title', async () => {
    const view = await fixture<View>(html`
      <foxy-internal-customer-portal-password-reset-view></foxy-internal-customer-portal-password-reset-view>
    `);

    const i18n = view.renderRoot.querySelector('foxy-i18n[key="title"]')!;
    expect(i18n).to.exist;
    expect(i18n).to.have.attribute('infer', '');
  });

  it('renders translatable subtitle', async () => {
    const view = await fixture<View>(html`
      <foxy-internal-customer-portal-password-reset-view></foxy-internal-customer-portal-password-reset-view>
    `);

    const i18n = view.renderRoot.querySelector('foxy-i18n[key="subtitle"]')!;
    expect(i18n).to.exist;
    expect(i18n).to.have.attribute('infer', '');
  });

  it('renders password control for new password', async () => {
    const view = await fixture<View>(html`
      <foxy-internal-customer-portal-password-reset-view></foxy-internal-customer-portal-password-reset-view>
    `);

    const control = view.renderRoot.querySelector<InternalPasswordControl>(
      'foxy-internal-password-control'
    )!;

    expect(control).to.exist;
    expect(control).to.have.attribute('infer', 'password');
    expect(control).to.have.attribute('show-generator');
    expect(control).to.have.property('generatorOptions');

    expect(control.generatorOptions?.checkStrength?.('a')).to.be.false;
    expect(control.generatorOptions?.checkStrength?.('a'.repeat(10))).to.be.false;
    expect(control.generatorOptions?.checkStrength?.('abc34a-Yl18na-prl1Hb')).to.be.true;
  });

  it('renders submit button', async () => {
    const view = await fixture<View>(html`
      <foxy-internal-customer-portal-password-reset-view></foxy-internal-customer-portal-password-reset-view>
    `);

    const label = view.renderRoot.querySelector('foxy-i18n[infer=""][key="submit"]')!;
    const button = label.closest('vaadin-button')!;
    expect(button).to.exist;

    const submitMethod = stub(view, 'submit');
    button.click();
    expect(submitMethod).to.have.been.called;

    expect(button).to.not.have.attribute('disabled');
    view.disabled = true;
    await view.requestUpdate();
    expect(button).to.have.attribute('disabled');
  });
});
