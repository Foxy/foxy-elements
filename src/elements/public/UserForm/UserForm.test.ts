import './index';

import * as sinon from 'sinon';

import { elementUpdated, expect, fixture, html, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { DefaultTests } from '../../../utils/test-utils';
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
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '55555555',
        },
        expectation: 'once',
        method: 'submit',
      },
      {
        case: 'should not create new users when insufficient data is provided',
        data: {
          first_name: 'John',
          last_name: 'Doe',
          phone: '55555555',
        },
        expectation: 'never',
        method: 'submit',
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
        await waitUntil(() => el.in('idle'), 'Element should become idle');
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

  describe('deleting a user', async () => {
    await DefaultTests.confirmBeforeAction(
      html`
        <foxy-user-form
          href="https://demo.foxycart.com/s/admin/error_entries/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        ></foxy-user-form>
      `
    );

    await DefaultTests.provideFeedbackOnLoading(
      html`<foxy-user-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-user-form>`,
      'https://demo.foxycart.com/s/admin/users/0'
    );
  });
});
