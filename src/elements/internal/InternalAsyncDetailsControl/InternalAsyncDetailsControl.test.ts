import '../../public/CustomerCard';
import '../../public/CustomerForm';

import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { expect, fixture, waitUntil } from '@open-wc/testing';
import { html } from 'lit-html';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';
import { CollectionPage, FormDialog } from '../../public/index';
import { FetchEvent } from '../../public/NucleonElement/FetchEvent';
import { Pagination } from '../../public/Pagination/Pagination';
import { InternalDetails } from '../InternalDetails/InternalDetails';
import { InternalAsyncDetailsControl } from './index';
import { stub } from 'sinon';

describe('InternalAsyncDetailsControl', () => {
  it('imports and defines foxy-collection-page', () => {
    expect(customElements.get('foxy-collection-page')).to.exist;
  });

  it('imports and defines foxy-form-dialog', () => {
    expect(customElements.get('foxy-form-dialog')).to.exist;
  });

  it('imports and defines foxy-pagination', () => {
    expect(customElements.get('foxy-pagination')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines foxy-internal-control', () => {
    expect(customElements.get('foxy-internal-control')).to.exist;
  });

  it('imports and defines foxy-internal-details', () => {
    expect(customElements.get('foxy-internal-details')).to.exist;
  });

  it('imports and defines itself as foxy-internal-async-details-control', () => {
    expect(customElements.get('foxy-internal-async-details-control')).to.equal(
      InternalAsyncDetailsControl
    );
  });

  it('has a reactive property "related" (Array, empty by default)', () => {
    expect(InternalAsyncDetailsControl).to.have.nested.property('properties.related.type', Array);
    expect(new InternalAsyncDetailsControl()).to.have.deep.property('related', []);
  });

  it('has a reactive property "first" (String, empty by default)', () => {
    expect(InternalAsyncDetailsControl).to.have.nested.property('properties.first.type', String);
    expect(new InternalAsyncDetailsControl()).to.have.property('first', '');
  });

  it('has a reactive property "limit" (Number, 20 by default)', () => {
    expect(InternalAsyncDetailsControl).to.have.nested.property('properties.limit.type', Number);
    expect(new InternalAsyncDetailsControl()).to.have.property('limit', 20);
  });

  it('has a reactive property "form" (String, empty by default)', () => {
    expect(InternalAsyncDetailsControl).to.have.nested.property('properties.form.type', String);
    expect(new InternalAsyncDetailsControl()).to.have.property('form', '');
  });

  it('has a reactive property "item" (String, empty by default)', () => {
    expect(InternalAsyncDetailsControl).to.have.nested.property('properties.item.type', String);
    expect(new InternalAsyncDetailsControl()).to.have.property('item', '');
  });

  it('has a reactive property "open" (Boolean, false by default)', () => {
    expect(InternalAsyncDetailsControl).to.have.nested.property('properties.open.type', Boolean);
    expect(new InternalAsyncDetailsControl()).to.have.property('open', false);
  });

  it('renders foxy-internal-details bound to the control state', async () => {
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control></foxy-internal-async-details-control>
    `);

    const details = control.renderRoot.querySelector('foxy-internal-details') as InternalDetails;

    expect(details).to.exist;
    expect(details).to.have.property('infer', '');
    expect(details).to.have.property('summary', 'title');

    control.open = true;
    await control.requestUpdate();

    expect(details).to.have.property('open', true);

    control.open = false;
    await control.requestUpdate();

    expect(details).to.have.property('open', false);

    details.open = true;
    details.dispatchEvent(new CustomEvent('toggle'));

    expect(control).to.have.property('open', true);

    details.open = false;
    details.dispatchEvent(new CustomEvent('toggle'));

    expect(control).to.have.property('open', false);
  });

  it('renders a form dialog when "form" is defined', async () => {
    const router = createRouter();
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control
        first="https://demo.api/hapi/customers?limit=20"
        item="foxy-customer-card"
        form="foxy-customer-form"
        .related=${['https://demo.api/hapi/customer_attributes']}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-details-control>
    `);

    const dialog = control.renderRoot.querySelector('foxy-form-dialog') as FormDialog;

    expect(dialog).to.have.property('parent', 'https://demo.api/hapi/customers?limit=20');
    expect(dialog).to.have.deep.property('related', ['https://demo.api/hapi/customer_attributes']);
    expect(dialog).to.have.property('infer', 'dialog');
    expect(dialog).to.have.property('form', 'foxy-customer-form');
  });

  it('renders Add button when "form" is defined and the control is editable', async () => {
    const router = createRouter();
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control
        first="https://demo.api/hapi/customers?limit=20"
        item="foxy-customer-card"
        form="foxy-customer-form"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-details-control>
    `);

    const dialog = control.renderRoot.querySelector('foxy-form-dialog') as FormDialog;
    const button = control.renderRoot.querySelector('button[slot=actions]') as HTMLButtonElement;
    const showMethod = stub(dialog, 'show');

    expect(button).to.exist;
    expect(button).to.have.property('disabled', false);

    button.click();

    expect(showMethod).to.have.been.calledWith(button);

    expect(dialog).to.have.property('parent', 'https://demo.api/hapi/customers?limit=20');
    expect(dialog).to.have.property('header', 'header_create');
    expect(dialog).to.have.property('href', '');

    showMethod.restore();
  });

  it('hides Add button when "form" is not defined', async () => {
    const router = createRouter();
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control
        first="https://demo.api/hapi/customers?limit=20"
        item="foxy-customer-card"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-details-control>
    `);

    expect(control.renderRoot.querySelector('button[slot=actions]')).to.not.exist;
  });

  it('hides Add button when "form" is defined but the control is readonly', async () => {
    const router = createRouter();
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control
        first="https://demo.api/hapi/customers?limit=20"
        form="foxy-customer-form"
        item="foxy-customer-card"
        readonly
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-details-control>
    `);

    expect(control.renderRoot.querySelector('button[slot=actions]')).to.not.exist;
  });

  it('disables Add button when the control is disabled', async () => {
    const router = createRouter();
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control
        first="https://demo.api/hapi/customers?limit=20"
        form="foxy-customer-form"
        item="foxy-customer-card"
        disabled
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-details-control>
    `);

    expect(control.renderRoot.querySelector('button[slot=actions]')).to.have.property(
      'disabled',
      true
    );
  });

  it('renders pagination with limit applied', async () => {
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control></foxy-internal-async-details-control>
    `);

    const pagination = control.renderRoot.querySelector('foxy-pagination') as Pagination;

    expect(pagination).to.have.property('first', '');
    expect(pagination).to.have.property('infer', 'pagination');

    control.first = 'https://demo.api/hapi/customers';
    control.limit = 10;
    await control.requestUpdate();

    expect(pagination).to.have.property('first', 'https://demo.api/hapi/customers?limit=10');
  });

  it('renders a collection page inside of the pagination element', async () => {
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control></foxy-internal-async-details-control>
    `);

    const pagination = control.renderRoot.querySelector('foxy-pagination') as Pagination;
    const page = pagination.querySelector('foxy-collection-page') as CollectionPage<any>;

    expect(page).to.exist;
    expect(page).to.have.property('infer', 'card');
  });

  it('passes related links down to the collection page element', async () => {
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control></foxy-internal-async-details-control>
    `);

    const pagination = control.renderRoot.querySelector('foxy-pagination') as Pagination;
    const page = pagination.querySelector('foxy-collection-page') as CollectionPage<any>;

    expect(page).to.exist;
    expect(page).to.have.deep.property('related', []);

    control.related = ['https://demo.api/hapi/customers/0'];
    await control.requestUpdate();

    expect(page).to.have.deep.property('related', ['https://demo.api/hapi/customers/0']);
  });

  it('renders collection items in a page', async () => {
    type Data = Resource<Rels.Customers>;

    const router = createRouter();
    const data = await getTestData<Data>('https://demo.api/hapi/customers?limit=20');
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control
        first="https://demo.api/hapi/customers?limit=20"
        item="foxy-customer-card"
        .related=${['https://demo.api/hapi/customer_attributes']}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-details-control>
    `);

    const pagination = control.renderRoot.querySelector('foxy-pagination') as Pagination;
    const page = pagination.querySelector('foxy-collection-page') as CollectionPage<any>;

    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const cards = page.querySelectorAll('foxy-customer-card');

    for (let i = 0; i < data._embedded['fx:customers'].length; ++i) {
      const item = data._embedded['fx:customers'][i];
      const card = cards[i];

      expect(card).to.exist;
      expect(card).to.have.deep.property('related', control.related);
      expect(card).to.have.property('parent', control.first);
      expect(card).to.have.property('infer', '');
      expect(card).to.have.property('href', item._links.self.href);
    }
  });

  it('renders clickable collection items when "form" is defined', async () => {
    type Data = Resource<Rels.Customers>;

    const router = createRouter();
    const data = await getTestData<Data>('https://demo.api/hapi/customers?limit=20');
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control
        first="https://demo.api/hapi/customers?limit=20"
        item="foxy-customer-card"
        form="foxy-customer-form"
        .related=${['https://demo.api/hapi/customer_attributes']}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-details-control>
    `);

    const pagination = control.renderRoot.querySelector('foxy-pagination') as Pagination;
    const page = pagination.querySelector('foxy-collection-page') as CollectionPage<any>;

    await waitUntil(() => page.in({ idle: 'snapshot' }));

    const buttons = page.querySelectorAll('button');
    const dialog = control.renderRoot.querySelector('foxy-form-dialog') as FormDialog;
    const showMethod = stub(dialog, 'show');

    for (let i = 0; i < data._embedded['fx:customers'].length; ++i) {
      const item = data._embedded['fx:customers'][i];
      const button = buttons[i];

      expect(button).to.exist;
      expect(button).to.have.property('disabled', false);

      button.click();

      expect(showMethod).to.have.been.calledWith(button);
      expect(dialog).to.have.property('header', 'header_update');
      expect(dialog).to.have.property('href', item._links.self.href);

      const card = button.querySelector('foxy-customer-card');

      expect(card).to.exist;
      expect(card).to.have.deep.property('related', control.related);
      expect(card).to.have.property('parent', control.first);
      expect(card).to.have.property('infer', '');
      expect(card).to.have.property('href', item._links.self.href);

      showMethod.reset();
    }

    showMethod.restore();
  });

  it('disables clickable collection items when the control is disabled', async () => {
    const router = createRouter();
    const control = await fixture<InternalAsyncDetailsControl>(html`
      <foxy-internal-async-details-control
        first="https://demo.api/hapi/customers?limit=20"
        item="foxy-customer-card"
        form="foxy-customer-form"
        disabled
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-details-control>
    `);

    const pagination = control.renderRoot.querySelector('foxy-pagination') as Pagination;
    const page = pagination.querySelector('foxy-collection-page') as CollectionPage<any>;

    await waitUntil(() => page.in({ idle: 'snapshot' }));

    for (const button of page.querySelectorAll('button')) {
      expect(button).to.exist;
      expect(button).to.have.property('disabled', true);
    }
  });
});
