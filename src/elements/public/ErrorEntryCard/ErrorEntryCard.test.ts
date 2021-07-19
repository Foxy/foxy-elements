import './index';

import { expect, fixture, html, oneEvent } from '@open-wc/testing';

import { FetchEvent } from '../NucleonElement/FetchEvent';
import { router } from '../../../server/admin/index';

describe('ErrorEntryCard', async () => {
  it('passes accessibility test', async () => {
    const element = await fixture(html`
      <foxy-error-entry-card href="https://demo.foxycart.com/s/admin/error_entries/0">
      </foxy-error-entry-card>
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
      <foxy-error-entry-card href="https://demo.foxycart.com/s/admin/error_entries/0">
      </foxy-error-entry-card>
    `;

    const element = await fixture(layout);
    const spinner = element.shadowRoot?.querySelector('[data-testid="spinner"]');

    expect(spinner).to.exist;
    expect(spinner?.getAttribute('state')).to.equal('busy');
  });

  it("displays a spinner error if data can't be loaded", async () => {
    const layout = html`
      <foxy-error-entry-card
        href="https://demo.foxycart.com/s/admin/not-found"
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
        href="https://demo.foxycart.com/s/admin/error_entries/0"
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
          href="https://demo.foxycart.com/s/admin/error_entries/0"
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
    expect(element.shadowRoot?.querySelector('[key="transaction"]')).to.be.visible;
    expect(element.shadowRoot?.querySelector('[key="request"]')).to.be.visible;
  });
});
