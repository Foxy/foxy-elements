import { expect, fixture, oneEvent, waitUntil } from '@open-wc/testing';
import { InternalTransactionPostActionControl } from './index';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html } from 'lit-html';
import { createRouter } from '../../../../../server/index';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';
import { DialogHideEvent } from '../../../../private/Dialog/DialogHideEvent';

describe('Transaction', () => {
  describe('InternalTransactionPostActionControl', () => {
    it('imports and defines vaadin-button', () => {
      expect(customElements.get('vaadin-button')).to.exist;
    });

    it('imports and defines foxy-internal-confirm-dialog', () => {
      expect(customElements.get('foxy-internal-confirm-dialog')).to.exist;
    });

    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('imports and defines itself as foxy-internal-transaction-post-action-control', () => {
      expect(customElements.get('foxy-internal-transaction-post-action-control')).to.equal(
        InternalTransactionPostActionControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalTransactionPostActionControl()).to.be.instanceOf(InternalControl);
    });

    it('has a reactive property "theme" (String, null by default)', () => {
      expect(new InternalTransactionPostActionControl()).to.have.property('theme', null);
      expect(InternalTransactionPostActionControl).to.have.nested.property(
        'properties.theme.type',
        String
      );
    });

    it('has a reactive property "href" (String, null by default)', () => {
      expect(new InternalTransactionPostActionControl()).to.have.property('href', null);
      expect(InternalTransactionPostActionControl).to.have.nested.property(
        'properties.href.type',
        String
      );
    });

    it('renders confirm dialog', async () => {
      const control = await fixture<InternalTransactionPostActionControl>(html`
        <foxy-internal-transaction-post-action-control infer="foo">
        </foxy-internal-transaction-post-action-control>
      `);

      const dialog = control.renderRoot.querySelector('foxy-internal-confirm-dialog');

      expect(dialog).to.exist;
      expect(dialog).to.have.property('header', 'header');
      expect(dialog).to.have.property('infer', 'confirm');
    });

    it('sends a POST request to .href on confirmation', async () => {
      const control = await fixture<InternalTransactionPostActionControl>(html`
        <foxy-internal-transaction-post-action-control
          infer="foo"
          href="https://demo.api/virtual/empty"
        >
        </foxy-internal-transaction-post-action-control>
      `);

      const dialog = control.renderRoot.querySelector('foxy-internal-confirm-dialog')!;
      const whenGotEvent = oneEvent(control, 'fetch');

      dialog.dispatchEvent(new DialogHideEvent(false));
      const event = await whenGotEvent;

      expect(event).to.be.instanceOf(FetchEvent);
      expect(event).to.have.nested.property('request.url', 'https://demo.api/virtual/empty');
      expect(event).to.have.nested.property('request.method', 'POST');
    });

    it('renders themed action button with translatable label', async () => {
      const control = await fixture<InternalTransactionPostActionControl>(html`
        <foxy-internal-transaction-post-action-control infer="foo" theme="error">
        </foxy-internal-transaction-post-action-control>
      `);

      const button = control.renderRoot.querySelector('vaadin-button')!;
      const label = button.querySelector('foxy-i18n')!;

      expect(button).to.exist;
      expect(button).to.not.have.attribute('disabled');
      expect(button).to.have.property('theme', 'error tertiary-inline');

      expect(label).to.exist;
      expect(label).to.have.property('infer', '');
      expect(label).to.have.property('key', 'idle');
    });

    it('disables the button and changes its label when sending data', async () => {
      const router = createRouter();
      const control = await fixture<InternalTransactionPostActionControl>(html`
        <foxy-internal-transaction-post-action-control
          infer="foo"
          href="https://demo.api/virtual/stall"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-transaction-post-action-control>
      `);

      const dialog = control.renderRoot.querySelector('foxy-internal-confirm-dialog')!;
      dialog.dispatchEvent(new DialogHideEvent(false));
      await control.requestUpdate();

      const button = control.renderRoot.querySelector('vaadin-button')!;
      const label = button.querySelector('foxy-i18n')!;

      expect(button).to.have.attribute('disabled');
      expect(label).to.have.property('key', 'busy');
    });

    it('dispatches "done" event when POST succeeds', async () => {
      const router = createRouter();
      const control = await fixture<InternalTransactionPostActionControl>(html`
        <foxy-internal-transaction-post-action-control
          infer="foo"
          href="https://demo.api/virtual/empty?status=200"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-transaction-post-action-control>
      `);

      const dialog = control.renderRoot.querySelector('foxy-internal-confirm-dialog')!;
      const whenGotEvent = oneEvent(control, 'done');

      dialog.dispatchEvent(new DialogHideEvent(false));
      expect(await whenGotEvent).to.exist;
    });

    it('switches back to idle display when POST succeeds', async () => {
      const router = createRouter();
      const control = await fixture<InternalTransactionPostActionControl>(html`
        <foxy-internal-transaction-post-action-control
          infer="foo"
          href="https://demo.api/virtual/empty?status=200"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-transaction-post-action-control>
      `);

      const dialog = control.renderRoot.querySelector('foxy-internal-confirm-dialog')!;
      const whenGotEvent = oneEvent(control, 'done');

      dialog.dispatchEvent(new DialogHideEvent(false));
      await whenGotEvent;

      const button = control.renderRoot.querySelector('vaadin-button')!;
      const label = button.querySelector('foxy-i18n')!;

      expect(button).to.not.have.attribute('disabled');
      expect(label).to.have.property('key', 'idle');
    });

    it('switches to error display when POST fails', async () => {
      const router = createRouter();
      const control = await fixture<InternalTransactionPostActionControl>(html`
        <foxy-internal-transaction-post-action-control
          infer="foo"
          href="https://demo.api/virtual/empty?status=500"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-transaction-post-action-control>
      `);

      const dialog = control.renderRoot.querySelector('foxy-internal-confirm-dialog')!;
      const button = control.renderRoot.querySelector('vaadin-button')!;
      const label = button.querySelector('foxy-i18n')!;

      dialog.dispatchEvent(new DialogHideEvent(false));
      // @ts-expect-error accessing private property for testing purposes
      await waitUntil(() => control.__state === 'fail', undefined, { timeout: 5000 });
      await control.requestUpdate();

      expect(button).to.not.have.attribute('disabled');
      expect(label).to.have.property('key', 'fail');
    });

    it('disables the action button when the control is disabled', async () => {
      const control = await fixture<InternalTransactionPostActionControl>(html`
        <foxy-internal-transaction-post-action-control disabled>
        </foxy-internal-transaction-post-action-control>
      `);

      const button = control.renderRoot.querySelector('vaadin-button')!;
      expect(button).to.have.attribute('disabled');
    });
  });
});
