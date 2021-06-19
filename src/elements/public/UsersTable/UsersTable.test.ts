import './index';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { UsersTable } from './UsersTable';
import { router } from '../../../server/admin';

const usersURL = 'https://demo.foxycart.com/s/admin/stores/0/users';

describe('Display user information', function () {
  it('Displays 5 columns', async function () {
    const el: UsersTable = await fixture(html`
      <foxy-users-table
        href="${usersURL}"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      ></foxy-users-table>
    `);
    await waitUntil(() => el.in('idle'), 'Element should become idle');
    const row = el.shadowRoot?.querySelector('table tbody tr');
    expect(row).to.exist;
    const columns = row!.querySelectorAll('td');
    expect(columns).to.exist;
    expect(columns!.length).to.equal(5);
  });

  it('Displays columns in correct order', async function () {
    const el: UsersTable = await fixture(html`
      <foxy-users-table
        href="${usersURL}"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      ></foxy-users-table>
    `);
    await waitUntil(() => el.in('idle'), 'Element should become idle');
    const row = el.shadowRoot?.querySelector('table tbody tr');
    expect(row).to.exist;
    const columns = row!.querySelectorAll('td');
    expect(columns).to.exist;
    const columnNames = ['name', 'email', 'roles', 'lastUpdated', 'actions'];
    for (let i = 0; i++; i < columnNames.length) {
      expect(columns[i].getAttribute('data-testclass')).to.equal(columnNames[i]);
    }
  });

  it('Provide a link to remove the user', async function () {
    const el: UsersTable = await fixture(html`
      <foxy-users-table
        href="${usersURL}"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      ></foxy-users-table>
    `);
    await waitUntil(() => el.in('idle'), 'Element should become idle');
    const actions = el.shadowRoot?.querySelector('[data-testclass="actions"]');
    expect(actions).to.exist;
    // foxy-form-dialog is tested elsewhere and provides a form once the dialog is opened.
    const foxyFormUserForm = actions!.querySelector('foxy-form-dialog');
    expect(foxyFormUserForm).to.exist;
    // foxy-user-form is tested elsewhere and allows for removing the user if the href is filled
    expect(foxyFormUserForm!.getAttribute('form')).to.equal('foxy-user-form');
    expect(foxyFormUserForm!.getAttribute('href')).to.equal(
      'https://demo.foxycart.com/s/admin/users/0'
    );
  });
});

it('should be accessible', async function () {
  const el = await fixture(html` <foxy-users-table href="${usersURL}"></foxy-users-table> `);
  await expect(el).to.be.accessible();
});
