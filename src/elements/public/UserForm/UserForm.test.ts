import './index';

import * as sinon from 'sinon';

import { elementUpdated, expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { UserForm } from './UserForm';
import { router } from '../../../server/admin/index';

const a51 = Array(52).join('a');
const a101 = Array(102).join('a');

describe('UserForm', () => {
  describe('creating a new user', () => {
    const cases: any = [
      {
        case: 'should create new users when sufficient valid data is provided',
        data: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '55555555',
        },
        method: 'submit',
        expectation: 'once',
      },
      {
        case: 'should not create new users when insufficient data is provided',
        data: {
          first_name: 'John',
          last_name: 'Doe',
          phone: '55555555',
        },
        method: 'submit',
        expectation: 'never',
      },
    ];

    for (const d of Object.keys(cases[0].data)) {
      const newCase = { ...cases[0] };
      newCase.data = { ...cases[0].data };
      newCase.data[d] = a101;
      newCase.expectation = 'never';
      newCase.case = 'should not create new user with invalid ' + d;
      cases.push(newCase);
    }

    for (const c of cases) {
      it(c.case, async () => {
        const el = await fixture<UserForm>(html`
          <foxy-user-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-user-form>
        `);

        const mockEl = sinon.mock(el);
        (mockEl.expects(c.method) as any)[c.expectation]();
        const button = el.shadowRoot?.querySelector<ButtonElement>('[data-testid="action"]');
        const inputEl = el.shadowRoot?.querySelector(`[data-testid="phone"]`);

        el.edit(c.data);
        await elementUpdated(inputEl as HTMLInputElement);
        expect(button).to.exist;

        button!.click();

        await waitUntil(() => el.in('idle'), 'Element should become idle', {
          timeout: 5000,
        });

        mockEl.verify();
      });
    }
  });

  describe('input validation', () => {
    const cases = [
      { name: 'first_name', message: 'v8n_too_long', value: a51 },
      { name: 'last_name', message: 'v8n_too_long', value: a51 },
      { name: 'email', message: 'v8n_too_long', value: a101 },
      { name: 'email', message: 'v8n_invalid_email', value: 'not an email' },
      { name: 'email', message: 'v8n_required', value: '' },
      { name: 'phone', message: 'v8n_too_long', value: a51 },
    ];

    for (const c of cases) {
      it('Validates ' + c.name, async () => {
        const el: UserForm = await fixture(html`
          <foxy-user-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}></foxy-user-form>
        `);

        await waitUntil(() => el.in('idle'), 'Element should become idle');

        const changes: any = {};
        changes[c.name] = c.value;
        el.edit(changes);

        const inputEl = el.shadowRoot?.querySelector(`[data-testid="${c.name}"]`);
        expect(inputEl).to.exist;

        await elementUpdated(inputEl as HTMLInputElement);
        const error = inputEl?.getAttribute('error-message');
        expect(error).to.equal(c.message);
      });
    }
  });

  describe('deleting a user', () => {
    let el: UserForm;
    let mockEl: sinon.SinonMock;

    beforeEach(async () => {
      el = await fixture(html`
        <foxy-user-form
          href="https://demo.foxycart.com/s/admin/error_entries/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        ></foxy-user-form>
      `);
      await waitUntil(() => el.in('idle'), 'Element should become idle');
      mockEl = sinon.mock(el);
    });

    it('should not delete before confirmation', async () => {
      mockEl.expects('delete').never();
      const button = el.shadowRoot!.querySelector('[data-testid="action"]') as ButtonElement;
      button!.click();
      mockEl.verify();
    });

    it('should not delete after cancelation', async () => {
      mockEl.expects('delete').never();
      const button = el.shadowRoot!.querySelector('[data-testid="action"]') as ButtonElement;
      button!.click();
      const confirmDialog = el.shadowRoot!.querySelector(
        '[data-testid="confirm"]'
      ) as InternalConfirmDialog;
      await elementUpdated(el);
      confirmDialog.dispatchEvent(new DialogHideEvent(true));
      await elementUpdated(el);
      mockEl.verify();
    });

    it('should delete after confirmation', async () => {
      mockEl.expects('delete').once();
      const button = el.shadowRoot!.querySelector('[data-testid="action"]') as ButtonElement;
      button!.click();
      const confirmDialog = el.shadowRoot!.querySelector(
        '[data-testid="confirm"]'
      ) as InternalConfirmDialog;
      await elementUpdated(el);
      confirmDialog.dispatchEvent(new DialogHideEvent());
      await elementUpdated(el);
      mockEl.verify();
    });
  });

  it('should provide user feedback while loading', async () => {
    const el: UserForm = await fixture(html`
      <foxy-user-form
        href="https://demo.foxycart.com/s/admin/sleep"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-user-form>
    `);

    expect(el.shadowRoot?.querySelector(`[data-testid="spinner"]`)).not.to.have.class('opacity-0');

    el.href = ' https://demo.foxycart.com/s/admin/not-found';
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector(`[data-testid="spinner"]`)).not.to.have.class('opacity-0');

    el.href = 'https://demo.foxycart.com/s/admin/users/0';
    expect(el.shadowRoot?.querySelector(`[data-testid="spinner"]`)).not.to.have.class('opacity-0');

    await waitUntil(() => el.in('idle'), 'Element should become idle');
    expect(el.shadowRoot?.querySelector(`[data-testid="spinner"]`)).to.have.class('opacity-0');
  });
});
