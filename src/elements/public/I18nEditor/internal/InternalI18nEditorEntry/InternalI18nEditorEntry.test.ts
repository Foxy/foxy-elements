import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import './index';

import { InternalI18nEditorEntry as Entry } from '../../internal/InternalI18nEditorEntry/InternalI18nEditorEntry';
import { html, expect, fixture, waitUntil } from '@open-wc/testing';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { createRouter } from '../../../../../server/index';
import { getByTag } from '../../../../../testgen/getByTag';
import { I18n } from '../../../I18n/I18n';
import { stub } from 'sinon';
import { getByKey } from '../../../../../testgen/getByKey';

describe('I18nEditor', () => {
  describe('InternalI18nEditorEntry', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('imports and defines vaadin-button', () => {
      const element = customElements.get('vaadin-button');
      expect(element).to.exist;
    });

    it('imports and defines iron-icon', () => {
      const element = customElements.get('iron-icon');
      expect(element).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      const element = customElements.get('foxy-i18n');
      expect(element).to.equal(I18n);
    });

    it('imports and defines itself as foxy-internal-i18n-editor-entry', () => {
      const element = customElements.get('foxy-internal-i18n-editor-entry');
      expect(element).to.equal(Entry);
    });

    it('extends NucleonElement', () => {
      expect(new Entry()).to.be.instanceOf(NucleonElement);
    });

    it('has an empty default i18n namespace', () => {
      expect(Entry).to.have.property('defaultNS', '');
      expect(new Entry()).to.have.property('ns', '');
    });

    it('has a reactive public property "defaultValue"', () => {
      expect(new Entry()).to.have.property('defaultValue', null);
      expect(Entry).to.have.nested.property('properties.defaultValue');
      expect(Entry).to.not.have.nested.property('properties.defaultValue.type');
      expect(Entry).to.have.nested.property('properties.defaultValue.attribute', 'default-value');
    });

    it('has a reactive public property "gateway"', () => {
      expect(new Entry()).to.have.property('gateway', null);
      expect(Entry).to.have.nested.property('properties.gateway');
      expect(Entry).to.not.have.nested.property('properties.gateway.type');
      expect(Entry).to.not.have.nested.property('properties.gateway.attribute');
    });

    it('has a reactive public property "code"', () => {
      expect(new Entry()).to.have.property('code', null);
      expect(Entry).to.have.nested.property('properties.code');
      expect(Entry).to.not.have.nested.property('properties.code.type');
      expect(Entry).to.not.have.nested.property('properties.code.attribute');
    });

    it('renders a language string code in template state when provided', async () => {
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry code="foo_bar"></foxy-internal-i18n-editor-entry>
      `);

      expect(entry.renderRoot).to.include.text('foo_bar');
    });

    it('renders a language string code from resource in snapshot state', async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/language_overrides/0', {
          method: 'PATCH',
          body: JSON.stringify({ code: 'foo_bar' }),
        })
      )?.handlerPromise;

      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry
          href="https://demo.api/hapi/language_overrides/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-i18n-editor-entry>
      `);

      await waitUntil(() => !!entry.data, '', { timeout: 5000 });

      expect(entry.renderRoot).to.include.text('foo_bar');
    });

    it('renders a textarea with the default value in template state when provided', async () => {
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry default-value="Test 101"></foxy-internal-i18n-editor-entry>
      `);

      const textarea = await getByTag(entry, 'textarea');

      expect(textarea).to.exist;
      expect(textarea).to.have.property('value', 'Test 101');
    });

    it('renders a textarea with the custom value from resource in snapshot state', async () => {
      const router = createRouter();

      await router.handleRequest(
        new Request('https://demo.api/hapi/language_overrides/0', {
          method: 'PATCH',
          body: JSON.stringify({ custom_value: 'Aaa Bbb' }),
        })
      )?.handlerPromise;

      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry
          href="https://demo.api/hapi/language_overrides/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-i18n-editor-entry>
      `);

      await waitUntil(() => !!entry.data, '', { timeout: 5000 });
      const textarea = await getByTag(entry, 'textarea');

      expect(textarea).to.exist;
      expect(textarea).to.have.property('value', 'Aaa Bbb');

      entry.edit({ custom_value: 'Ccc Ddd' });
      await entry.updateComplete;

      expect(textarea).to.have.property('value', 'Ccc Ddd');
    });

    it('disables textarea when the entire entry element is disabled', async () => {
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry></foxy-internal-i18n-editor-entry>
      `);

      const textarea = await getByTag(entry, 'textarea');
      expect(textarea).to.not.have.attribute('disabled');

      entry.disabled = true;
      await entry.updateComplete;
      expect(textarea).to.have.attribute('disabled');
    });

    it('disables textarea while loading data', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-internal-i18n-editor-entry>
      `);

      const textarea = await getByTag(entry, 'textarea');
      expect(textarea).to.not.have.attribute('disabled');

      entry.href = 'https://demo.api/virtual/stall';
      await entry.updateComplete;
      expect(textarea).to.have.attribute('disabled');
    });

    it('makes textarea readonly when the entire entry element is readonly', async () => {
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry></foxy-internal-i18n-editor-entry>
      `);

      const textarea = await getByTag(entry, 'textarea');
      expect(textarea).to.not.have.attribute('readonly');

      entry.readonly = true;
      await entry.updateComplete;
      expect(textarea).to.have.attribute('readonly');
    });

    it('writes to form data on textarea input', async () => {
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry gateway="foo" code="bar"></foxy-internal-i18n-editor-entry>
      `);

      const textarea = (await getByTag(entry, 'textarea')) as HTMLTextAreaElement;
      textarea.value = 'test';
      textarea.dispatchEvent(new InputEvent('input'));

      expect(entry).to.have.nested.property('form.custom_value', 'test');
      expect(entry).to.have.nested.property('form.gateway', 'foo');
      expect(entry).to.have.nested.property('form.code', 'bar');
    });

    it('renders a Delete button in snapshot state', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-internal-i18n-editor-entry>
      `);

      expect(entry.renderRoot.querySelector('[title="delete_button_title"]')).to.not.exist;

      entry.href = 'https://demo.api/hapi/language_overrides/0';
      await waitUntil(() => !!entry.data, '', { timeout: 5000 });
      const button = entry.renderRoot.querySelector(
        '[title="delete_button_title"]'
      ) as HTMLButtonElement;

      expect(button).to.exist;
      expect(button).to.be.instanceOf(HTMLButtonElement);

      const deleteMethod = stub(entry, 'delete');
      button.click();

      expect(deleteMethod).to.have.been.called;
    });

    it('disables the Delete button if the entire entry is disabled', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry
          href="https://demo.api/hapi/language_overrides/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-i18n-editor-entry>
      `);

      await waitUntil(() => !!entry.data, '', { timeout: 5000 });
      const button = entry.renderRoot.querySelector(
        '[title="delete_button_title"]'
      ) as HTMLButtonElement;

      expect(button).to.not.have.attribute('disabled');

      entry.disabled = true;
      await entry.updateComplete;

      expect(button).to.have.attribute('disabled');
    });

    it('disables the Delete button if the entire entry is readonly', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry
          href="https://demo.api/hapi/language_overrides/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-i18n-editor-entry>
      `);

      await waitUntil(() => !!entry.data, '', { timeout: 5000 });
      const button = entry.renderRoot.querySelector(
        '[title="delete_button_title"]'
      ) as HTMLButtonElement;

      expect(button).to.not.have.attribute('disabled');

      entry.readonly = true;
      await entry.updateComplete;

      expect(button).to.have.attribute('disabled');
    });

    it('renders the Undo button', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-internal-i18n-editor-entry>
      `);

      const label = (await getByKey(entry, 'undo_button')) as I18n;
      const button = label.closest('vaadin-button')!;

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', '');
      expect(button).to.exist;

      const undoMethod = stub(entry, 'undo');
      button.click();

      expect(undoMethod).to.have.been.called;
    });

    it('disables the Undo button when the entire entry is disabled', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-internal-i18n-editor-entry>
      `);

      const label = (await getByKey(entry, 'undo_button')) as I18n;
      const button = label.closest('vaadin-button')!;

      expect(button).to.not.have.attribute('disabled');

      entry.disabled = true;
      await entry.updateComplete;

      expect(button).to.have.attribute('disabled');
    });

    it('disables the Undo button when the entire entry is readonly', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-internal-i18n-editor-entry>
      `);

      const label = (await getByKey(entry, 'undo_button')) as I18n;
      const button = label.closest('vaadin-button')!;

      expect(button).to.not.have.attribute('disabled');

      entry.readonly = true;
      await entry.updateComplete;

      expect(button).to.have.attribute('disabled');
    });

    it('disables the Undo button in busy state', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry></foxy-internal-i18n-editor-entry>
      `);

      const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
      const stallFetch = (evt: FetchEvent) => evt.respondWith(new Promise(() => void 0));

      entry.addEventListener('fetch', handleFetch as (evt: Event) => unknown);
      entry.href = 'https://demo.api/hapi/language_overrides/0';
      await waitUntil(() => !!entry.data, '', { timeout: 5000 });

      const label = (await getByKey(entry, 'undo_button')) as I18n;
      const button = label.closest('vaadin-button')!;

      expect(button).to.not.have.attribute('disabled');

      entry.removeEventListener('fetch', handleFetch as (evt: Event) => unknown);
      entry.addEventListener('fetch', stallFetch as (evt: Event) => unknown);
      entry.delete();
      await entry.updateComplete;

      expect(button).to.have.attribute('disabled');
    });

    it('renders the Submit button', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-internal-i18n-editor-entry>
      `);

      const label = (await getByKey(entry, 'save_button')) as I18n;
      const button = label.closest('vaadin-button')!;

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', '');
      expect(button).to.exist;

      const submitMethod = stub(entry, 'submit');
      button.click();

      expect(submitMethod).to.have.been.called;
    });

    it('disables the Submit button when the entire entry is disabled', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-internal-i18n-editor-entry>
      `);

      const label = (await getByKey(entry, 'save_button')) as I18n;
      const button = label.closest('vaadin-button')!;

      expect(button).to.not.have.attribute('disabled');

      entry.disabled = true;
      await entry.updateComplete;

      expect(button).to.have.attribute('disabled');
    });

    it('disables the Submit button when the entire entry is readonly', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        </foxy-internal-i18n-editor-entry>
      `);

      const label = (await getByKey(entry, 'save_button')) as I18n;
      const button = label.closest('vaadin-button')!;

      expect(button).to.not.have.attribute('disabled');

      entry.readonly = true;
      await entry.updateComplete;

      expect(button).to.have.attribute('disabled');
    });

    it('disables the Submit button in busy state', async () => {
      const router = createRouter();
      const entry = await fixture<Entry>(html`
        <foxy-internal-i18n-editor-entry></foxy-internal-i18n-editor-entry>
      `);

      const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
      const stallFetch = (evt: FetchEvent) => evt.respondWith(new Promise(() => void 0));

      entry.addEventListener('fetch', handleFetch as (evt: Event) => unknown);
      entry.href = 'https://demo.api/hapi/language_overrides/0';
      await waitUntil(() => !!entry.data, '', { timeout: 5000 });

      const label = (await getByKey(entry, 'save_button')) as I18n;
      const button = label.closest('vaadin-button')!;

      expect(button).to.not.have.attribute('disabled');

      entry.removeEventListener('fetch', handleFetch as (evt: Event) => unknown);
      entry.addEventListener('fetch', stallFetch as (evt: Event) => unknown);
      entry.delete();
      await entry.updateComplete;

      expect(button).to.have.attribute('disabled');
    });
  });
});
