import type { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';

import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { UserForm } from './UserForm';
import { stub } from 'sinon';
import { getTestData } from '../../../testgen/getTestData';
import { Data } from './types';

describe('UserForm', () => {
  it('imports and defines foxy-internal-checkbox-group-control', () => {
    expect(customElements.get('foxy-internal-checkbox-group-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('defines itself as foxy-user-form', () => {
    expect(customElements.get('foxy-user-form')).to.equal(UserForm);
  });

  it('has a default i18next namespace of "user-form"', () => {
    expect(UserForm).to.have.property('defaultNS', 'user-form');
    expect(new UserForm()).to.have.property('ns', 'user-form');
  });

  it('produces "first-name:v8n_required" v8n error when first name is empty', async () => {
    const element = new UserForm();
    expect(element.errors).to.include('first-name:v8n_required');

    element.edit({ first_name: 'foo' });
    expect(element.errors).not.to.include('first-name:v8n_required');
  });

  it('produces "first-name:v8n_too_long" v8n error when first name is too long', async () => {
    const element = new UserForm();
    expect(element.errors).to.not.include('first-name:v8n_too_long');

    element.edit({ first_name: 'foo' });
    expect(element.errors).not.to.include('first-name:v8n_too_long');

    element.edit({ first_name: 'a'.repeat(51) });
    expect(element.errors).to.include('first-name:v8n_too_long');
  });

  it('produces "last-name:v8n_required" v8n error when last name is empty', async () => {
    const element = new UserForm();
    expect(element.errors).to.include('last-name:v8n_required');

    element.edit({ last_name: 'foo' });
    expect(element.errors).not.to.include('last-name:v8n_required');
  });

  it('produces "last-name:v8n_too_long" v8n error when last name is too long', async () => {
    const element = new UserForm();
    expect(element.errors).to.not.include('last-name:v8n_too_long');

    element.edit({ last_name: 'foo' });
    expect(element.errors).not.to.include('last-name:v8n_too_long');

    element.edit({ last_name: 'a'.repeat(51) });
    expect(element.errors).to.include('last-name:v8n_too_long');
  });

  it('produces "email:v8n_required" v8n error when email is empty', async () => {
    const element = new UserForm();
    expect(element.errors).to.include('email:v8n_required');

    element.edit({ email: 'foo' });
    expect(element.errors).not.to.include('email:v8n_required');
  });

  it('produces "email:v8n_too_long" v8n error when email is too long', async () => {
    const element = new UserForm();
    expect(element.errors).to.not.include('email:v8n_too_long');

    element.edit({ email: 'foo' });
    expect(element.errors).not.to.include('email:v8n_too_long');

    element.edit({ email: 'a'.repeat(101) });
    expect(element.errors).to.include('email:v8n_too_long');
  });

  it('produces "email:v8n_invalid_email" v8n error when email is invalid', async () => {
    const element = new UserForm();
    expect(element.errors).to.not.include('email:v8n_invalid_email');

    element.edit({ email: 'foo' });
    expect(element.errors).to.include('email:v8n_invalid_email');

    element.edit({ email: 'foo@bar' });
    expect(element.errors).to.include('email:v8n_invalid_email');

    element.edit({ email: 'test@test.com' });
    expect(element.errors).not.to.include('email:v8n_invalid_email');
  });

  it('produces "phone:v8n_too_long" v8n error when phone is too long', async () => {
    const element = new UserForm();
    expect(element.errors).to.not.include('phone:v8n_too_long');

    element.edit({ phone: 'foo' });
    expect(element.errors).not.to.include('phone:v8n_too_long');

    element.edit({ phone: 'a'.repeat(51) });
    expect(element.errors).to.include('phone:v8n_too_long');
  });

  it('renders a form header', () => {
    const form = new UserForm();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('renders a special subtitle for affiliates', async () => {
    const form = new UserForm();
    form.data = { ...(await getTestData<Data>('./hapi/users/0')), affiliate_id: 123 };
    expect(form.headerSubtitleOptions).to.have.property('context', 'affiliate');

    form.data = { ...(await getTestData<Data>('./hapi/users/0')), affiliate_id: 0 };
    expect(form.headerSubtitleOptions).to.have.property('context', '');
  });

  it('renders a text control for first name', async () => {
    const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-text-control[infer=first-name]'
    );
    expect(control).to.exist;
  });

  it('renders a text control for last name', async () => {
    const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer=last-name]');
    expect(control).to.exist;
  });

  it('renders a text control for email', async () => {
    const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer=email]');
    expect(control).to.exist;
  });

  it('renders a text control for phone', async () => {
    const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
    const control = element.renderRoot.querySelector('foxy-internal-text-control[infer=phone]');
    expect(control).to.exist;
  });

  it('renders a checkbox group control for role', async () => {
    const element = await fixture<UserForm>(html`<foxy-user-form></foxy-user-form>`);
    const control = element.renderRoot.querySelector(
      'foxy-internal-checkbox-group-control[infer=role]'
    ) as InternalCheckboxGroupControl;

    expect(control).to.exist;
    expect(control).to.have.deep.property('options', [
      { label: 'option_merchant', value: 'merchant' },
      { label: 'option_backend_developer', value: 'backend_developer' },
      { label: 'option_frontend_developer', value: 'frontend_developer' },
      { label: 'option_designer', value: 'designer' },
    ]);

    expect(control.getValue()).to.deep.equal([]);

    element.edit({ is_merchant: true, is_programmer: true });
    expect(control.getValue()).to.deep.equal(['merchant', 'backend_developer']);

    control.setValue(['frontend_developer']);
    expect(element).to.have.nested.property('form.is_front_end_developer', true);
  });
});
