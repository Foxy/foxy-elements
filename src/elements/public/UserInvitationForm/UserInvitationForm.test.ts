import type { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { UserInvitationForm as Form } from './UserInvitationForm';
import { InternalForm } from '../../internal/InternalForm';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';
import { parseScope } from '../../../utils/invitation-scope';
import { I18n } from '../I18n/I18n';
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

  it('has a reactive property "currentStore"', () => {
    expect(new Form()).to.have.property('currentStore', null);
    expect(Form).to.have.deep.nested.property('properties.currentStore', {
      attribute: 'current-store',
    });
  });

  it('has a reactive property "currentUser"', () => {
    expect(new Form()).to.have.property('currentUser', null);
    expect(Form).to.have.deep.nested.property('properties.currentUser', {
      attribute: 'current-user',
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

  it('always hides timestamps and Undo, and hides Submit on a bare form (no href, not a dirty snapshot)', () => {
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

  describe('scope error mapping', () => {
    const cases: [string, string][] = [
      [
        "You can't give more permission than you have. Invalid scopes: carts_write",
        'error:scope_too_broad',
      ],
      ["You don't have permission to edit scope in the invitation", 'error:scope_edit_forbidden'],
      [
        'Only the inviter can change the scope while the invitaion is still has sent status',
        'error:scope_inviter_only',
      ],
      [
        "You can't change scope for this user because nobody will have full access to the store",
        'error:scope_last_admin',
      ],
    ];

    cases.forEach(([message, key]) => {
      it(`produces "${key}" for the matching server message`, async () => {
        const form = await fixture<Form>(
          html`<foxy-user-invitation-form></foxy-user-invitation-form>`
        );

        form.data = await getTestData<Data>('./hapi/user_invitations/0');
        form.addEventListener('fetch', (evt: Event) => {
          const event = evt as FetchEvent;
          const body = JSON.stringify({ _embedded: { 'fx:errors': [{ message }] } });

          event.respondWith(Promise.resolve(new Response(body, { status: 400 })));
        });

        form.edit({ email: 'test@example.com' });
        form.submit();

        await waitUntil(() => !!form.in('idle'));
        expect(form.errors).to.include(key);
      });
    });
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

  it("renders a special async action for revoking current user's access in snapshot admin layout", async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        current-store="https://demo.api/hapi/stores/0"
        current-user="https://demo.api/hapi/users/0"
        layout="admin"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const action = form.renderRoot.querySelector(
      'foxy-internal-post-action-control[infer="revoke"]'
    );

    expect(action).to.exist;
    expect(action).to.have.attribute('href', form.data!._links['fx:revoke'].href);
    expect(action).to.have.attribute('theme', 'error');
    expect(action).to.have.attribute(
      'message-options',
      JSON.stringify({ store_domain: 'example', store_name: 'Example Store' })
    );

    const selfrevokedEvent = oneEvent(form, 'selfrevoked');
    action!.dispatchEvent(new Event('success'));
    expect(await selfrevokedEvent).to.exist;
  });

  it("renders a special async action for revoking current user's access in snapshot user layout", async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-user-invitation-form
        current-store="https://demo.api/hapi/stores/0"
        current-user="https://demo.api/hapi/users/0"
        layout="user"
        href="https://demo.api/hapi/user_invitations/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-invitation-form>
    `);

    await waitUntil(() => !!form.data, undefined, { timeout: 5000 });
    const action = form.renderRoot.querySelector(
      'foxy-internal-post-action-control[infer="leave"]'
    );

    expect(action).to.exist;
    expect(action).to.have.attribute('href', form.data!._links['fx:revoke'].href);
    expect(action).to.have.attribute('theme', 'error');
    expect(action).to.have.attribute(
      'message-options',
      JSON.stringify({ store_domain: 'example', store_name: 'Example Store' })
    );

    const selfrevokedEvent = oneEvent(form, 'selfrevoked');
    action!.dispatchEvent(new Event('success'));
    expect(await selfrevokedEvent).to.exist;
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

    const newData = { ...form.data! } as any;
    delete newData._links['fx:revoke'];
    form.data = newData;
    await form.requestUpdate();

    expect(action).to.exist;
    expect(action).to.have.attribute('href', form.data!._links['fx:reject'].href);
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

  describe('scope control', () => {
    const form = async (granterScope: string | null = null) => {
      const element = await fixture<Form>(html`
        <foxy-user-invitation-form layout="admin"></foxy-user-invitation-form>
      `);

      element.currentUserScope = granterScope;
      await element.requestUpdate();

      return element;
    };

    it('has a currentUserScope property defaulting to null', async () => {
      expect((await form()).currentUserScope).to.be.null;
    });

    it('hides the scope control when no granter scope is given', async () => {
      expect((await form()).hiddenSelector.matches('scope', true)).to.be.true;
    });

    it('shows the scope control when a granter scope is given', async () => {
      const element = await form('store_full_access');
      expect(element.hiddenSelector.matches('scope', true)).to.be.false;
    });

    it('renders the scope control in the admin template state', async () => {
      const element = await form('store_full_access');
      const control = element.renderRoot.querySelector(
        'foxy-internal-user-invitation-form-scope-control[infer="scope"]'
      );

      expect(control).to.exist;
      expect(control).to.have.attribute('granter-scope', 'store_full_access');
    });

    // Regression guard: on a fresh invitation, `scope` is undefined, so the preset is `null` and
    // no option matches -- `summary-item` layout falls back to `this.placeholder`, which resolves
    // through the same infer chain as `label`/`helper_text`. `scope.placeholder` was missing
    // entirely at one point, so i18next returned the bare key name and the access-level select
    // displayed the literal text "placeholder".
    //
    // The wtr test environment never loads real i18next resources: the HTTP backend's
    // `loadPath` only resolves through `.storybook/preview.js`'s bridging, which doesn't run
    // here (see `web-test-runner.config.js`'s middleware, which redirects `/translations/*` to
    // `/src/mocks/translations/*` -- a fixture set with no `user-invitation-form` namespace at
    // all). Without seeding a real bundle, `t('placeholder')` returns the bare key in *every*
    // test, whether or not the real `en.json` has the key, which would make this assertion
    // trivially pass regardless of the actual bug. Seeding the real value from
    // `src/static/translations/user-invitation-form/en.json` (same pattern as
    // `UserInvitationCard.test.ts`'s `scope summary` suite) and asserting against it, not just
    // "not the raw key", is what makes this fail again if the translation key is ever removed
    // or its value changes without this test being kept in sync.
    describe('access-level placeholder', () => {
      before(() => {
        I18n.i18next.addResourceBundle(
          'en',
          'user-invitation-form',
          { scope: { placeholder: 'Select...' } },
          true,
          true
        );
      });

      after(() => {
        I18n.i18next.removeResourceBundle('en', 'user-invitation-form');
      });

      it('does not show the literal "placeholder" key on the access-level select when nothing is chosen', async () => {
        const element = await form('store_full_access');
        const control = element.renderRoot.querySelector(
          'foxy-internal-user-invitation-form-scope-control[infer="scope"]'
        );

        await (control as unknown as { updateComplete: Promise<unknown> })?.updateComplete;

        const presetControl = control?.shadowRoot?.querySelector(
          'foxy-internal-select-control[data-preset]'
        ) as
          | (HTMLElement & { placeholder: string; updateComplete: Promise<unknown> })
          | null
          | undefined;

        expect(presetControl, 'the access-level select must exist for this check to be meaningful')
          .to.exist;

        await presetControl?.updateComplete;

        const displayedText = presetControl?.shadowRoot
          ?.querySelector('.truncate')
          ?.textContent?.trim();

        expect(presetControl?.placeholder).to.equal('Select...');
        expect(presetControl?.placeholder).to.not.equal('placeholder');
        expect(displayedText).to.equal('Select...');
      });
    });

    it('does not require a scope when the control is hidden', async () => {
      const element = await form();
      element.edit({ email: 'test@example.com' });
      await element.requestUpdate();

      expect(element.errors).to.not.include('scope:v8n_required');
    });

    it('requires a scope when the control is shown', async () => {
      const element = await form('store_full_access');
      element.edit({ email: 'test@example.com' });
      await element.requestUpdate();

      expect(element.errors).to.include('scope:v8n_required');

      element.edit({ scope: 'store_full_access' });
      await element.requestUpdate();

      expect(element.errors).to.not.include('scope:v8n_required');
    });

    // Choosing Custom and leaving (or returning) every row to None serializes to a defined
    // empty string, distinct from the undefined scope of an invitation nobody has touched
    // yet. Conflating the two under "scope:v8n_required" reads as if nothing had been
    // selected, when the admin did choose -- they just chose nothing.
    it('produces a distinct message for an explicitly empty custom selection', async () => {
      const element = await form('store_full_access');
      element.edit({ email: 'test@example.com' });
      await element.requestUpdate();

      expect(element.errors).to.include('scope:v8n_required');
      expect(element.errors).to.not.include('scope:v8n_required_custom_empty');

      element.edit({ scope: '' });
      await element.requestUpdate();

      expect(element.errors).to.include('scope:v8n_required_custom_empty');
      expect(element.errors).to.not.include('scope:v8n_required');

      element.edit({ scope: 'store_full_access' });
      await element.requestUpdate();

      expect(element.errors).to.not.include('scope:v8n_required');
      expect(element.errors).to.not.include('scope:v8n_required_custom_empty');
    });

    // A consumer that hides the control must not be blocked by a rule about it. The gate reads
    // the `hiddenControls` field, not the `hiddenSelector` getter — see `__isScopeGated`.
    it('does not require a scope when the consumer hides the control', async () => {
      const element = await fixture<Form>(html`
        <foxy-user-invitation-form
          layout="admin"
          current-user-scope="store_full_access"
          hiddencontrols="scope"
        >
        </foxy-user-invitation-form>
      `);

      element.edit({ email: 'test@example.com' });
      await element.requestUpdate();

      expect(element.errors).to.not.include('scope:v8n_required');
    });

    describe('editing an existing invitation', () => {
      const snapshot = async (status: string, granterScope: string) => {
        const router = createRouter();
        const element = await fixture<Form>(html`
          <foxy-user-invitation-form
            layout="admin"
            href="https://demo.api/hapi/user_invitations/0"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-user-invitation-form>
        `);

        await waitUntil(() => !!element.data, undefined, { timeout: 5000 });

        element.currentUserScope = granterScope;
        element.data = { ...element.data, status } as Data;
        await element.requestUpdate();

        return element;
      };

      it('renders the scope control for a sent invitation', async () => {
        const element = await snapshot('sent', 'store_full_access');
        expect(element.renderRoot.querySelector('foxy-internal-user-invitation-form-scope-control'))
          .to.exist;
      });

      it('renders the scope control for an accepted invitation', async () => {
        const element = await snapshot('accepted', 'store_full_access');
        expect(element.hiddenSelector.matches('scope', true)).to.be.false;
      });

      it('hides the scope control for a revoked invitation', async () => {
        const element = await snapshot('revoked', 'store_full_access');
        expect(element.hiddenSelector.matches('scope', true)).to.be.true;
      });

      it('hides the scope control for a rejected or expired invitation', async () => {
        expect(
          (await snapshot('rejected', 'store_full_access')).hiddenSelector.matches('scope', true)
        ).to.be.true;
        expect(
          (await snapshot('expired', 'store_full_access')).hiddenSelector.matches('scope', true)
        ).to.be.true;
      });

      it('makes the scope readonly without store_full_access or user_invitations_write', async () => {
        // The API applies this rule on update only.
        const element = await snapshot('accepted', 'customers_read');
        expect(element.readonlySelector.matches('scope', true)).to.be.true;
      });

      it('keeps the scope editable with user_invitations_write', async () => {
        const element = await snapshot('accepted', 'user_invitations_write');
        expect(element.readonlySelector.matches('scope', true)).to.be.false;
      });

      it('keeps the scope editable with store_full_access', async () => {
        const element = await snapshot('accepted', 'store_full_access');
        expect(element.readonlySelector.matches('scope', true)).to.be.false;
      });

      // Every other restricted-granter fixture in this suite (and in the stories) locks --
      // the mock invitation at .../user_invitations/0 holds tokens those granters can't grant.
      // That leaves a real coverage hole: an over-broad lock predicate inside
      // InternalUserInvitationFormScopeControl would freeze every narrow granter and this
      // suite would still pass, because nothing here exercises a narrow granter who actually
      // *can* re-grant everything the invitation holds. This is that case: narrower than
      // store_full_access, but it fully covers
      // "transactions_read transactions_resend customers_write item_categories_read reporting_read"
      // (customers_write needs both customers_read and customers_write to be grantable).
      // user_invitations_write is included so the form's own readonlySelector doesn't lock
      // the scope for the separate scope-edit rule tested above.
      it('lets a narrow-but-sufficient granter edit the scope of an existing invitation', async () => {
        const narrowGranterScope = [
          'transactions_read',
          'transactions_resend',
          'customers_read',
          'customers_write',
          'item_categories_read',
          'reporting_read',
          'user_invitations_write',
        ].join(' ');

        const element = await snapshot('accepted', narrowGranterScope);

        // Not locked at the form's own readonlySelector level (user_invitations_write).
        expect(element.readonlySelector.matches('scope', true)).to.be.false;

        // Not locked at the internal control's own level either -- this is the guard that
        // actually matters here, since __hasUnreachableGrant is what would freeze editing if
        // it were made over-broad. The preset picker is now a
        // `foxy-internal-select-control[data-preset]` (the radio group is gone entirely), so
        // its own `readonly` property (inferred the same way a row's is) is the right thing to
        // read.
        const control = element.renderRoot.querySelector(
          'foxy-internal-user-invitation-form-scope-control[infer="scope"]'
        );

        // The control infers its own `hidden`/`readonly` from the form asynchronously, on its
        // own update cycle -- a separate microtask from the form's `requestUpdate()` above --
        // so its shadow DOM isn't guaranteed to reflect the new granter scope yet without
        // waiting for its own `updateComplete` too.
        await (control as unknown as { updateComplete: Promise<unknown> })?.updateComplete;

        const presetControl = control?.shadowRoot?.querySelector(
          'foxy-internal-select-control[data-preset]'
        ) as
          | (HTMLElement & { readonly: boolean; updateComplete: Promise<unknown> })
          | null
          | undefined;

        expect(presetControl, 'the preset control must exist for this check to be meaningful').to
          .exist;

        // Same reason as the `control` wait above: the preset control's own `readonly`
        // (inferred from `control`, in turn inferred from the form) settles on its own
        // microtask.
        await presetControl?.updateComplete;
        expect(presetControl?.readonly).to.be.false;

        // And prove it's actually editable, not just unlocked in appearance: change a level
        // through the row's `foxy-internal-select-control` (`data-collection` lives directly on
        // it -- there's no separate row wrapper since the summary-item rework) and confirm it
        // lands in `form.scope`. `customers` currently holds `full` (via `customers_write`) and
        // this granter can re-grant it at any level, so drop it to `read`.
        const rowControl = control?.shadowRoot?.querySelector(
          'foxy-internal-select-control[data-collection="customers"]'
        ) as (HTMLElement & { updateComplete: Promise<unknown> }) | null | undefined;

        expect(rowControl, 'the customers row control must exist for this edit to be meaningful').to
          .exist;

        // Same reason as the `control`/`presetGroup` wait above: the row control's own
        // `readonly` (inferred from `control`, in turn inferred from the form) settles on its
        // own microtask.
        await rowControl?.updateComplete;

        const select = rowControl?.shadowRoot?.querySelector('select') as
          | (HTMLElement & { value: string })
          | null
          | undefined;

        expect(select, 'the customers row select must exist for this edit to be meaningful').to
          .exist;

        select!.value = 'read';
        select!.dispatchEvent(new Event('change'));

        await element.requestUpdate();

        expect(parseScope(element.form.scope).levels.customers).to.equal('read');
      });

      it('renders a submit control in the admin snapshot state', async () => {
        const element = await snapshot('accepted', 'store_full_access');
        expect(element.renderRoot.querySelector('foxy-internal-submit-control[infer="submit"]')).to
          .exist;
      });

      it('no longer force-hides submit', async () => {
        const element = await snapshot('accepted', 'store_full_access');
        element.edit({ scope: 'store_full_access' });
        await element.requestUpdate();

        expect(element.hiddenSelector.matches('submit', true)).to.be.false;
      });

      it('still hides submit while the form is clean', async () => {
        const element = await snapshot('accepted', 'store_full_access');
        expect(element.hiddenSelector.matches('submit', true)).to.be.true;
      });

      // The v8n rule and `hiddenSelector` share one gating predicate rather than each restating
      // the condition, so widening the gate can never leave a required-but-invisible control
      // behind. The second case pins that the rule reads the status from the form under
      // validation, not from `host.data`, which is one transition stale while v8n runs.
      it('does not require a scope when the status hides the control', async () => {
        const element = await snapshot('revoked', 'store_full_access');
        element.data = { ...element.data, scope: '' } as Data;
        await element.requestUpdate();

        expect(element.errors).to.not.include('scope:v8n_required');
      });

      it('does not require a scope when the status and the scope change together', async () => {
        const element = await snapshot('accepted', 'store_full_access');
        element.data = { ...element.data, status: 'revoked', scope: '' } as Data;
        await element.requestUpdate();

        expect(element.errors).to.not.include('scope:v8n_required');
      });
    });
  });
});
