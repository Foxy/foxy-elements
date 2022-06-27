import type { FetchEvent } from '../../public/NucleonElement/FetchEvent';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { InternalCard } from './InternalCard';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { createRouter } from '../../../server/index';
import { Spinner } from '../../public/Spinner/Spinner';
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
    await element.updateComplete;

    expect(element.renderRoot.querySelector('#test-body')).to.exist;
  });
});
