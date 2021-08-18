import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog/FormDialog';
import { InternalCustomerPortalChangePassword } from './InternalCustomerPortalChangePassword';
import { LitElement } from 'lit-element';
import { SignInForm } from '../SignInForm/SignInForm';
import { getByKey } from '../../../testgen/getByKey';
import { getByTag } from '../../../testgen/getByTag';
import { router } from '../../../server/index';
import { stub } from 'sinon';

describe('InternalCustomerPortalChangePassword', () => {
  it('extends LitElement', () => {
    expect(new InternalCustomerPortalChangePassword()).to.be.instanceOf(LitElement);
  });

  it('renders enabled Change password button by default', async () => {
    const element = await fixture<InternalCustomerPortalChangePassword>(html`
      <foxy-internal-customer-portal-change-password lang="es" ns="foo">
      </foxy-internal-customer-portal-change-password>
    `);

    const button = await getByTag(element, 'vaadin-button');
    expect(button).not.to.have.attribute('disabled');

    const label = button?.children[0];
    expect(label).to.have.property('localName', 'foxy-i18n');
    expect(label).to.have.attribute('lang', 'es');
    expect(label).to.have.attribute('key', 'change_password');
    expect(label).to.have.attribute('ns', 'foo');
  });

  it('disables Change password button if disabled attribute is present', async () => {
    const element = await fixture<InternalCustomerPortalChangePassword>(html`
      <foxy-internal-customer-portal-change-password disabled>
      </foxy-internal-customer-portal-change-password>
    `);

    expect(await getByTag(element, 'vaadin-button')).to.have.attribute('disabled');
  });

  it('opens Change password dialog on trigger button click', async () => {
    const element = await fixture<InternalCustomerPortalChangePassword>(html`
      <foxy-internal-customer-portal-change-password lang="es" ns="foo">
      </foxy-internal-customer-portal-change-password>
    `);

    const dialog = (await getByTag(element, 'foxy-form-dialog')) as FormDialog;
    const button = (await getByTag(element, 'vaadin-button')) as HTMLButtonElement;
    const showMethod = stub(dialog, 'show');

    button.click();

    expect(showMethod).to.have.been.calledOnceWith(button);
    expect(dialog).to.have.attribute('header', 'change_password');
    expect(dialog).to.have.attribute('lang', 'es');
    expect(dialog).to.have.attribute('ns', 'foo');
  });

  it('renders step 1 of password change when dialog opens', async () => {
    const element = await fixture<InternalCustomerPortalChangePassword>(html`
      <foxy-internal-customer-portal-change-password session="test://session" lang="es" ns="foo">
      </foxy-internal-customer-portal-change-password>
    `);

    const dialog = (await getByTag(element, 'foxy-form-dialog')) as FormDialog;
    const button = (await getByTag(element, 'vaadin-button')) as HTMLButtonElement;

    button.click();
    await dialog.updateComplete;

    const form = (await getByTag(dialog, 'foxy-sign-in-form')) as SignInForm;
    expect(form).to.have.attribute('parent', 'test://session');
    expect(form).to.have.attribute('lang', 'es');
    expect(form).to.have.attribute('ns', 'foo');

    const header = await getByKey(dialog, 'change_password_step_1');
    expect(header).to.have.property('lang', 'es');
    expect(header).to.have.property('ns', 'foo');
  });

  it('navigates to step 2 of password change on current password entry', async () => {
    const element = await fixture<InternalCustomerPortalChangePassword>(html`
      <foxy-internal-customer-portal-change-password
        session="https://demo.foxycart.com/s/virtual/session"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-customer-portal-change-password>
    `);

    const dialog = (await getByTag(element, 'foxy-form-dialog')) as FormDialog;
    const button = (await getByTag(element, 'vaadin-button')) as HTMLButtonElement;

    button.click();
    await dialog.updateComplete;

    const form = (await getByTag(dialog, 'foxy-sign-in-form')) as SignInForm;

    form.edit({
      type: 'password',
      credential: {
        email: 'sally.sims@example.com',
        password: '1234567890',
      },
    });

    form.submit();
    await waitUntil(() => form.in('idle'));
    expect(await getByKey(dialog, 'change_password_step_2')).to.exist;
  });

  it("stays on step 1 of password change if current password isn't right", async () => {
    const element = await fixture<InternalCustomerPortalChangePassword>(html`
      <foxy-internal-customer-portal-change-password
        session="https://demo.foxycart.com/s/virtual/session?code=invalid_credentials_error"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-customer-portal-change-password>
    `);

    const dialog = (await getByTag(element, 'foxy-form-dialog')) as FormDialog;
    const button = (await getByTag(element, 'vaadin-button')) as HTMLButtonElement;

    button.click();
    await dialog.updateComplete;

    const form = (await getByTag(dialog, 'foxy-sign-in-form')) as SignInForm;

    form.edit({
      type: 'password',
      credential: {
        email: 'sally.sims@example.com',
        password: '1234567890',
      },
    });

    form.submit();
    await waitUntil(() => form.in('idle'));
    expect(await getByKey(dialog, 'change_password_step_1')).to.exist;
  });

  it('navigates to step 3 of password change on new password entry', async () => {
    const element = await fixture<InternalCustomerPortalChangePassword>(html`
      <foxy-internal-customer-portal-change-password
        customer="https://demo.foxycart.com/s/admin/customers/0"
        session="https://demo.foxycart.com/s/virtual/session"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-customer-portal-change-password>
    `);

    const dialog = (await getByTag(element, 'foxy-form-dialog')) as FormDialog;
    const button = (await getByTag(element, 'vaadin-button')) as HTMLButtonElement;

    button.click();
    await dialog.updateComplete;

    const form = (await getByTag(dialog, 'foxy-sign-in-form')) as SignInForm;

    form.edit({
      type: 'password',
      credential: {
        email: 'sally.sims@example.com',
        password: '1234567890',
      },
    });

    form.submit();
    await waitUntil(() => form.in('idle'));

    form.edit({
      type: 'password',
      credential: {
        email: 'sally.sims@example.com',
        password: '1234567890',
        new_password: '0987654321',
      },
    });

    form.submit();
    await waitUntil(() => form.in('idle'));
    expect(await getByKey(dialog, 'change_password_step_3')).to.exist;
  });

  it("stays on step 2 of password change if new password can't be set for some reason", async () => {
    const element = await fixture<InternalCustomerPortalChangePassword>(html`
      <foxy-internal-customer-portal-change-password
        customer="https://demo.foxycart.com/s/admin/not-found"
        session="https://demo.foxycart.com/s/virtual/session"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-customer-portal-change-password>
    `);

    const dialog = (await getByTag(element, 'foxy-form-dialog')) as FormDialog;
    const button = (await getByTag(element, 'vaadin-button')) as HTMLButtonElement;

    button.click();
    await dialog.updateComplete;

    const form = (await getByTag(dialog, 'foxy-sign-in-form')) as SignInForm;

    form.edit({
      type: 'password',
      credential: {
        email: 'sally.sims@example.com',
        password: '1234567890',
      },
    });

    form.submit();
    await waitUntil(() => form.in('idle'));

    form.edit({
      type: 'password',
      credential: {
        email: 'sally.sims@example.com',
        password: '1234567890',
        new_password: '0987654321',
      },
    });

    form.submit();
    await waitUntil(() => form.in('idle'));

    expect(await getByKey(dialog, 'change_password_step_2')).to.exist;
  });
});
