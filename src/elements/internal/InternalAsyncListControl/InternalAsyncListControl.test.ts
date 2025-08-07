import type { InternalSummaryControl } from '../InternalSummaryControl/InternalSummaryControl';
import type { NotificationElement } from '@vaadin/vaadin-notification';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { AttributeCard } from '../../public/AttributeCard/AttributeCard';
import type { ButtonElement } from '@vaadin/vaadin-button';
import type { ItemRenderer } from '../../public/CollectionPage/CollectionPage';
import type { FetchEvent } from '../../public/NucleonElement/FetchEvent';

import '../../public/AttributeCard/index';
import '../../public/AttributeForm/index';
import './index';

import { InternalAsyncListControl as Control } from './InternalAsyncListControl';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { InternalConfirmDialog } from '../InternalConfirmDialog/InternalConfirmDialog';
import { expect, fixture, oneEvent, waitUntil } from '@open-wc/testing';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { CollectionPage } from '../../public/CollectionPage/CollectionPage';
import { SwipeActions } from '../../public/SwipeActions/SwipeActions';
import { getTestData } from '../../../testgen/getTestData';
import { FormDialog } from '../../public/FormDialog/FormDialog';
import { Pagination } from '../../public/Pagination/Pagination';
import { ifDefined } from 'lit-html/directives/if-defined';
import { getByTag } from '../../../testgen/getByTag';
import { getByKey } from '../../../testgen/getByKey';
import { spread } from '@open-wc/lit-helpers';
import { I18n } from '../../public/I18n/I18n';
import { html } from 'lit-html';
import { stub } from 'sinon';
import { getByTestClass } from '../../../testgen/getByTestClass';
import { createRouter } from '../../../server/hapi';
import { Type } from '../../public/QueryBuilder/types';

customElements.define(
  'x-test-control-with-error-message',
  class extends Control {
    protected get _errorMessage() {
      return 'Test error message';
    }
  }
);

describe('InternalAsyncListControl', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines vaadin-button', () => {
    const element = customElements.get('vaadin-button');
    expect(element).to.exist;
  });

  it('imports and defines vaadin-checkbox', () => {
    const element = customElements.get('vaadin-checkbox');
    expect(element).to.exist;
  });

  it('imports and defines vaadin-notification', () => {
    const element = customElements.get('vaadin-notification');
    expect(element).to.exist;
  });

  it('imports and defines foxy-collection-page', () => {
    const element = customElements.get('foxy-collection-page');
    expect(element).to.equal(CollectionPage);
  });

  it('imports and defines foxy-swipe-actions', () => {
    const element = customElements.get('foxy-swipe-actions');
    expect(element).to.equal(SwipeActions);
  });

  it('imports and defines foxy-form-dialog', () => {
    const element = customElements.get('foxy-form-dialog');
    expect(element).to.equal(FormDialog);
  });

  it('imports and defines foxy-pagination', () => {
    const element = customElements.get('foxy-pagination');
    expect(element).to.equal(Pagination);
  });

  it('imports and defines foxy-i18n', () => {
    const element = customElements.get('foxy-i18n');
    expect(element).to.equal(I18n);
  });

  it('imports and defines foxy-internal-editable-control', () => {
    const element = customElements.get('foxy-internal-editable-control');
    expect(element).to.equal(InternalEditableControl);
  });

  it('imports and defines foxy-internal-confirm-dialog', () => {
    const element = customElements.get('foxy-internal-confirm-dialog');
    expect(element).to.equal(InternalConfirmDialog);
  });

  it('imports and defines foxy-internal-async-list-control-filter-overlay', () => {
    const element = customElements.get('foxy-internal-async-list-control-filter-overlay');
    expect(element).to.exist;
  });

  it('imports and defines itself as foxy-internal-async-list-control', () => {
    const element = customElements.get('foxy-internal-async-list-control');
    expect(element).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('has a reactive property "keepDialogOpenOnDelete"', () => {
    expect(new Control()).to.have.property('keepDialogOpenOnDelete', false);
    expect(Control).to.have.deep.nested.property('properties.keepDialogOpenOnDelete', {
      type: Boolean,
      attribute: 'keep-dialog-open-on-delete',
    });
  });

  it('has a reactive property "keepDialogOpenOnPost"', () => {
    expect(new Control()).to.have.property('keepDialogOpenOnPost', false);
    expect(Control).to.have.deep.nested.property('properties.keepDialogOpenOnPost', {
      type: Boolean,
      attribute: 'keep-dialog-open-on-post',
    });
  });

  it('has a reactive property "hideDeleteButton"', () => {
    expect(new Control()).to.have.property('hideDeleteButton', false);
    expect(Control).to.have.deep.nested.property('properties.hideDeleteButton', {
      type: Boolean,
      attribute: 'hide-delete-button',
    });
  });

  it('has a reactive property "hideCreateButton"', () => {
    expect(new Control()).to.have.property('hideCreateButton', false);
    expect(Control).to.have.deep.nested.property('properties.hideCreateButton', {
      type: Boolean,
      attribute: 'hide-create-button',
    });
  });

  it('has a reactive property "createPageHref"', () => {
    expect(new Control()).to.have.property('createPageHref', null);
    expect(Control).to.have.deep.nested.property('properties.createPageHref', {
      attribute: 'create-page-href',
    });
  });

  it('has a reactive property "getPageHref"', () => {
    expect(new Control()).to.have.property('getPageHref', null);
    expect(Control).to.have.deep.nested.property('properties.getPageHref', { attribute: false });
  });

  it('has a reactive property "related"', () => {
    expect(new Control()).to.have.deep.property('related', []);
    expect(Control).to.have.deep.nested.property('properties.related', { type: Array });
  });

  it('has a reactive property "layout"', () => {
    expect(new Control()).to.have.property('layout', null);
    expect(Control).to.have.deep.nested.property('properties.layout', {});
  });

  it('has a reactive property "first"', () => {
    expect(new Control()).to.have.property('first', null);
    expect(Control).to.have.deep.nested.property('properties.first', {});
  });

  it('has a reactive property "limit"', () => {
    expect(new Control()).to.have.property('limit', 20);
    expect(Control).to.have.deep.nested.property('properties.limit', { type: Number });
  });

  it('has a reactive property "form"', () => {
    expect(new Control()).to.have.property('form', null);
    expect(Control).to.have.deep.nested.property('properties.form', {});
  });

  it('has a reactive property "formProps"', () => {
    expect(new Control()).to.have.deep.property('formProps', {});
    expect(Control).to.have.deep.nested.property('properties.formProps', {
      attribute: 'form-props',
      type: Object,
    });
  });

  it('has a reactive property "item"', () => {
    expect(new Control()).to.have.property('item', null);
    expect(Control).to.have.deep.nested.property('properties.item', {});
  });

  it('has a reactive property "itemProps"', () => {
    expect(new Control()).to.have.deep.property('itemProps', {});
    expect(Control).to.have.deep.nested.property('properties.itemProps', {
      type: Object,
      attribute: 'item-props',
    });
  });

  it('has a reactive property "wide"', () => {
    expect(new Control()).to.have.property('wide', false);
    expect(Control).to.have.deep.nested.property('properties.wide', { type: Boolean });
  });

  it('has a reactive property "open"', () => {
    expect(new Control()).to.have.property('open', false);
    expect(Control).to.have.deep.nested.property('properties.open', { type: Boolean });
  });

  it('has a reactive property "hideWhenEmpty"', () => {
    expect(new Control()).to.have.property('hideWhenEmpty', false);
    expect(Control).to.have.deep.nested.property('properties.hideWhenEmpty', {
      type: Boolean,
      attribute: 'hide-when-empty',
    });
  });

  it('has a reactive property "alert"', () => {
    expect(new Control()).to.have.property('alert', false);
    expect(Control).to.have.deep.nested.property('properties.alert', { type: Boolean });
  });

  it('has a reactive property "actions"', () => {
    expect(new Control()).to.have.deep.property('actions', []);
    expect(Control).to.have.deep.nested.property('properties.actions', { attribute: false });
  });

  it('has a reactive property "bulkActions"', () => {
    expect(new Control()).to.have.deep.property('bulkActions', []);
    expect(Control).to.have.deep.nested.property('properties.bulkActions', { attribute: false });
  });

  it('has a reactive property "filters"', () => {
    expect(new Control()).to.have.deep.property('filters', []);
    expect(Control).to.have.deep.nested.property('properties.filters', { type: Array });
  });

  it('has a reactive property "filter"', () => {
    expect(new Control()).to.have.deep.property('filter', null);
    expect(Control).to.have.deep.nested.property('properties.filter', {});
  });

  it('has a reactive property "extendFilter"', () => {
    expect(new Control()).to.have.property('extendFilter', null);
    expect(Control).to.have.deep.nested.property('properties.extendFilter', {
      type: Function,
      attribute: false,
    });
  });

  it('renders a form dialog if "form" is specified', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    expect(await getByTag(control, 'foxy-form-dialog')).to.not.exist;

    control.form = 'foxy-attribute-form';
    const form = await getByTag(control, 'foxy-form-dialog');

    expect(form).to.exist;
    expect(form).to.have.attribute('infer', 'dialog');
    expect(form).to.have.property('form', 'foxy-attribute-form');
    expect(form).to.have.deep.property('related', []);
    expect(form).to.not.have.attribute('keep-open-on-delete');
    expect(form).to.not.have.attribute('keep-open-on-post');
    expect(form).to.not.have.attribute('parent');
    expect(form).to.not.have.attribute('alert');
    expect(form).to.not.have.attribute('wide');

    control.keepDialogOpenOnDelete = true;
    control.keepDialogOpenOnPost = true;
    control.related = ['https://demo.api/virtual/error'];
    control.first = 'https://demo.api/virtual/stall';
    control.alert = true;
    control.wide = true;
    control.formProps = { foo: 'bar' };

    await control.requestUpdate();

    expect(form).to.have.deep.property('related', ['https://demo.api/virtual/error']);
    expect(form).to.have.deep.property('props', { foo: 'bar' });
    expect(form).to.have.attribute('keep-open-on-delete');
    expect(form).to.have.attribute('keep-open-on-post');
    expect(form).to.have.attribute('parent', 'https://demo.api/virtual/stall');
    expect(form).to.have.attribute('alert');
    expect(form).to.have.attribute('wide');
  });

  it('renders a deletion confirmation dialog if "Delete" button is visible', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.hideDeleteButton = true;
    control.readonly = false;
    expect(await getByTag(control, 'foxy-internal-confirm-dialog')).to.not.exist;

    control.hideDeleteButton = false;
    control.readonly = true;
    expect(await getByTag(control, 'foxy-internal-confirm-dialog')).to.not.exist;

    control.hideDeleteButton = false;
    control.readonly = false;
    const dialog = await getByTag(control, 'foxy-internal-confirm-dialog');

    expect(dialog).to.exist;
    expect(dialog).to.have.attribute('message', 'delete_message');
    expect(dialog).to.have.attribute('confirm', 'delete_confirm');
    expect(dialog).to.have.attribute('cancel', 'delete_cancel');
    expect(dialog).to.have.attribute('header', 'delete_header');
    expect(dialog).to.have.attribute('infer', '');
  });

  it("renders a translated label in default layout if it's defined", async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    expect(control.renderRoot).to.not.include.text('label');

    control.label = 'Test label';
    await control.requestUpdate();

    expect(control.renderRoot).to.include.text('Test label');
  });

  it('renders helper text in default layout', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    expect(control.renderRoot).to.include.text('helper_text');

    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(control.renderRoot).to.not.include.text('helper_text');
    expect(control.renderRoot).to.include.text('Test helper text');
  });

  it('renders a summary control in details layout', async () => {
    const router = createRouter();
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control
        layout="details"
        first="https://demo.api/hapi/transactions"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-list-control>
    `);

    const summary = control.renderRoot.querySelector(
      'foxy-internal-summary-control'
    ) as InternalSummaryControl;

    const collectionPage = summary.querySelector('foxy-collection-page') as CollectionPage<any>;
    await waitUntil(() => !!collectionPage.data, undefined, { timeout: 5000 });
    await control.requestUpdate();

    expect(summary).to.exist;
    expect(summary).to.have.attribute('layout', 'details');
    expect(summary).to.have.attribute('count', '2');
    expect(summary).to.not.have.attribute('open');

    control.open = true;
    await control.requestUpdate();
    expect(summary).to.have.attribute('open');
    expect(summary).to.not.have.attribute('count');

    summary.open = false;
    summary.dispatchEvent(new CustomEvent('toggle'));
    await control.requestUpdate();
    expect(control).to.have.property('open', false);
    expect(summary).to.have.attribute('count', '2');
  });

  it('visually hides itself when collection has 0 items and hideWhenEmpty is true', async () => {
    const router = createRouter();
    let control = await fixture<Control>(html`
      <foxy-internal-async-list-control
        first="https://demo.api/hapi/transactions?some_key_that_doesnt_exist=foo"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-list-control>
    `);

    let collectionPage = control.renderRoot.querySelector(
      'foxy-collection-page'
    ) as CollectionPage<any>;

    await waitUntil(() => !!collectionPage.data, undefined, { timeout: 5000 });
    await control.requestUpdate();
    let wrapper = control.shadowRoot?.firstElementChild;
    expect(wrapper).to.not.have.attribute('class', 'hidden');

    control.hideWhenEmpty = true;
    await control.requestUpdate();
    expect(wrapper).to.have.attribute('class', 'hidden');

    control = await fixture<Control>(html`
      <foxy-internal-async-list-control
        first="https://demo.api/hapi/transactions"
        hide-when-empty
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-internal-async-list-control>
    `);

    collectionPage = control.renderRoot.querySelector(
      'foxy-collection-page'
    ) as CollectionPage<any>;

    await waitUntil(() => !!collectionPage.data, undefined, { timeout: 5000 });
    await control.requestUpdate();
    wrapper = control.shadowRoot?.firstElementChild;
    expect(wrapper).to.not.have.attribute('class', 'hidden');
  });

  [undefined, 'details'].forEach(layout => {
    const layoutLabel = layout ?? 'default';

    it(`renders a pagination element for collection items in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      const pagination = await getByTag(control, 'foxy-pagination');

      expect(pagination).to.exist;
      expect(pagination).to.not.have.attribute('first');
      expect(pagination).to.have.attribute('infer', 'pagination');

      control.first = 'https://demo.api/virtual/stall';
      control.limit = 5;
      await control.requestUpdate();
      expect(pagination).to.have.attribute('first', 'https://demo.api/virtual/stall?limit=5');

      control.extendFilter = (params: URLSearchParams) => params.set('foo', 'bar');
      await control.requestUpdate();
      expect(pagination).to.have.attribute(
        'first',
        'https://demo.api/virtual/stall?limit=5&foo=bar'
      );
    });

    it(`renders a collection page under pagination in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination?.querySelector('foxy-collection-page');

      expect(page).to.exist;
      expect(page).to.have.attribute('infer', 'card');
      expect(page).to.have.deep.property('related', []);
      expect(page).to.have.deep.property('props', {});

      control.related = ['https://demo.api/virtual/stall'];
      await control.requestUpdate();
      expect(page).to.have.deep.property('related', ['https://demo.api/virtual/stall']);

      control.itemProps = { foo: 'bar' };
      await control.requestUpdate();
      expect(page).to.have.deep.property('props', { foo: 'bar' });
    });

    it(`can render collection page items as simple list items using local name in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

      const wrapper = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: null,
          next: null,
          ns: '',
        })
      );

      const item = wrapper.firstElementChild;

      expect(item).to.have.property('localName', 'foxy-attribute-card');
      expect(item).to.have.attribute('related', '["https://demo.api/virtual/stall?related"]');
      expect(item).to.have.attribute('parent', 'https://demo.api/virtual/stall?parent');
      expect(item).to.have.attribute('infer', '');
      expect(item).to.have.attribute('href', 'https://demo.api/virtual/stall?href');
    });

    it(`can render collection page items as simple list items using render function in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = () => html`<div data-testclass="item"></div>`;
      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

      const item = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: null,
          next: null,
          ns: '',
        })
      );

      expect(item).to.include.html('<div data-testclass="item"></div>');
    });

    it(`can render collection page items as links using local name in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.getPageHref = href =>
        `https://demo.api/virtual/stall?href=${encodeURIComponent(href)}`;
      control.item = 'foxy-attribute-card';
      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

      const item = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      const card = item.querySelector('foxy-attribute-card')!;
      const a = card.closest('a')!;

      expect(card).to.have.attribute('related', '["https://demo.api/virtual/stall?related"]');
      expect(card).to.have.attribute('parent', 'https://demo.api/virtual/stall?parent');
      expect(card).to.have.attribute('infer', '');
      expect(card).to.have.attribute('href', 'https://demo.api/virtual/stall?href');

      expect(a).to.have.attribute(
        'href',
        `https://demo.api/virtual/stall?href=${encodeURIComponent(
          'https://demo.api/virtual/stall?href'
        )}`
      );
    });

    it(`can render collection page items as links using render function in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.getPageHref = href =>
        `https://demo.api/virtual/stall?href=${encodeURIComponent(href)}`;
      control.item = () => html`<div data-testclass="item"></div>`;
      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

      const item = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      const a = item.querySelector('a')!;

      expect(a).to.include.html('<div data-testclass="item"></div>');
      expect(a).to.have.attribute(
        'href',
        `https://demo.api/virtual/stall?href=${encodeURIComponent(
          'https://demo.api/virtual/stall?href'
        )}`
      );
    });

    it(`can render collection page items as buttons opening a dialog using local name in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      control.form = 'foxy-attribute-form';

      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;
      const dialog = (await getByTag(control, 'foxy-form-dialog')) as FormDialog;

      const item = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      const card = item.querySelector('foxy-attribute-card')!;
      const button = card.closest('button')!;
      const showMethod = stub(dialog, 'show');

      expect(card).to.have.attribute('related', '["https://demo.api/virtual/stall?related"]');
      expect(card).to.have.attribute('parent', 'https://demo.api/virtual/stall?parent');
      expect(card).to.have.attribute('infer', '');
      expect(card).to.have.attribute('href', 'https://demo.api/virtual/stall?href');

      button.click();

      expect(showMethod).to.have.been.called;
      expect(dialog).to.have.property('header', 'header_update');
      expect(dialog).to.have.property('href', 'https://demo.api/virtual/stall?href');
    });

    it(`can render collection page items as buttons opening a dialog using render function  in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
        ></foxy-internal-async-list-control>
      `);

      control.item = () => html`<div data-testclass="item"></div>`;
      control.form = 'foxy-attribute-form';

      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;
      const dialog = (await getByTag(control, 'foxy-form-dialog')) as FormDialog;

      const item = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      const button = item.querySelector('button')!;
      expect(button).to.include.html('<div data-testclass="item"></div>');

      const showMethod = stub(dialog, 'show');
      button.click();

      expect(showMethod).to.have.been.called;
      expect(dialog).to.have.property('header', 'header_update');
      expect(dialog).to.have.property('href', 'https://demo.api/virtual/stall?href');
    });

    it(`renders Delete button for collection page items in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      control.form = 'foxy-attribute-form';

      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

      const swipeActions = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      const card = swipeActions.querySelector('foxy-attribute-card') as AttributeCard;
      const label = swipeActions.querySelector('[key="delete_button_text"]')!;
      const button = label.closest('vaadin-button')!;
      const confirm = (await getByTag(
        control,
        'foxy-internal-confirm-dialog'
      )) as InternalConfirmDialog;

      expect(swipeActions).to.have.property('localName', 'foxy-swipe-actions');
      expect(label).to.have.property('localName', 'foxy-i18n');
      expect(label).to.have.attribute('infer', '');
      expect(button).to.have.attribute('slot', 'action');

      const confirmShowMethod = stub(confirm, 'show');
      button.click();

      expect(confirmShowMethod).to.have.been.called;

      const cardDeleteMethod = stub(card, 'delete');
      confirm.dispatchEvent(new DialogHideEvent());

      expect(cardDeleteMethod).to.have.been.called;
    });

    it(`hides Delete button for collection page items if hideDeleteButton is true in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      control.form = 'foxy-attribute-form';
      control.hideDeleteButton = true;

      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

      const swipeActions = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      const selector = 'vaadin-button foxy-i18n[key="delete_button_text"]';
      expect(swipeActions.querySelector(selector)).to.not.exist;
    });

    it(`hides Delete button for collection page items when readonly in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      control.form = 'foxy-attribute-form';
      control.readonly = true;

      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

      const swipeActions = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      const selector = 'vaadin-button foxy-i18n[key="delete_button_text"]';
      expect(swipeActions.querySelector(selector)).to.not.exist;
    });

    it(`renders Create button when .form is defined in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      control.form = 'foxy-attribute-form';

      const label = (await getByKey(control, 'create_button_text'))!;
      const button = label.closest('vaadin-button')!;
      const dialog = (await getByTag(control, 'foxy-form-dialog')) as FormDialog;

      expect(label).to.have.property('localName', 'foxy-i18n');
      expect(label).to.have.attribute('infer', 'pagination');

      const dialogShowMethod = stub(dialog, 'show');
      button.click();

      expect(dialogShowMethod).to.have.been.called;
      expect(dialog).to.have.property('header', 'header_create');
      expect(dialog).to.have.property('href', '');
    });

    it(`renders Create link when .createPageHref is defined in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      control.createPageHref = 'https://example.com';

      const label = (await getByKey(control, 'create_button_text'))!;
      const a = label.closest('a')!;

      expect(label).to.have.property('localName', 'foxy-i18n');
      expect(label).to.have.attribute('infer', '');
      expect(a).to.have.attribute('href', 'https://example.com');
    });

    it(`hides Create link/button if there's no form in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      await control.requestUpdate();

      const buttonSelector = 'vaadin-button foxy-i18n[key="create_button_text"]';
      const aSelector = 'a foxy-i18n[key="create_button_text"]';

      expect(control.querySelector(buttonSelector)).to.not.exist;
      expect(control.querySelector(aSelector)).to.not.exist;
    });

    it(`hides Create link/button if control is readonly in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      control.form = 'foxy-attribute-form';
      control.readonly = true;
      await control.requestUpdate();

      const buttonSelector = 'vaadin-button foxy-i18n[key="create_button_text"]';
      const aSelector = 'a foxy-i18n[key="create_button_text"]';

      expect(control.querySelector(buttonSelector)).to.not.exist;
      expect(control.querySelector(aSelector)).to.not.exist;
    });

    it(`hides Create link/button if hideCreateButton is true in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      control.item = 'foxy-attribute-card';
      control.form = 'foxy-attribute-form';
      control.hideCreateButton = true;
      await control.requestUpdate();

      const buttonSelector = 'vaadin-button foxy-i18n[key="create_button_text"]';
      const aSelector = 'a foxy-i18n[key="create_button_text"]';

      expect(control.querySelector(buttonSelector)).to.not.exist;
      expect(control.querySelector(aSelector)).to.not.exist;
    });

    it(`renders error text if available in ${layoutLabel} layout`, async () => {
      let control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      expect(control.renderRoot).to.not.include.text('Test error message');

      control = await fixture<Control>(
        html`<x-test-control-with-error-message></x-test-control-with-error-message>`
      );
      expect(control.renderRoot).to.include.text('Test error message');
    });

    it(`renders actions if configured in ${layoutLabel} layout`, async () => {
      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          first="https://demo.api/hapi/transactions"
          limit="1"
          form="foxy-test"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-async-list-control>
      `);

      await waitUntil(
        () => !!control.renderRoot.querySelector<CollectionPage<any>>('foxy-collection-page')?.data
      );

      let actions = await getByTestClass<ButtonElement>(control, 'action');
      expect(actions).to.be.empty;

      control.actions = [
        { text: 'action_1', theme: 'primary', state: 'idle', onClick: stub() },
        { text: 'action_2', theme: 'secondary', state: 'busy', onClick: stub() },
      ];

      await control.requestUpdate();
      actions = await getByTestClass<ButtonElement>(control, 'action');

      expect(actions).to.have.length(2);

      expect(actions[0].closest('foxy-swipe-actions')).to.exist;
      expect(actions[1].closest('foxy-swipe-actions')).to.exist;
      expect(actions[0].closest('foxy-swipe-actions')).to.equal(
        actions[1].closest('foxy-swipe-actions')
      );

      expect(actions[0]).to.have.attribute('theme', 'primary');
      expect(actions[1]).to.have.attribute('theme', 'secondary');

      actions[0].click();
      expect(control.actions[0].onClick).to.have.been.calledOnce;
      expect(control.actions[1].onClick).to.not.have.been.called;

      actions[1].click();
      expect(control.actions[0].onClick).to.have.been.calledOnce;
      expect(control.actions[1].onClick).to.have.been.calledOnce;

      const action0Text = actions[0].querySelector('foxy-i18n');
      expect(action0Text).to.have.attribute('infer', '');
      expect(action0Text).to.have.attribute('key', 'action_1');

      const action1Text = actions[1].querySelector('foxy-i18n');
      expect(action1Text).to.have.attribute('infer', '');
      expect(action1Text).to.have.attribute('key', 'action_2');

      const action0Spinner = actions[0].querySelector('foxy-spinner');
      expect(action0Spinner).to.have.attribute('infer', 'spinner');
      expect(action0Spinner).to.have.attribute('state', 'idle');

      const action1Spinner = actions[1].querySelector('foxy-spinner');
      expect(action1Spinner).to.have.attribute('infer', 'spinner');
      expect(action1Spinner).to.have.attribute('state', 'busy');
    });

    it(`renders filters if configured in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control layout=${ifDefined(layout)}>
        </foxy-internal-async-list-control>
      `);

      expect(await getByKey(control, 'search_button_text')).to.not.exist;

      control.filters = [
        {
          label: 'filter_1',
          type: Type.Boolean,
          path: 'foo',
        },
      ];

      await control.requestUpdate();

      const buttonLabel = await getByKey(control, 'search_button_text');
      const button = buttonLabel?.closest('vaadin-button');
      const overlay = control.renderRoot.querySelector(
        'foxy-internal-async-list-control-filter-overlay'
      );

      expect(buttonLabel).to.exist;
      expect(buttonLabel).to.have.attribute('infer', 'pagination');

      expect(button).to.exist;
      expect(button).to.not.have.attribute('disabled');

      expect(overlay).to.exist;
      expect(overlay).to.have.property('positionTarget', button);
      expect(overlay).to.have.deep.property('model', {
        options: control.filters,
        value: '',
        lang: control.lang,
        ns: control.ns,
      });

      expect(overlay).to.not.have.attribute('opened');

      button?.click();
      await control.requestUpdate();
      expect(overlay).to.have.attribute('opened');

      overlay?.dispatchEvent(new CustomEvent('vaadin-overlay-close'));
      await control.requestUpdate();
      expect(overlay).to.not.have.attribute('opened');

      overlay?.dispatchEvent(new CustomEvent('search', { detail: 'foo=bar' }));
      await control.requestUpdate();
      expect(overlay).to.have.deep.property('model', {
        options: control.filters,
        value: 'foo=bar',
        lang: control.lang,
        ns: control.ns,
      });
    });

    it(`sets default filter if configured in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          filter="foo=bar&baz=qux"
          .filters=${[{ label: 'filter_1', type: Type.Boolean, path: 'foo' }]}
        >
        </foxy-internal-async-list-control>
      `);

      const overlay = control.renderRoot.querySelector(
        'foxy-internal-async-list-control-filter-overlay'
      );

      expect(overlay).to.have.deep.property('model', {
        options: control.filters,
        value: 'foo=bar&baz=qux',
        lang: control.lang,
        ns: control.ns,
      });
    });

    it(`emits "itemclick" event when collection page item is clicked in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          item="foxy-attribute-card"
          form="foxy-attribute-form"
        >
        </foxy-internal-async-list-control>
      `);

      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;
      const dialog = (await getByTag(control, 'foxy-form-dialog')) as FormDialog;

      const item = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      const card = item.querySelector('foxy-attribute-card')!;
      const button = card.closest('button')!;
      const showMethod = stub(dialog, 'show');

      const whenGotItemClickEvent = oneEvent(control, 'itemclick');
      button.click();
      const itemClickEvent = await whenGotItemClickEvent;

      expect(itemClickEvent).to.be.instanceOf(CustomEvent);
      expect(itemClickEvent).to.have.property('cancelable', true);
      expect(itemClickEvent).to.have.property('composed', true);
      expect(itemClickEvent).to.have.property('bubbles', true);
      expect(itemClickEvent).to.have.property('detail', 'https://demo.api/virtual/stall?href');
      expect(showMethod).to.have.been.called;
    });

    it(`does not show dialog when "itemclick" event is canceled in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          item="foxy-attribute-card"
          form="foxy-attribute-form"
        >
        </foxy-internal-async-list-control>
      `);

      const pagination = await getByTag(control, 'foxy-pagination');
      const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;
      const dialog = (await getByTag(control, 'foxy-form-dialog')) as FormDialog;

      const item = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      const card = item.querySelector('foxy-attribute-card')!;
      const button = card.closest('button')!;
      const showMethod = stub(dialog, 'show');

      control.addEventListener('itemclick', evt => evt.preventDefault());
      button.click();

      expect(showMethod).to.not.have.been.called;
    });

    it(`renders Select button when "first" and non-empty .bulkActions are defined in ${layoutLabel} layout`, async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          first="https://demo.api/hapi/customer_attributes"
          item="foxy-attribute-card"
          form="foxy-attribute-form"
        >
        </foxy-internal-async-list-control>
      `);

      expect(await getByKey(control, 'select_button_text')).to.not.exist;

      control.first = 'https://demo.api/hapi/customer_attributes';
      await control.requestUpdate();
      expect(await getByKey(control, 'select_button_text')).to.not.exist;

      control.bulkActions = [];
      await control.requestUpdate();
      expect(await getByKey(control, 'select_button_text')).to.not.exist;

      control.bulkActions = [{ name: 'foo', onClick: stub() }];
      await control.requestUpdate();

      const label = await getByKey(control, 'select_button_text');
      const button = label?.closest('vaadin-button');

      expect(label).to.exist;
      expect(button).to.exist;
      expect(label).to.have.property('localName', 'foxy-i18n');
      expect(label).to.have.attribute('infer', 'pagination');
    });

    it(`renders Cancel button when selection mode is enabled in ${layoutLabel} layout`, async () => {
      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          first="https://demo.api/hapi/customer_attributes"
          item="foxy-attribute-card"
          form="foxy-attribute-form"
          .bulkActions=${[{ name: 'foo', onClick: stub() }]}
          @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
        >
        </foxy-internal-async-list-control>
      `);

      const page = await getByTag<CollectionPage<any>>(control, 'foxy-collection-page');
      await waitUntil(() => !!page?.data, '', { timeout: 5000 });

      expect(await getByKey(control, 'select_button_text')).to.exist;
      expect(await getByKey(control, 'cancel_button_text')).to.not.exist;

      (await getByKey(control, 'select_button_text'))?.closest('vaadin-button')?.click();
      await control.requestUpdate();

      expect(await getByKey(control, 'select_button_text')).to.not.exist;
      expect(await getByKey(control, 'cancel_button_text')).to.exist;
    });

    it(`renders bulk actions when selection mode is enabled and at least one item is selected in ${layoutLabel} layout`, async () => {
      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          first="https://demo.api/hapi/customer_attributes"
          item="foxy-attribute-card"
          form="foxy-attribute-form"
          .bulkActions=${[{ name: 'foo', onClick: stub() }]}
          @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
        >
        </foxy-internal-async-list-control>
      `);

      const page = await getByTag<CollectionPage<any>>(control, 'foxy-collection-page');
      await waitUntil(() => !!page?.data, '', { timeout: 5000 });
      expect(await getByTestClass(control, 'bulk-action')).to.be.empty;

      const label = await getByKey(control, 'select_button_text');
      const button = label?.closest('vaadin-button');
      button?.click();
      await control.requestUpdate();
      const anyCheckbox = await getByTag<CheckboxElement>(control, 'vaadin-checkbox');
      expect(anyCheckbox).to.exist;
      expect(await getByTestClass(control, 'bulk-action')).to.have.length(0);

      anyCheckbox!.checked = true;
      anyCheckbox!.dispatchEvent(new CustomEvent('change'));
      await control.requestUpdate();

      const bulkActions = await getByTestClass(control, 'bulk-action');
      expect(bulkActions).to.have.length(1);

      const firstBulkAction = bulkActions[0];
      const firstBulkActionLabel = firstBulkAction.querySelector('foxy-i18n');
      expect(firstBulkActionLabel).to.have.attribute('key', 'foo_bulk_action_caption_idle');
      expect(firstBulkActionLabel).to.have.attribute('infer', 'pagination');
      expect(firstBulkActionLabel).to.have.deep.property('options', { count: 1 });
    });

    it(`renders collection items inside vaadin-checkbox elements when selection mode is enabled in ${layoutLabel} layout`, async () => {
      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          first="https://demo.api/hapi/customer_attributes"
          item="foxy-attribute-card"
          form="foxy-attribute-form"
          .bulkActions=${[{ name: 'foo', onClick: stub() }]}
          @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
        >
        </foxy-internal-async-list-control>
      `);

      const page = (await getByTag<CollectionPage<any>>(control, 'foxy-collection-page'))!;
      await waitUntil(() => !!page?.data, '', { timeout: 5000 });
      expect(await getByTestClass(control, 'vaadin-checkbox')).to.be.empty;

      const label = await getByKey(control, 'select_button_text');
      const button = label?.closest('vaadin-button');
      button?.click();
      await control.requestUpdate();

      const item = await fixture(
        (page.item as ItemRenderer<any>)({
          simplifyNsLoading: false,
          readonlyControls: BooleanSelector.False,
          disabledControls: BooleanSelector.False,
          hiddenControls: BooleanSelector.False,
          templates: {},
          readonly: false,
          disabled: false,
          previous: null,
          related: ['https://demo.api/virtual/stall?related'],
          hidden: false,
          parent: 'https://demo.api/virtual/stall?parent',
          spread: spread,
          props: {},
          group: '',
          html: html,
          lang: '',
          href: 'https://demo.api/virtual/stall?href',
          data: await getTestData('./hapi/customer_attributes/0'),
          next: null,
          ns: '',
        })
      );

      expect(item).to.have.property('localName', 'vaadin-checkbox');
      expect(item).to.not.have.attribute('checked');

      const card = item.querySelector('foxy-attribute-card')!;

      expect(card).to.have.attribute('related', '["https://demo.api/virtual/stall?related"]');
      expect(card).to.have.attribute('parent', 'https://demo.api/virtual/stall?parent');
      expect(card).to.have.attribute('infer', '');
      expect(card).to.have.attribute('href', 'https://demo.api/virtual/stall?href');
    });

    it(`can run a bulk action on selected items in ${layoutLabel} layout`, async () => {
      const onClick = stub();
      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          first="https://demo.api/hapi/customer_attributes"
          item="foxy-attribute-card"
          form="foxy-attribute-form"
          .bulkActions=${[{ name: 'foo', onClick }]}
          @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
        >
        </foxy-internal-async-list-control>
      `);

      const page = (await getByTag<CollectionPage<any>>(control, 'foxy-collection-page'))!;
      await waitUntil(() => !!page?.data, '', { timeout: 5000 });

      const label = await getByKey(control, 'select_button_text');
      const button = label?.closest('vaadin-button');
      button?.click();
      await control.requestUpdate();

      const checkbox = control.renderRoot.querySelector<CheckboxElement>('vaadin-checkbox');
      checkbox!.checked = true;
      checkbox!.dispatchEvent(new CustomEvent('change'));
      await control.requestUpdate();

      const bulkActions = await getByTestClass(control, 'bulk-action');
      const fooAction = bulkActions[0];
      fooAction.click();

      const customerAttribute0 = await getTestData('./hapi/customer_attributes/0');
      expect(onClick).to.have.been.calledWithMatch([customerAttribute0]);
    });

    it(`communicates bulk action state to the user (positive path, no errors) in ${layoutLabel} layout`, async () => {
      let next: (() => void) | null = null;
      const onClick = () => new Promise<void>(resolve => (next = resolve));

      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          first="https://demo.api/hapi/customer_attributes"
          lang="es"
          item="foxy-attribute-card"
          form="foxy-attribute-form"
          ns="test"
          .bulkActions=${[{ name: 'foo', onClick }]}
          @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
        >
        </foxy-internal-async-list-control>
      `);

      const page = (await getByTag<CollectionPage<any>>(control, 'foxy-collection-page'))!;
      await waitUntil(() => !!page?.data, '', { timeout: 5000 });

      const label = await getByKey(control, 'select_button_text');
      const button = label?.closest('vaadin-button');
      button?.click();
      await control.requestUpdate();

      const checkbox = control.renderRoot.querySelector<CheckboxElement>('vaadin-checkbox');
      checkbox!.checked = true;
      checkbox!.dispatchEvent(new CustomEvent('change'));
      await control.requestUpdate();

      const bulkActions = await getByTestClass(control, 'bulk-action');
      const fooAction = bulkActions[0];
      fooAction.click();
      await control.requestUpdate();

      expect(await getByKey(control, 'foo_bulk_action_caption_idle')).to.not.exist;
      expect(await getByKey(control, 'foo_bulk_action_caption_busy')).to.exist;
      // @ts-expect-error it's too hard for TS to figure out that `next` is not null at this point
      next?.();
      await control.requestUpdate();
      expect(await getByKey(control, 'foo_bulk_action_caption_idle')).to.not.exist;
      expect(await getByKey(control, 'foo_bulk_action_caption_busy')).to.not.exist;
      expect(await getByKey(control, 'cancel_button_text')).to.not.exist;
      expect(await getByKey(control, 'select_button_text')).to.exist;
      expect(await getByTestClass(control, 'bulk-action')).to.have.length(0);

      const notification = await getByTag<NotificationElement>(control, 'vaadin-notification');
      expect(notification).to.have.attribute('theme', 'success');
      expect(notification).to.have.property('opened', true);

      const notificationRoot = document.createElement('div');
      notification?.renderer?.(notificationRoot);

      const notificationText = notificationRoot.querySelector('foxy-i18n');
      expect(notificationText).to.have.attribute('lang', 'es');
      expect(notificationText).to.have.attribute('key', 'foo_bulk_action_notification_done');
      expect(notificationText).to.have.attribute('ns', 'test pagination');
    });

    it(`communicates bulk action state to the user (negative path, failure) in ${layoutLabel} layout`, async () => {
      let next: (() => void) | null = null;
      const onClick = () => new Promise<void>((_, reject) => (next = reject));

      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-async-list-control
          layout=${ifDefined(layout)}
          first="https://demo.api/hapi/customer_attributes"
          lang="es"
          item="foxy-attribute-card"
          form="foxy-attribute-form"
          ns="test"
          .bulkActions=${[{ name: 'foo', onClick }]}
          @fetch=${(evt: FetchEvent) => !evt.defaultPrevented && router.handleEvent(evt)}
        >
        </foxy-internal-async-list-control>
      `);

      const page = (await getByTag<CollectionPage<any>>(control, 'foxy-collection-page'))!;
      await waitUntil(() => !!page?.data, '', { timeout: 5000 });

      const label = await getByKey(control, 'select_button_text');
      const button = label?.closest('vaadin-button');
      button?.click();
      await control.requestUpdate();

      const checkbox = control.renderRoot.querySelector<CheckboxElement>('vaadin-checkbox');
      checkbox!.checked = true;
      checkbox!.dispatchEvent(new CustomEvent('change'));
      await control.requestUpdate();

      const bulkActions = await getByTestClass(control, 'bulk-action');
      const fooAction = bulkActions[0];
      fooAction.click();
      await control.requestUpdate();

      expect(await getByKey(control, 'foo_bulk_action_caption_idle')).to.not.exist;
      expect(await getByKey(control, 'foo_bulk_action_caption_busy')).to.exist;
      // @ts-expect-error it's too hard for TS to figure out that `next` is not null at this point
      next?.();
      await control.requestUpdate();
      expect(await getByKey(control, 'foo_bulk_action_caption_idle')).to.exist;
      expect(await getByKey(control, 'foo_bulk_action_caption_busy')).to.not.exist;
      expect(await getByKey(control, 'cancel_button_text')).to.exist;
      expect(await getByKey(control, 'select_button_text')).to.not.exist;
      expect(await getByTestClass(control, 'bulk-action')).to.have.length(1);

      const notification = await getByTag<NotificationElement>(control, 'vaadin-notification');
      expect(notification).to.have.attribute('theme', 'error');
      expect(notification).to.have.property('opened', true);

      const notificationRoot = document.createElement('div');
      notification?.renderer?.(notificationRoot);

      const notificationText = notificationRoot.querySelector('foxy-i18n');
      expect(notificationText).to.have.attribute('lang', 'es');
      expect(notificationText).to.have.attribute('key', 'foo_bulk_action_notification_fail');
      expect(notificationText).to.have.attribute('ns', 'test pagination');
    });
  });
});
