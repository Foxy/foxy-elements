import type { AttributeCard } from '../../public/AttributeCard/AttributeCard';
import type { ItemRenderer } from '../../public/CollectionPage/CollectionPage';

import '../../public/AttributeCard/index';
import '../../public/AttributeForm/index';
import './index';

import { InternalAsyncListControl as Control } from './InternalAsyncListControl';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { InternalConfirmDialog } from '../InternalConfirmDialog/InternalConfirmDialog';
import { expect, fixture } from '@open-wc/testing';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { CollectionPage } from '../../public/CollectionPage/CollectionPage';
import { SwipeActions } from '../../public/SwipeActions/SwipeActions';
import { getTestData } from '../../../testgen/getTestData';
import { FormDialog } from '../../public/FormDialog/FormDialog';
import { Pagination } from '../../public/Pagination/Pagination';
import { getByTag } from '../../../testgen/getByTag';
import { getByKey } from '../../../testgen/getByKey';
import { spread } from '@open-wc/lit-helpers';
import { I18n } from '../../public/I18n/I18n';
import { html } from 'lit-html';
import { stub } from 'sinon';

describe('InternalAsyncListControl', () => {
  it('imports and defines vaadin-button', () => {
    const element = customElements.get('vaadin-button');
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

  it('has a reactive property "alert"', () => {
    expect(new Control()).to.have.property('alert', false);
    expect(Control).to.have.deep.nested.property('properties.alert', { type: Boolean });
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

    await control.requestUpdate();

    expect(form).to.have.deep.property('related', ['https://demo.api/virtual/error']);
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

  it("renders a translated label if it's defined", async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    expect(control.renderRoot).to.not.include.text('label');

    control.label = 'Test label';
    await control.requestUpdate();

    expect(control.renderRoot).to.include.text('Test label');
  });

  it('renders a pagination element for collection items', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    const pagination = await getByTag(control, 'foxy-pagination');

    expect(pagination).to.exist;
    expect(pagination).to.not.have.attribute('first');
    expect(pagination).to.have.attribute('infer', 'pagination');

    control.first = 'https://demo.api/virtual/stall';
    control.limit = 5;
    await control.requestUpdate();

    expect(pagination).to.have.attribute('first', 'https://demo.api/virtual/stall?limit=5');
  });

  it('renders a collection page under pagination', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
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

  it('can render collection page items as simple list items using local name', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.item = 'foxy-attribute-card';
    const pagination = await getByTag(control, 'foxy-pagination');
    const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

    const item = await fixture(
      (page.item as ItemRenderer<any>)({
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

    expect(item).to.have.property('localName', 'foxy-attribute-card');
    expect(item).to.have.attribute('related', '["https://demo.api/virtual/stall?related"]');
    expect(item).to.have.attribute('parent', 'https://demo.api/virtual/stall?parent');
    expect(item).to.have.attribute('infer', '');
    expect(item).to.have.attribute('href', 'https://demo.api/virtual/stall?href');
  });

  it('can render collection page items as simple list items using render function', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.item = () => html`<div data-testclass="item"></div>`;
    const pagination = await getByTag(control, 'foxy-pagination');
    const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

    const item = await fixture(
      (page.item as ItemRenderer<any>)({
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

  it('can render collection page items as links using local name', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.getPageHref = href => `https://demo.api/virtual/stall?href=${encodeURIComponent(href)}`;
    control.item = 'foxy-attribute-card';
    const pagination = await getByTag(control, 'foxy-pagination');
    const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

    const item = await fixture(
      (page.item as ItemRenderer<any>)({
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

  it('can render collection page items as links using render function', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.getPageHref = href => `https://demo.api/virtual/stall?href=${encodeURIComponent(href)}`;
    control.item = () => html`<div data-testclass="item"></div>`;
    const pagination = await getByTag(control, 'foxy-pagination');
    const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

    const item = await fixture(
      (page.item as ItemRenderer<any>)({
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

  it('can render collection page items as buttons opening a dialog using local name', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.item = 'foxy-attribute-card';
    control.form = 'foxy-attribute-form';

    const pagination = await getByTag(control, 'foxy-pagination');
    const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;
    const dialog = (await getByTag(control, 'foxy-form-dialog')) as FormDialog;

    const item = await fixture(
      (page.item as ItemRenderer<any>)({
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

  it('can render collection page items as buttons opening a dialog using render function', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.item = () => html`<div data-testclass="item"></div>`;
    control.form = 'foxy-attribute-form';

    const pagination = await getByTag(control, 'foxy-pagination');
    const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;
    const dialog = (await getByTag(control, 'foxy-form-dialog')) as FormDialog;

    const item = await fixture(
      (page.item as ItemRenderer<any>)({
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

  it('renders Delete button for collection page items', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.item = 'foxy-attribute-card';
    control.form = 'foxy-attribute-form';

    const pagination = await getByTag(control, 'foxy-pagination');
    const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

    const swipeActions = await fixture(
      (page.item as ItemRenderer<any>)({
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

  it('hides delete button for collection page items if hideDeleteButton is true', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.item = 'foxy-attribute-card';
    control.form = 'foxy-attribute-form';
    control.hideDeleteButton = true;

    const pagination = await getByTag(control, 'foxy-pagination');
    const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

    const swipeActions = await fixture(
      (page.item as ItemRenderer<any>)({
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

  it('hides delete button for collection page items when readonly', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.item = 'foxy-attribute-card';
    control.form = 'foxy-attribute-form';
    control.readonly = true;

    const pagination = await getByTag(control, 'foxy-pagination');
    const page = pagination!.querySelector('foxy-collection-page') as CollectionPage<any>;

    const swipeActions = await fixture(
      (page.item as ItemRenderer<any>)({
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

  it('renders Create button when .form is defined', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
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

  it('renders Create link when .createPageHref is defined', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.item = 'foxy-attribute-card';
    control.createPageHref = 'https://example.com';

    const label = (await getByKey(control, 'create_button_text'))!;
    const a = label.closest('a')!;

    expect(label).to.have.property('localName', 'foxy-i18n');
    expect(label).to.have.attribute('infer', '');
    expect(a).to.have.attribute('href', 'https://example.com');
  });

  it("hides Create link/button if there's no form", async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
    `);

    control.item = 'foxy-attribute-card';
    await control.requestUpdate();

    const buttonSelector = 'vaadin-button foxy-i18n[key="create_button_text"]';
    const aSelector = 'a foxy-i18n[key="create_button_text"]';

    expect(control.querySelector(buttonSelector)).to.not.exist;
    expect(control.querySelector(aSelector)).to.not.exist;
  });

  it('hides Create link/button if control is readonly', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
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

  it('hides Create link/button if hideCreateButton is true', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-async-list-control></foxy-internal-async-list-control>
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
});
