import './index';

import { expect, fixture, html } from '@open-wc/testing';

import { AccessRecoveryForm } from '../AccessRecoveryForm';
import { ButtonElement } from '@vaadin/vaadin-button';
import { InternalCustomerPortalLoggedOutView } from './InternalCustomerPortalLoggedOutView';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { SignInForm } from '../SignInForm';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { CustomerForm } from '../CustomerForm';
import { getTestData } from '../../../testgen/getTestData';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/customer';
import { createRouter } from '../../../server';
import { FetchEvent } from '../NucleonElement/FetchEvent';

describe('InternalCustomerPortalLoggedOutView', () => {
  it('renders sign-in page by default', () => {
    expect(new InternalCustomerPortalLoggedOutView()).to.have.property('page', 'sign-in');
  });

  describe('sign-in', () => {
    it('renders "sign-in:before" slot by default', async () => {
      const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'sign-in:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "sign-in:before" slot with template "sign-in:before" if available', async () => {
      const name = 'sign-in:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-internal-customer-portal-logged-out-view>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "sign-in:after" slot by default', async () => {
      const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'sign-in:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "sign-in:after" slot with template "sign-in:after" if available', async () => {
      const name = 'sign-in:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-internal-customer-portal-logged-out-view>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
      expect(await getByTestId(element, 'sign-in')).to.exist;
    });

    it('is hidden when element is hidden', async () => {
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view hidden>
        </foxy-internal-customer-portal-logged-out-view>
      `);

      expect(await getByTestId(element, 'sign-in')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes sign-in', async () => {
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view hiddencontrols="sign-in">
        </foxy-internal-customer-portal-logged-out-view>
      `);

      expect(await getByTestId(element, 'sign-in')).to.not.exist;
    });

    describe('header', () => {
      it('renders "sign-in:header:before" slot by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-in:header:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-in:header:before" slot with template "sign-in:header:before" if available', async () => {
        const name = 'sign-in:header:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "sign-in:header:after" slot by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-in:header:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-in:header:after" slot with template "sign-in:header:after" if available', async () => {
        const name = 'sign-in:header:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is visible by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        expect(await getByTestId(element, 'sign-in:header')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view hidden>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-in:header')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes sign-in:header', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view hiddencontrols="sign-in:header">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-in:header')).to.not.exist;
      });

      it('renders foxy-i18n title with key "sign_in"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view lang="es" ns="customer-portal">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const header = await getByTestId(element, 'sign-in:header');
        const title = await getByKey(header!, 'sign_in');

        expect(title).to.exist;
        expect(title).to.have.attribute('lang', 'es');
        expect(title).to.have.attribute('ns', 'customer-portal sign-in-form');
      });

      it('renders foxy-i18n hint with key "sign_in_hint"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view lang="es" ns="customer-portal">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const header = await getByTestId(element, 'sign-in:header');
        const title = await getByKey(header!, 'sign_in_hint');

        expect(title).to.exist;
        expect(title).to.have.attribute('lang', 'es');
        expect(title).to.have.attribute('ns', 'customer-portal sign-in-form');
      });
    });

    describe('form', () => {
      it('renders "sign-in:form:before" slot by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-in:form:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-in:form:before" slot with template "sign-in:form:before" if available', async () => {
        const name = 'sign-in:form:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "sign-in:form:after" slot by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-in:form:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-in:form:after" slot with template "sign-in:form:after" if available', async () => {
        const name = 'sign-in:form:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is visible by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        expect(await getByTestId(element, 'sign-in:form')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view hidden>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-in:form')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes sign-in:form', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view hiddencontrols="sign-in:form">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-in:form')).to.not.exist;
      });

      it('renders configurable foxy-sign-in-form posting to "foxy://customer-api/session"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            disabledcontrols="sign-in:form"
            readonlycontrols="sign-in:form:not=bar"
            hiddencontrols="sign-in:form:foo"
            group="test"
            lang="es"
          >
            <template slot="sign-in:form:email:before">
              <div>Test</div>
            </template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const form = (await getByTestId<SignInForm>(element, 'sign-in:form')) as SignInForm;

        expect(form).to.exist;
        expect(form).to.be.instanceOf(SignInForm);

        expect(form).to.have.attribute('disabledcontrols', 'not=*');
        expect(form).to.have.attribute('readonlycontrols', 'not=bar');
        expect(form).to.have.attribute('hiddencontrols', 'foo');
        expect(form).to.have.attribute('parent', 'foxy://customer-api/session');
        expect(form).to.have.attribute('group', 'test');
        expect(form).to.have.attribute('lang', 'es');

        expect(form.templates).to.have.key('email:before');
      });
    });

    describe('recover', () => {
      it('renders "sign-in:recover:before" slot by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-in:recover:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-in:recover:before" slot with template "sign-in:recover:before" if available', async () => {
        const name = 'sign-in:recover:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "sign-in:recover:after" slot by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-in:recover:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-in:recover:after" slot with template "sign-in:recover:after" if available', async () => {
        const name = 'sign-in:recover:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is visible by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        expect(await getByTestId(element, 'sign-in:recover')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view hidden>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-in:recover')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes sign-in:recover', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view hiddencontrols="sign-in:recover">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-in:recover')).to.not.exist;
      });

      it('is disabled when element is disabled', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view disabled>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-in:recover')).to.have.attribute('disabled');
      });

      it('is disabled when disabledcontrols includes "sign-in:recover"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view disabledcontrols="sign-in:recover">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-in:recover')).to.have.attribute('disabled');
      });

      it('is disabled when sign-in:form is busy', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const form = (await getByTestId<SignInForm>(element, 'sign-in:form')) as SignInForm;

        form.edit({ type: 'password', credential: { email: 'foo@bar.local', password: 'baz' } });
        form.submit();

        expect(await getByTestId(element, 'sign-in:recover')).to.have.attribute('disabled');
      });

      it('renders foxy-i18n caption with key "recover_access"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view lang="es" ns="customer-portal">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const recover = await getByTestId(element, 'sign-in:recover');
        const title = await getByKey(recover!, 'recover_access');

        expect(title).to.exist;
        expect(title).to.have.attribute('lang', 'es');
        expect(title).to.have.attribute('ns', 'customer-portal sign-in-form');
      });

      it('opens access recovery page on click', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const button = (await getByTestId(element, 'sign-in:recover')) as ButtonElement;

        button.click();
        expect(element).to.have.property('page', 'access-recovery');
      });
    });
  });

  describe('sign-up', () => {
    it('renders "sign-up:before" slot when visible', async () => {
      const layout = html`<foxy-internal-customer-portal-logged-out-view
        page="sign-up"
      ></foxy-internal-customer-portal-logged-out-view>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'sign-up:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "sign-up:before" slot with template "sign-up:before" if available', async () => {
      const name = 'sign-up:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view page="sign-up">
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-internal-customer-portal-logged-out-view>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "sign-up:after" slot when visible', async () => {
      const layout = html`<foxy-internal-customer-portal-logged-out-view
        page="sign-up"
      ></foxy-internal-customer-portal-logged-out-view>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'sign-up:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "sign-up:after" slot with template "sign-up:after" if available', async () => {
      const name = 'sign-up:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view page="sign-up">
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-internal-customer-portal-logged-out-view>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is hidden by default', async () => {
      const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
      expect(await getByTestId(element, 'sign-up')).to.not.exist;
    });

    it('is hidden when element is hidden', async () => {
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view page="sign-up" hidden>
        </foxy-internal-customer-portal-logged-out-view>
      `);

      expect(await getByTestId(element, 'sign-up')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes sign-up', async () => {
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view hiddencontrols="sign-up" page="sign-up">
        </foxy-internal-customer-portal-logged-out-view>
      `);

      expect(await getByTestId(element, 'sign-up')).to.not.exist;
    });

    describe('header', () => {
      it('renders "sign-up:header:before" slot when visible', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view
          page="sign-up"
        ></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-up:header:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-up:header:before" slot with template "sign-up:header:before" if available', async () => {
        const name = 'sign-up:header:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "sign-up:header:after" slot when visible', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view
          page="sign-up"
        ></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-up:header:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-up:header:after" slot with template "sign-up:header:after" if available', async () => {
        const name = 'sign-up:header:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is hidden by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        expect(await getByTestId(element, 'sign-up:header')).to.not.exist;
      });

      it('is hidden when element is hidden', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up" hidden>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-up:header')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes sign-up:header', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            hiddencontrols="sign-up:header"
            page="sign-up"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-up:header')).to.not.exist;
      });

      it('renders foxy-i18n title with key "sign_up"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            page="sign-up"
            lang="es"
            ns="customer-portal"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const header = await getByTestId(element, 'sign-up:header');
        const title = await getByKey(header!, 'sign_up');

        expect(title).to.exist;
        expect(title).to.have.attribute('lang', 'es');
        expect(title).to.have.attribute('ns', 'customer-portal sign-up-form');
      });

      it('renders foxy-i18n hint with key "sign_up_hint"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            page="sign-up"
            lang="es"
            ns="customer-portal"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const header = await getByTestId(element, 'sign-up:header');
        const title = await getByKey(header!, 'sign_up_hint');

        expect(title).to.exist;
        expect(title).to.have.attribute('lang', 'es');
        expect(title).to.have.attribute('ns', 'customer-portal sign-up-form');
      });
    });

    describe('form', () => {
      it('renders "sign-up:form:before" slot when visible', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view
          page="sign-up"
        ></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-up:form:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-up:form:before" slot with template "sign-up:form:before" if available', async () => {
        const name = 'sign-up:form:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "sign-up:form:after" slot when visible', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view
          page="sign-up"
        ></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        const slot = await getByName<HTMLSlotElement>(element, 'sign-up:form:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-up:form:after" slot with template "sign-up:form:after" if available', async () => {
        const name = 'sign-up:form:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is hidden by default', async () => {
        const layout = html`<foxy-internal-customer-portal-logged-out-view></foxy-internal-customer-portal-logged-out-view>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(layout);
        expect(await getByTestId(element, 'sign-up:form')).to.not.exist;
      });

      it('is hidden when element is hidden', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up" hidden>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-up:form')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes sign-up:form', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            hiddencontrols="sign-up:form"
            page="sign-up"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-up:form')).to.not.exist;
      });

      it('renders foxy-customer-form', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            readonlycontrols="foo sign-up:form:not=bar ppp"
            disabledcontrols="hjk a:b sign-up:form:abc:def"
            hiddencontrols="baz sign-up:form:qux"
            group="test"
            page="sign-up"
            lang="es"
            ns="qwerty"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const form = (await getByTestId(element, 'sign-up:form')) as CustomerForm;

        expect(form).to.exist;
        expect(form).to.have.property('localName', 'foxy-customer-form');
        expect(form).to.have.attribute('readonlycontrols', 'not=bar');
        expect(form).to.have.attribute('disabledcontrols', 'abc:def');
        expect(form).to.have.attribute(
          'hiddencontrols',
          'tax-id is-anonymous password-old forgot-password timestamps delete qux'
        );
        expect(form).to.have.attribute('parent', 'foxy://customer-api/signup');
        expect(form).to.have.attribute('group', 'test');
        expect(form).to.have.attribute('lang', 'es');
        expect(form).to.have.attribute('ns', 'qwerty sign-up-form');
        expect(form).to.have.deep.property('tosCheckboxSettings', undefined);
        expect(form).to.have.deep.property('verification', null);
        expect(form).to.have.deep.property('templates', {});
        expect(form).to.have.deep.property('settings', null);

        element.data = {
          ...(await getTestData('./hapi/customer_portal_settings/0')),
          sign_up: {
            enabled: true,
            verification: { type: 'hcaptcha', site_key: 'bar' },
          },
        } as Resource<Rels.CustomerPortalSettings>;

        await element.requestUpdate();

        expect(form).to.have.deep.property('settings', element.data);

        expect(form).to.have.deep.property(
          'tosCheckboxSettings',
          element.data?.tos_checkbox_settings
        );

        expect(form).to.have.deep.property('verification', {
          type: 'hcaptcha',
          siteKey: element.data?.sign_up?.verification.site_key,
        });

        element.templates = {
          'sign-up:form:email:before': html => html`foo`,
          'foo:bar': html => html`bar`,
        };

        await element.requestUpdate();

        expect(form).to.have.deep.property('templates', {
          'email:before': element.templates['sign-up:form:email:before'],
        });
      });
    });

    describe('go-back', () => {
      it('renders "sign-up:go-back:before" slot by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, 'sign-up:go-back:before');
        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-up:go-back:before" slot with template "sign-up:go-back:before" if available', async () => {
        const name = 'sign-up:go-back:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "sign-up:go-back:after" slot by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, 'sign-up:go-back:after');
        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "sign-up:go-back:after" slot with template "sign-up:go-back:after" if available', async () => {
        const name = 'sign-up:go-back:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is visible by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-up:go-back')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up" hidden>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-up:go-back')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes sign-up:go-back', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            hiddencontrols="sign-up:go-back"
            page="sign-up"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-up:go-back')).to.not.exist;
      });

      it('is disabled when element is disabled', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up" disabled>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-up:go-back')).to.have.attribute('disabled');
      });

      it('is disabled when disabledcontrols includes "sign-up:go-back"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            disabledcontrols="sign-up:go-back"
            page="sign-up"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'sign-up:go-back')).to.have.attribute('disabled');
      });

      it('is disabled when sign-up:form is busy', async () => {
        const router = createRouter();
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            page="sign-up"
            @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const button = await getByTestId(element, 'sign-up:go-back');
        expect(button).to.not.have.attribute('disabled');

        const form = (await getByTestId(element, 'sign-up:form')) as CustomerForm;
        form.href = 'https://demo.api/virtual/stall';
        await form.updateComplete;
        expect(button).to.have.attribute('disabled');
      });

      it('renders foxy-i18n caption with key "go_back"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            page="sign-up"
            lang="es"
            ns="customer-portal"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const signin = await getByTestId(element, 'sign-up:go-back');
        const title = await getByKey(signin!, 'go_back');

        expect(title).to.exist;
        expect(title).to.have.attribute('lang', 'es');
        expect(title).to.have.attribute('ns', 'customer-portal sign-up-form');
      });

      it('opens access sign-in page on click', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="sign-up">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        ((await getByTestId(element, 'sign-up:go-back')) as ButtonElement).click();
        expect(element).to.have.property('page', 'sign-in');
      });
    });
  });

  describe('access-recovery', () => {
    it('renders "access-recovery:before" slot by default', async () => {
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view page="access-recovery">
        </foxy-internal-customer-portal-logged-out-view>
      `);

      const slot = await getByName<HTMLSlotElement>(element, 'access-recovery:before');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "access-recovery:before" slot with template "access-recovery:before" if available', async () => {
      const name = 'access-recovery:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-internal-customer-portal-logged-out-view>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "access-recovery:after" slot by default', async () => {
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view page="access-recovery">
        </foxy-internal-customer-portal-logged-out-view>
      `);

      const slot = await getByName<HTMLSlotElement>(element, 'access-recovery:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "access-recovery:after" slot with template "access-recovery:after" if available', async () => {
      const name = 'access-recovery:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-internal-customer-portal-logged-out-view>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is visible by default', async () => {
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view page="access-recovery">
        </foxy-internal-customer-portal-logged-out-view>
      `);

      expect(await getByTestId(element, 'access-recovery')).to.exist;
    });

    it('is hidden when element is hidden', async () => {
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view page="access-recovery" hidden>
        </foxy-internal-customer-portal-logged-out-view>
      `);

      expect(await getByTestId(element, 'access-recovery')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes access-recovery', async () => {
      const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
        <foxy-internal-customer-portal-logged-out-view
          page="access-recovery"
          hiddencontrols="access-recovery"
        >
        </foxy-internal-customer-portal-logged-out-view>
      `);

      expect(await getByTestId(element, 'access-recovery')).to.not.exist;
    });

    describe('header', () => {
      it('renders "access-recovery:header:before" slot by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, 'access-recovery:header:before');
        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "access-recovery:header:before" slot with template "access-recovery:header:before" if available', async () => {
        const name = 'access-recovery:header:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "access-recovery:header:after" slot by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, 'access-recovery:header:after');
        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "access-recovery:header:after" slot with template "access-recovery:header:after" if available', async () => {
        const name = 'access-recovery:header:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is visible by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:header')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery" hidden>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:header')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes access-recovery:header', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            page="access-recovery"
            hiddencontrols="access-recovery:header"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:header')).to.not.exist;
      });

      it('renders foxy-i18n title with key "recover_access"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            page="access-recovery"
            lang="es"
            ns="customer-portal"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const header = await getByTestId(element, 'access-recovery:header');
        const title = await getByKey(header!, 'recover_access');

        expect(title).to.exist;
        expect(title).to.have.attribute('lang', 'es');
        expect(title).to.have.attribute('ns', 'customer-portal access-recovery-form');
      });

      it('renders foxy-i18n hint with key "recover_access_hint"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            page="access-recovery"
            lang="es"
            ns="customer-portal"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const header = await getByTestId(element, 'access-recovery:header');
        const title = await getByKey(header!, 'recover_access_hint');

        expect(title).to.exist;
        expect(title).to.have.attribute('lang', 'es');
        expect(title).to.have.attribute('ns', 'customer-portal access-recovery-form');
      });
    });

    describe('form', () => {
      it('renders "access-recovery:form:before" slot by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, 'access-recovery:form:before');
        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "access-recovery:form:before" slot with template "access-recovery:form:before" if available', async () => {
        const name = 'access-recovery:form:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "access-recovery:form:after" slot by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, 'access-recovery:form:after');
        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "access-recovery:form:after" slot with template "access-recovery:form:after" if available', async () => {
        const name = 'access-recovery:form:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is visible by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:form')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery" hidden>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:form')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes access-recovery:form', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            page="access-recovery"
            hiddencontrols="access-recovery:form"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:form')).to.not.exist;
      });

      it('renders configurable foxy-access-recovery-form posting to "foxy://customer-api/recover"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            disabledcontrols="access-recovery:form"
            readonlycontrols="access-recovery:form:not=bar"
            hiddencontrols="access-recovery:form:foo"
            group="test"
            page="access-recovery"
            lang="es"
          >
            <template slot="access-recovery:form:email:before">
              <div>Test</div>
            </template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const form = (await getByTestId(element, 'access-recovery:form')) as AccessRecoveryForm;

        expect(form).to.exist;
        expect(form).to.be.instanceOf(AccessRecoveryForm);

        expect(form).to.have.attribute('disabledcontrols', 'not=*');
        expect(form).to.have.attribute('readonlycontrols', 'not=bar');
        expect(form).to.have.attribute('hiddencontrols', 'foo');
        expect(form).to.have.attribute('parent', 'foxy://customer-api/recover');
        expect(form).to.have.attribute('group', 'test');
        expect(form).to.have.attribute('lang', 'es');

        expect(form.templates).to.have.key('email:before');
      });
    });

    describe('back', () => {
      it('renders "access-recovery:back:before" slot by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, 'access-recovery:back:before');
        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "access-recovery:back:before" slot with template "access-recovery:back:before" if available', async () => {
        const name = 'access-recovery:back:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "access-recovery:back:after" slot by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, 'access-recovery:back:after');
        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "access-recovery:back:after" slot with template "access-recovery:back:after" if available', async () => {
        const name = 'access-recovery:back:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is visible by default', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:back')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery" hidden>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:back')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes access-recovery:back', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            hiddencontrols="access-recovery:back"
            page="access-recovery"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:back')).to.not.exist;
      });

      it('is disabled when element is disabled', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery" disabled>
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:back')).to.have.attribute('disabled');
      });

      it('is disabled when disabledcontrols includes "access-recovery:back"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            disabledcontrols="access-recovery:back"
            page="access-recovery"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        expect(await getByTestId(element, 'access-recovery:back')).to.have.attribute('disabled');
      });

      it('is disabled when access-recovery:form is busy', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const form = (await getByTestId(element, 'access-recovery:form')) as AccessRecoveryForm;

        form.edit({ type: 'email', detail: { email: 'foo@bar.local' } });
        form.submit();

        expect(await getByTestId(element, 'access-recovery:back')).to.have.attribute('disabled');
      });

      it('renders foxy-i18n caption with key "back"', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view
            page="access-recovery"
            lang="es"
            ns="customer-portal"
          >
          </foxy-internal-customer-portal-logged-out-view>
        `);

        const signin = await getByTestId(element, 'access-recovery:back');
        const title = await getByKey(signin!, 'back');

        expect(title).to.exist;
        expect(title).to.have.attribute('lang', 'es');
        expect(title).to.have.attribute('ns', 'customer-portal access-recovery-form');
      });

      it('opens access sign-iny page on click', async () => {
        const element = await fixture<InternalCustomerPortalLoggedOutView>(html`
          <foxy-internal-customer-portal-logged-out-view page="access-recovery">
          </foxy-internal-customer-portal-logged-out-view>
        `);

        ((await getByTestId(element, 'access-recovery:back')) as ButtonElement).click();
        expect(element).to.have.property('page', 'sign-in');
      });
    });
  });
});
