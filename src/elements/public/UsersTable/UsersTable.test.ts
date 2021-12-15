import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog/FormDialog';
import { UsersTable } from './UsersTable';
import { router } from '../../../server/admin';
import { stub } from 'sinon';

const usersURL = 'https://demo.foxycart.com/s/admin/stores/0/users';

describe('UsersTable', () => {
  it('displays 5 columns', async function () {
    const element = await fixture<UsersTable>(html`
      <foxy-users-table href=${usersURL} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-users-table>
    `);

    await waitUntil(() => element.in('idle'), 'Element should become idle', {
      timeout: 5000,
    });

    const row = element.shadowRoot?.querySelector('table tbody tr');
    expect(row).to.exist;

    const columns = row!.querySelectorAll('td');
    expect(columns).to.exist;
    expect(columns!.length).to.equal(5);
  });

  it('displays columns in correct order', async function () {
    const element = await fixture<UsersTable>(html`
      <foxy-users-table href=${usersURL} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-users-table>
    `);

    await waitUntil(() => element.in('idle'), 'Element should become idle', {
      timeout: 5000,
    });

    const row = element.shadowRoot?.querySelector('table tbody tr');
    expect(row).to.exist;

    const columns = row!.querySelectorAll('td');
    expect(columns).to.exist;

    const columnNames = ['name', 'email', 'roles', 'lastUpdated', 'actions'];
    for (let i = 0; i++; i < columnNames.length) {
      expect(columns[i].getAttribute('data-testclass')).to.equal(columnNames[i]);
    }
  });

  it('provides a button to update a user', async function () {
    const element = await fixture<UsersTable>(html`
      <foxy-users-table href=${usersURL} @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
      </foxy-users-table>
    `);

    await waitUntil(() => element.in('idle'), 'Element should become idle', {
      timeout: 5000,
    });

    const button = element.shadowRoot!.querySelector('[data-testclass="actions"]');
    const dialog = element.shadowRoot?.querySelector('foxy-form-dialog') as FormDialog;

    expect(button).to.exist;
    expect(dialog).to.exist;

    const showMethod = stub(dialog!, 'show');
    button!.dispatchEvent(new CustomEvent('click'));
    await element.updateComplete;

    expect(showMethod).to.have.been.called;
    expect(dialog).to.have.property('form', 'foxy-user-form');
    expect(dialog).to.have.property('href', 'https://demo.foxycart.com/s/admin/users/0');
  });
});
