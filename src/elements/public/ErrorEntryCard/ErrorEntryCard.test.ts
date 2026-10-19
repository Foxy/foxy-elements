import './index';

import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { ErrorEntryCard } from './ErrorEntryCard';
import { createRouter } from '../../../server/index';
import { FetchEvent } from '../NucleonElement/FetchEvent';

const router = createRouter();

describe('ErrorEntryCard', async () => {
  it('passes accessibility test', async () => {
    const element = await fixture(html`
      <foxy-error-entry-card href="https://demo.api/hapi/error_entries/0"></foxy-error-entry-card>
    `);

    await expect(element).to.be.accessible();
  });

  it('displays only a spinner when loading without data', async () => {
    const element = await fixture(html`<foxy-error-entry-card></foxy-error-entry-card>`);
    const spinner = element.shadowRoot?.querySelector('[data-testid="spinner"]');
    const details = element.shadowRoot?.querySelector('details');

    expect(element.shadowRoot).to.exist;
    expect(spinner).to.exist;
    expect(spinner?.getAttribute('state')).to.equal('empty');
    expect(details).not.to.exist;
  });

  it('displays a spinner on top of the element when loading with data', async () => {
    const layout = html`
      <foxy-error-entry-card href="https://demo.api/hapi/error_entries/0"> </foxy-error-entry-card>
    `;

    const element = await fixture(layout);
    const spinner = element.shadowRoot?.querySelector('[data-testid="spinner"]');

    expect(spinner).to.exist;
    expect(spinner?.getAttribute('state')).to.equal('busy');
  });

  it("displays a spinner error if data can't be loaded", async () => {
    const layout = html`
      <foxy-error-entry-card
        href="https://demo.api/virtual/empty?status=404"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-error-entry-card>
    `;

    const element = await fixture(layout);
    const spinner = element.shadowRoot?.querySelector('[data-testid="spinner"]');

    await oneEvent(element, 'update');
    expect(spinner?.getAttribute('state')).to.equal('error');
  });

  it('displays a summary when closed', async () => {
    const element = await fixture(html`
      <foxy-error-entry-card
        href="https://demo.api/hapi/error_entries/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-error-entry-card>
    `);

    await oneEvent(element, 'update');

    expect(element.shadowRoot?.querySelector('[key="date"]')).to.exist;
    expect(element.shadowRoot?.querySelector('[key="time"]')).to.exist;
    expect(element.shadowRoot?.querySelector('p')).to.exist;
    expect(element.shadowRoot?.querySelector('details')?.getAttribute('open')).not.to.exist;
  });

  it('displays full content when opened', async () => {
    const element = await fixture(
      html`
        <foxy-error-entry-card
          href="https://demo.api/hapi/error_entries/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-error-entry-card>
      `
    );

    element.setAttribute('open', 'true');
    await oneEvent(element, 'update');

    expect(element.shadowRoot?.querySelector('[key="date"]')).to.exist;
    expect(element.shadowRoot?.querySelector('[key="time"]')).to.exist;
    expect(element.shadowRoot?.querySelector('p')).to.exist;
    expect(element.shadowRoot?.querySelector('[key="client"]')).to.be.visible;
    expect(element.shadowRoot?.querySelector('[key="request"]')).to.be.visible;
  });
  describe('current user scope', () => {
    const create = async (scope: string | null) => {
      const router = createRouter();
      const methods: string[] = [];
      const element = await fixture<ErrorEntryCard>(html`
        <foxy-error-entry-card
          href="https://demo.api/hapi/error_entries/0"
          .currentUserScope=${scope}
          @fetch=${(evt: FetchEvent) => {
            methods.push(evt.request.method);
            router.handleEvent(evt);
          }}
        >
        </foxy-error-entry-card>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
      return { element, methods };
    };

    const open = async (element: ErrorEntryCard) => {
      const details = element.renderRoot.querySelector('details')!;
      details.open = true;
      await oneEvent(details, 'toggle');
      await element.requestUpdate();
    };

    it('keeps selectors unchanged without a scope and with store_full_access', async () => {
      const { element } = await create(null);

      [null, '', 'store_full_access'].forEach(scope => {
        element.currentUserScope = scope;
        expect(element.hiddenSelector.toString()).to.equal('');
        expect(element.readonlySelector.toString()).to.equal('');
      });
    });

    it('is read-only with reporting_read', async () => {
      const { element } = await create('webhooks_read reporting_read');
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;

      element.currentUserScope = 'reporting_write';
      expect(element.readonlySelector.matches('any-control', true)).to.be.false;
    });

    it('marks the error as seen on open without a scope or with reporting_write', async () => {
      for (const scope of [null, 'reporting_write']) {
        const { element, methods } = await create(scope);
        await open(element);
        await waitUntil(() => element.in({ idle: 'snapshot' }), '', { timeout: 5000 });
        expect(methods).to.include('PATCH');
        expect(element.data).to.have.property('hide_error', true);
      }
    });

    it('does not mark the error as seen on open with reporting_read', async () => {
      const { element, methods } = await create('webhooks_read reporting_read');
      await open(element);
      // A PATCH would start on toggle, so wait for it to settle before checking it did not happen.
      await waitUntil(() => element.in('idle'), '', { timeout: 5000 });

      expect(methods).to.not.include('PATCH');
      expect(element.data).to.have.property('hide_error', false);
      expect(element.open).to.be.true;
    });
  });
});
