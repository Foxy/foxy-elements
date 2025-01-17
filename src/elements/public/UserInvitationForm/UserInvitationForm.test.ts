import type { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { UserInvitationForm as Form } from './UserInvitationForm';
import { InternalForm } from '../../internal/InternalForm';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';
import { spy } from 'sinon';

describe('UserInvitationForm', () => {
  it('imports and defines foxy-internal-summary-control', () => {
    expect(customElements.get('foxy-internal-summary-control')).to.exist;
  });

  it('imports and defines foxy-internal-delete-control', () => {
    expect(customElements.get('foxy-internal-delete-control')).to.exist;
  });

  it('imports and defines foxy-internal-text-control', () => {
    expect(customElements.get('foxy-internal-text-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-internal-user-invitation-form-async-action', () => {
    expect(customElements.get('foxy-internal-user-invitation-form-async-action')).to.exist;
  });

  it('defines itself as foxy-user-invitation-form', () => {
    expect(customElements.get('foxy-user-invitation-form')).to.equal(Form);
  });

  it('has a default i18next namespace of "user-invitation-form"', () => {
    expect(Form.defaultNS).to.equal('user-invitation-form');
    expect(new Form().ns).to.equal('user-invitation-form');
  });

  it('has a reactive property "getStorePageHref"', () => {
    expect(new Form()).to.have.property('getStorePageHref', null);
    expect(Form).to.have.deep.nested.property('properties.getStorePageHref', { attribute: false });
  });

  it('has a reactive property "defaultDomain"', () => {
    expect(new Form()).to.have.property('defaultDomain', null);
    expect(Form).to.have.deep.nested.property('properties.defaultDomain', {
      attribute: 'default-domain',
    });
  });

  it('has a reactive property "layout"', () => {
    expect(new Form()).to.have.property('layout', null);
    expect(Form).to.have.deep.nested.property('properties.layout', {});
  });

  it('extends InternalForm', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('produces "email:v8n_required" error when email is empty', () => {
    const form = new Form();
    expect(form.errors).to.include('email:v8n_required');
    form.edit({ email: 'test@example.com' });
    expect(form.errors).not.to.include('email:v8n_required');
  });

  it('makes store info always readonly', () => {
    const form = new Form();
    expect(form.readonlySelector.matches('store', true)).to.be.true;
  });

  it('always hides timestamps, Submit and Undo buttons', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('timestamps', true)).to.be.true;
    expect(form.hiddenSelector.matches('submit', true)).to.be.true;
    expect(form.hiddenSelector.matches('undo', true)).to.be.true;
  });

  it('hides Delete button when status is not "revoked" or "expired" (in admin layout)', async () => {
    const form = new Form();
    form.layout = 'admin';
    expect(form.hiddenSelector.matches('delete', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/user_invitations/0');
    data.status = 'sent';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('delete', true)).to.be.true;

    data.status = 'rejected';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('delete', true)).to.be.true;

    data.status = 'expired';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('delete', true)).to.be.false;

    data.status = 'revoked';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('delete', true)).to.be.false;

    data.status = 'accepted';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('delete', true)).to.be.true;
  });

  it('hides Leave button when status is not "accepted"', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('leave', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/user_invitations/0');
    data.status = 'sent';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('leave', true)).to.be.true;

    data.status = 'accepted';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('leave', true)).to.be.false;
  });

  it('hides Revoke button when status is not "accepted" or "sent"', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('revoke', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/user_invitations/0');
    data.status = 'sent';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('revoke', true)).to.be.false;

    data.status = 'accepted';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('revoke', true)).to.be.false;

    data.status = 'revoked';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('revoke', true)).to.be.true;
  });

  it('hides Resend button when status is not "sent" (in admin layout)', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('resend', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/user_invitations/0');
    data.status = 'accepted';
    form.layout = 'admin';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('resend', true)).to.be.true;

    data.status = 'revoked';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('resend', true)).to.be.true;

    data.status = 'sent';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('resend', true)).to.be.false;

    data.status = 'expired';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('resend', true)).to.be.true;
  });

  it('hides Accept and Reject buttons when status is not "sent"', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('accept', true)).to.be.true;
    expect(form.hiddenSelector.matches('reject', true)).to.be.true;

    const data = await getTestData<Data>('./hapi/user_invitations/0');
    data.status = 'accepted';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('accept', true)).to.be.true;
    expect(form.hiddenSelector.matches('reject', true)).to.be.true;

    data.status = 'sent';
    form.data = { ...data };
    expect(form.hiddenSelector.matches('accept', true)).to.be.false;
    expect(form.hiddenSelector.matches('reject', true)).to.be.false;
  });

  it('produces "error:invitation_exists" general error when invitation for the email already exists', async () => {
    const form = await fixture<Form>(html`<foxy-user-invitation-form></foxy-user-invitation-form>`);

    form.data = await getTestData<Data>('./hapi/user_invitations/0');
    form.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      const body = JSON.stringify({
        _embedded: {
          'fx:errors': [
            { message: 'Error: invitation has already been created for this email and store.' },
          ],
        },
      });

      event.respondWith(Promise.resolve(new Response(body, { status: 400 })));
    });

    form.edit({ email: 'test@example.com' });
    form.submit();

    await waitUntil(() => !!form.in('idle'));
    expect(form.errors).to.include('error:invitation_exists');
  });

  it('produces "error:already_has_access" general error when the email is already associated with the store', async () => {
    const form = await fixture<Form>(html`<foxy-user-invitation-form></foxy-user-invitation-form>`);

    form.data = await getTestData<Data>('./hapi/user_invitations/0');
    form.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      const body = JSON.stringify({
        _embedded: {
          'fx:errors': [{ message: 'Error: user already has access to this store.' }],
        },
      });

      event.respondWith(Promise.resolve(new Response(body, { status: 400 })));
    });

    form.edit({ email: 'test@example.com' });
    form.submit();

    await waitUntil(() => !!form.in('idle'));
    expect(form.errors).to.include('error:already_has_access');
  });

  it('renders header in template admin layout', async () => {
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form layout="admin"></foxy-user-invitation-form>
    `);

    const renderHeaderSpy = spy(form, 'renderHeader');
    await form.requestUpdate();
    expect(renderHeaderSpy).to.have.been.called;
  });

  it('renders email field in template admin layout', async () => {
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form layout="admin"></foxy-user-invitation-form>
    `);

    const email = form.renderRoot.querySelector('foxy-internal-text-control[infer="email"]');
    expect(email).to.exist;
  });

  it('renders splash screen in template user layout', async () => {
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form layout="user"></foxy-user-invitation-form>
    `);

    const spinner = form.renderRoot.querySelector('foxy-spinner[infer="unavailable"]');
    expect(spinner).to.exist;
    expect(spinner).to.have.attribute('layout', 'vertical');
    expect(spinner).to.have.attribute('state', 'empty');
  });

  it('renders gravatar in snapshot admin layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(
      () => !!form.renderRoot.querySelector('img[data-testid="gravatar"]'),
      undefined,
      { timeout: 5000 }
    );

    const gravatar = form.renderRoot.querySelector('img[data-testid="gravatar"]');
    expect(gravatar).to.exist;
    expect(gravatar).to.have.attribute(
      'src',
      'https://www.gravatar.com/avatar/bd78de94bcefac7efde2e44ec8199ba1a484adc08eb6ddad887e10e225266e51?s=256&d=identicon'
    );
  });

  it('renders full name in snapshot admin layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(
      () => !!form.renderRoot.querySelector('foxy-i18n[key="full_name"]'),
      undefined,
      { timeout: 5000 }
    );

    const fullName = form.renderRoot.querySelector('foxy-i18n[key="full_name"]');
    expect(fullName).to.exist;
    expect(fullName).to.have.attribute('infer', '');
    expect(fullName).to.have.deep.property('options', {
      first_name: 'Sally',
      last_name: 'Sims',
      context: '',
    });
  });

  it('renders full name in snapshot admin layout (empty name)', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(
      () => !!form.renderRoot.querySelector('foxy-i18n[key="full_name"]'),
      undefined,
      { timeout: 5000 }
    );

    form.data!.first_name = '';
    form.data!.last_name = '';
    form.data = { ...form.data! };
    await form.requestUpdate();

    const fullName = form.renderRoot.querySelector('foxy-i18n[key="full_name"]');
    expect(fullName).to.exist;
    expect(fullName).to.have.attribute('infer', '');
    expect(fullName).to.have.deep.property('options', {
      first_name: '',
      last_name: '',
      context: 'empty',
    });
  });

  it('renders email in snapshot admin layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    expect(form.renderRoot).to.include.text(form.data!.email);
  });

  it('renders status info in snapshot admin layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });

    const title = await getByKey(form, 'admin_status_title');
    const text = await getByKey(form, 'admin_status_text');
    expect(title).to.have.attribute('infer', '');
    expect(text).to.have.attribute('infer', '');

    for (const status of ['sent', 'accepted', 'rejected', 'revoked'] as const) {
      form.data!.status = status;
      await form.requestUpdate();
      expect(title).to.have.deep.property('options', { context: status });
      expect(text).to.have.deep.property('options', { context: status });
    }
  });

  it('renders async action for revoking access in snapshot admin layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const action = form.renderRoot.querySelector(
      'foxy-internal-user-invitation-form-async-action[infer="revoke"]'
    );

    expect(action).to.exist;
    expect(action).to.have.attribute('href', form.data!._links['fx:revoke'].href);
    expect(action).to.have.attribute('theme', 'error');
  });

  it('renders async action for resending invitation in snapshot admin layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const action = form.renderRoot.querySelector(
      'foxy-internal-user-invitation-form-async-action[infer="resend"]'
    );

    expect(action).to.exist;
    expect(action).to.have.attribute('href', form.data!._links['fx:resend'].href);
  });

  it('renders status info in snapshot user layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const title = await getByKey(form, 'user_status_title');
    const text = await getByKey(form, 'user_status_text');

    expect(title).to.have.attribute('infer', '');
    expect(text).to.have.attribute('infer', '');

    for (const status of ['sent', 'accepted', 'rejected', 'revoked'] as const) {
      form.data!.status = status;
      await form.requestUpdate();

      expect(title).to.have.attribute('infer', '');
      expect(title).to.have.deep.property('options', {
        store_name: 'Example Store',
        context: status,
      });

      expect(text).to.have.attribute('infer', '');
      expect(text).to.have.deep.property('options', {
        store_name: 'Example Store',
        context: status,
      });
    }
  });

  it('renders store info in snapshot user layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        default-domain="foxycart.com"
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const summary = form.renderRoot.querySelector('foxy-internal-summary-control[infer="store"]');
    expect(summary).to.exist;

    const storeDomain = summary?.querySelector<InternalTextControl>(
      'foxy-internal-text-control[infer="store-domain"]'
    );
    const storeEmail = summary?.querySelector<InternalTextControl>(
      'foxy-internal-text-control[infer="store-email"]'
    );
    const storeUrl = summary?.querySelector<InternalTextControl>(
      'foxy-internal-text-control[infer="store-url"]'
    );

    expect(storeDomain).to.exist;
    expect(storeDomain).to.have.attribute('layout', 'summary-item');
    expect(storeDomain?.getValue()).to.equal('example.foxycart.com');

    expect(storeEmail).to.exist;
    expect(storeEmail).to.have.attribute('layout', 'summary-item');

    expect(storeUrl).to.exist;
    expect(storeUrl).to.have.attribute('layout', 'summary-item');
  });

  it('renders async action for leaving the store in snapshot user layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const action = form.renderRoot.querySelector(
      'foxy-internal-user-invitation-form-async-action[infer="leave"]'
    );

    expect(action).to.exist;
    expect(action).to.have.attribute('href', form.data!._links['fx:revoke'].href);
    expect(action).to.have.attribute('theme', 'error');
  });

  it('renders async action for rejecting the invitation in snapshot user layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const action = form.renderRoot.querySelector(
      'foxy-internal-user-invitation-form-async-action[infer="reject"]'
    );

    expect(action).to.exist;
    expect(action).to.have.attribute('href', form.data!._links['fx:reject'].href);
    expect(action).to.have.attribute('theme', 'error primary');
  });

  it('renders async action for accepting the invitation in snapshot user layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const action = form.renderRoot.querySelector(
      'foxy-internal-user-invitation-form-async-action[infer="accept"]'
    );

    expect(action).to.exist;
    expect(action).to.have.attribute('href', form.data!._links['fx:accept'].href);
    expect(action).to.have.attribute('theme', 'success primary');
  });

  it('renders Delete button in snapshot user layout', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const button = form.renderRoot.querySelector('foxy-internal-delete-control');
    expect(button).to.exist;
    expect(button).to.have.attribute('infer', 'delete');
  });

  it('renders store dashboard link in user layout when getStorePageHref is set', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    expect(form.renderRoot.querySelector('[infer="store"] [key="store_link"]')).to.not.exist;

    form.getStorePageHref = (href: string) => `https://example.com?href=${href}`;
    form.data = { ...form.data!, status: 'accepted' };
    await form.requestUpdate();
    const caption = form.renderRoot.querySelector('[infer="store"] [key="store_link"]');
    expect(caption).to.exist;

    const link = caption?.closest('a');
    expect(link).to.exist;
    expect(link).to.have.attribute(
      'href',
      'https://example.com?href=https://demo.api/hapi/stores/0'
    );
  });
});
