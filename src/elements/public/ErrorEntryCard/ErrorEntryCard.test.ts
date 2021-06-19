import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { router } from '../../../server/admin';
import './index';

it('Passes accessibility test', async function () {
  const el = await fixture(html`
    <foxy-error-entry-card
      href="https://demo.foxycart.com/s/admin/error_entries/0"
    ></foxy-error-entry-card>
  `);
  await expect(el).to.be.accessible();
});

describe('States', async function () {
  it('displays only a spinner when loading without data', async function () {
    const el = await fixture(html`<foxy-error-entry-card></foxy-error-entry-card>`);
    expect(el.shadowRoot).to.exist;
    const spinner = el.shadowRoot?.querySelector('[data-testid="spinner"]');
    expect(spinner).to.exist;
    expect(spinner?.getAttribute('state')).to.equal('error');
    const details = el.shadowRoot?.querySelector('details');
    expect(details).not.to.exist;
  });

  it('displays a spinner on top of the element when loading with data', async function () {
    const el = await fixture(
      html` <foxy-error-entry-card href="https://demo.foxycart.com/s/admin/error_entries/0">
      </foxy-error-entry-card>`
    );
    const spinner = el.shadowRoot?.querySelector('[data-testid="spinner"]');
    expect(spinner).to.exist;
    expect(spinner?.getAttribute('state')).to.equal('busy');
  });

  it("displays a spinner error if data can't be loaded", async function () {
    const el = await fixture(
      html` <foxy-error-entry-card
        href="https://demo.foxycart.com/s/admin/not-found"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-error-entry-card>`
    );
    const spinner = el.shadowRoot?.querySelector('[data-testid="spinner"]');
    await oneEvent(el, 'update');
    expect(spinner?.getAttribute('state')).to.equal('error');
  });

  it('displays a summary when closed.', async function () {
    const el = await fixture(
      html` <foxy-error-entry-card
        href="https://demo.foxycart.com/s/admin/error_entries/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-error-entry-card>`
    );
    await oneEvent(el, 'update');
    expect(el.shadowRoot?.querySelector('[key="date"]')).to.exist;
    expect(el.shadowRoot?.querySelector('[key="time"]')).to.exist;
    expect(el.shadowRoot?.querySelector('p')).to.exist;
    expect(el.shadowRoot?.querySelector('details')?.getAttribute('open')).not.to.exist;
  });

  it('displays full content when opened.', async function () {
    const el = await fixture(
      html` <foxy-error-entry-card
        href="https://demo.foxycart.com/s/admin/error_entries/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-error-entry-card>`
    );
    el.setAttribute('open', 'true');
    await oneEvent(el, 'update');
    expect(el.shadowRoot?.querySelector('[key="date"]')).to.exist;
    expect(el.shadowRoot?.querySelector('[key="time"]')).to.exist;
    expect(el.shadowRoot?.querySelector('p')).to.exist;
    expect(el.shadowRoot?.querySelector('[key="customer"]')).to.be.visible;
    expect(el.shadowRoot?.querySelector('[key="client"]')).to.be.visible;
    expect(el.shadowRoot?.querySelector('[key="transaction"]')).to.be.visible;
    expect(el.shadowRoot?.querySelector('[key="request"]')).to.be.visible;
  });
});
