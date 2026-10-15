import type { FetchEvent } from '../../public/NucleonElement/FetchEvent';

import './index';
import '../../public/NucleonElement/index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalCard } from './InternalCard';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { Spinner } from '../../public/Spinner/Spinner';
import { createAccessDeniedResponse } from '../../../utils/test-utils';
import { html } from 'lit-element';

class TestInternalCard extends InternalCard<any> {
  static get properties() {
    return { ...super.properties, testBody: { attribute: false } };
  }

  testBody = html``;

  renderBody() {
    return this.testBody;
  }
}

customElements.define('test-internal-card', TestInternalCard);

describe('InternalCard', () => {
  it('imports and defines foxy-spinner', () => {
    expect(customElements.get('foxy-spinner')).to.equal(Spinner);
  });

  it('imports and defines itself as foxy-internal-card', () => {
    expect(customElements.get('foxy-internal-card')).to.equal(InternalCard);
  });

  it('extends NucleonElement', () => {
    expect(new InternalCard()).to.be.instanceOf(NucleonElement);
  });

  it('renders "empty" foxy-spinner by default', async () => {
    const layout = html`<test-internal-card></test-internal-card>`;
    const element = await fixture<TestInternalCard>(layout);
    const spinner = element.renderRoot.querySelector('foxy-spinner');
    const wrapper = spinner!.parentElement;

    expect(wrapper).not.to.have.class('opacity-0');
    expect(spinner).to.have.attribute('state', 'empty');
    expect(spinner).to.have.attribute('infer', 'spinner');
  });

  it('renders "busy" foxy-spinner while loading', async () => {
    const router = createRouter();
    const element = await fixture<TestInternalCard>(html`
      <test-internal-card
        href="https://demo.api/virtual/stall"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </test-internal-card>
    `);

    const spinner = element.renderRoot.querySelector('foxy-spinner');
    const wrapper = spinner!.parentElement;

    expect(wrapper).not.to.have.class('opacity-0');
    expect(spinner).to.have.attribute('state', 'busy');
    expect(spinner).to.have.attribute('infer', 'spinner');
  });

  it('renders "error" foxy-spinner if loading fails', async () => {
    const router = createRouter();
    const element = await fixture<TestInternalCard>(html`
      <test-internal-card
        href="https://demo.api/virtual/empty?status=500"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </test-internal-card>
    `);

    const spinner = element.renderRoot.querySelector('foxy-spinner');
    const wrapper = spinner!.parentElement;

    await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

    expect(wrapper).not.to.have.class('opacity-0');
    expect(spinner).to.have.attribute('state', 'error');
    expect(spinner).to.have.attribute('infer', 'spinner');
  });

  it('hides the spinner once loaded', async () => {
    const router = createRouter();
    const element = await fixture<TestInternalCard>(html`
      <test-internal-card
        href="https://demo.api/hapi/customers/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </test-internal-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }));
    const spinner = element.renderRoot.querySelector('foxy-spinner');

    expect(spinner!.parentElement).to.have.class('opacity-0');
  });

  it('renders the output of "renderBody" at all times', async () => {
    const layout = html`<test-internal-card></test-internal-card>`;
    const element = await fixture<TestInternalCard>(layout);

    element.testBody = html`<div id="test-body"></div>`;
    await element.requestUpdate();

    expect(element.renderRoot.querySelector('#test-body')).to.exist;
  });

  describe('helper loaders', () => {
    const renderWithHelper = async (respond: (evt: FetchEvent) => void) => {
      const element = await fixture<TestInternalCard>(
        html`<test-internal-card></test-internal-card>`
      );

      element.testBody = html`
        <foxy-nucleon
          class="hidden"
          infer=""
          href="https://demo.api/hapi/customers/0"
          @fetch=${respond}
          @update=${() => element.requestUpdate()}
        >
        </foxy-nucleon>
      `;

      await element.requestUpdate();
      const helper = element.renderRoot.querySelector('foxy-nucleon') as NucleonElement<any>;
      await waitUntil(() => helper.in('fail'), undefined, { timeout: 5000 });
      await element.updateComplete;
      return element;
    };

    it('renders "error" foxy-spinner with access-denied type when a helper is denied', async () => {
      const element = await renderWithHelper(evt =>
        evt.respondWith(Promise.resolve(createAccessDeniedResponse()))
      );

      const spinner = element.renderRoot.querySelector('foxy-spinner');
      expect(spinner!.parentElement).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('error-type', 'access-denied');
    });

    it('renders "error" foxy-spinner with generic type when a helper fails otherwise', async () => {
      const element = await renderWithHelper(evt =>
        evt.respondWith(Promise.resolve(new Response(null, { status: 500 })))
      );

      const spinner = element.renderRoot.querySelector('foxy-spinner');
      expect(spinner!.parentElement).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('error-type', 'generic');
    });
  });

  it('shows access-denied spinner when a write is denied', async () => {
    const router = createRouter();
    const element = await fixture<TestInternalCard>(html`
      <test-internal-card
        href="https://demo.api/hapi/customers/0"
        @fetch=${(evt: FetchEvent) =>
          evt.request.method === 'DELETE'
            ? evt.respondWith(Promise.resolve(createAccessDeniedResponse('write')))
            : router.handleEvent(evt)}
      >
      </test-internal-card>
    `);

    await waitUntil(() => element.in({ idle: 'snapshot' }), undefined, { timeout: 5000 });
    element.delete();
    await waitUntil(() => element.errors.includes('error:access_denied'), undefined, {
      timeout: 5000,
    });
    await element.updateComplete;

    const spinner = element.renderRoot.querySelector('foxy-spinner');
    expect(element.in('idle')).to.be.true;
    expect(spinner!.parentElement).not.to.have.class('opacity-0');
    expect(spinner).to.have.attribute('state', 'error');
    expect(spinner).to.have.attribute('error-type', 'access-denied');
  });
});
