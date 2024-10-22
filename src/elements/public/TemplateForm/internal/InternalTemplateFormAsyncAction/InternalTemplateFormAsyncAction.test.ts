import type { I18n } from '../../../I18n/I18n';

import './index';

import { InternalTemplateFormAsyncAction as Control } from './InternalTemplateFormAsyncAction';
import { expect, fixture, oneEvent, waitUntil } from '@open-wc/testing';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { createRouter } from '../../../../../server/index';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';
import { html } from 'lit-html';

describe('TemplateForm', () => {
  describe('InternalTemplateFormAsyncAction', () => {
    it('imports and defines vaadin-button', () => {
      expect(customElements.get('vaadin-button')).to.exist;
    });

    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('imports and defines itself as foxy-internal-template-form-async-action', () => {
      expect(customElements.get('foxy-internal-template-form-async-action')).to.equal(Control);
    });

    it('extends InternalControl', () => {
      expect(new Control()).to.be.instanceOf(InternalControl);
    });

    it('has a reactive property "theme" (String, null by default)', () => {
      expect(new Control()).to.have.property('theme', null);
      expect(Control).to.have.nested.property('properties.theme.type', String);
    });

    it('has a reactive property "href" (String, null by default)', () => {
      expect(new Control()).to.have.property('href', null);
      expect(Control).to.have.nested.property('properties.href.type', String);
    });

    it('renders themed action button with translatable label', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-template-form-async-action infer="foo" theme="error">
        </foxy-internal-template-form-async-action>
      `);

      const button = control.renderRoot.querySelector('vaadin-button')!;
      const label = button.querySelector('foxy-i18n')!;

      expect(button).to.exist;
      expect(button).to.not.have.attribute('disabled');
      expect(button).to.have.property('theme', 'error');

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');
      expect(label).to.have.property('key', 'idle');
    });

    it('sends a POST request to .href on click', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-template-form-async-action infer="foo" href="https://demo.api/virtual/empty">
        </foxy-internal-template-form-async-action>
      `);

      const button = control.renderRoot.querySelector('vaadin-button')!;
      const whenGotEvent = oneEvent(control, 'fetch');

      button.click();
      const event = await whenGotEvent;

      expect(event).to.be.instanceOf(FetchEvent);
      expect(event).to.have.nested.property('request.url', 'https://demo.api/virtual/empty');
      expect(event).to.have.nested.property('request.method', 'POST');
    });

    it('disables the button and changes its label when sending data', async () => {
      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-template-form-async-action
          infer="foo"
          href="https://demo.api/virtual/stall"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-template-form-async-action>
      `);

      const button = control.renderRoot.querySelector('vaadin-button')!;
      const label = button.querySelector('foxy-i18n')!;

      button.click();
      await control.requestUpdate();

      expect(button).to.have.attribute('disabled');
      expect(label).to.have.property('key', 'busy');
    });

    it('switches back to idle display when POST succeeds', async () => {
      let fetchCount = 0;

      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-template-form-async-action
          infer="foo"
          href="https://demo.api/virtual/empty?status=200"
          @fetch=${(evt: FetchEvent) => {
            fetchCount++;
            router.handleEvent(evt)?.handlerPromise;
          }}
        >
        </foxy-internal-template-form-async-action>
      `);

      const button = control.renderRoot.querySelector('vaadin-button')!;
      const label = button.querySelector<I18n>('foxy-i18n')!;

      fetchCount = 0;
      button.click();
      await waitUntil(() => fetchCount >= 1, undefined, { timeout: 5000 });
      await waitUntil(
        () => {
          control.requestUpdate();
          return label.key === 'idle';
        },
        undefined,
        { timeout: 5000 }
      );

      await control.requestUpdate();
      expect(button).to.not.have.attribute('disabled');
      expect(label).to.have.property('key', 'idle');
    });

    it('switches to error display when POST fails', async () => {
      let fetchCount = 0;

      const router = createRouter();
      const control = await fixture<Control>(html`
        <foxy-internal-template-form-async-action
          infer="foo"
          href="https://demo.api/virtual/empty?status=500"
          @fetch=${(evt: FetchEvent) => {
            fetchCount++;
            router.handleEvent(evt)?.handlerPromise;
          }}
        >
        </foxy-internal-template-form-async-action>
      `);

      const button = control.renderRoot.querySelector('vaadin-button')!;
      const label = button.querySelector<I18n>('foxy-i18n')!;

      fetchCount = 0;
      button.click();
      await waitUntil(() => fetchCount >= 1, undefined, { timeout: 5000 });
      await waitUntil(
        () => {
          control.requestUpdate();
          return label.key === 'fail';
        },
        undefined,
        { timeout: 5000 }
      );

      await control.requestUpdate();
      expect(button).to.not.have.attribute('disabled');
      expect(label).to.have.property('key', 'fail');
    });

    it('disables the action button when the control is disabled', async () => {
      const control = await fixture<Control>(html`
        <foxy-internal-template-form-async-action disabled>
        </foxy-internal-template-form-async-action>
      `);

      const button = control.renderRoot.querySelector('vaadin-button')!;
      expect(button).to.have.attribute('disabled');
    });
  });
});
