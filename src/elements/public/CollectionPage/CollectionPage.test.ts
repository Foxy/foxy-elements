import './index';
import '../CustomerCard/index';

import { Data as Attribute } from '../AttributeCard/types';
import { CollectionPage } from './CollectionPage';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import { FetchEvent } from '../NucleonElement/FetchEvent';

type Refs = {
  items: HTMLElement[];
};

type Data = {
  _links: Record<'self' | 'first' | 'prev' | 'next' | 'last', { href: string }>;
  _embedded: { 'fx:attributes': Attribute[] };
};

describe('CollectionPage', () => {
  generateTests<Data, CollectionPage<Data>, Refs>({
    parent: 'https://demo.api/hapi/attributes',
    href: 'https://demo.api/hapi/attributes',
    tag: 'foxy-collection-page',
    isEmptyValid: true,
    maxTestsPerState: 5,
    assertions: {
      idle: {
        async test({ refs, element }) {
          await testItemProperty(refs, element);
        },

        async template({ refs, element }) {
          const lastItem = refs.items[refs.items.length - 1];

          expect(lastItem).to.have.property('simplifyNsLoading', element.simplifyNsLoading);

          expect(lastItem).to.have.attribute('href', '');
          expect(lastItem).to.have.attribute('lang', element.lang);
          expect(lastItem).to.have.attribute('group', element.group);
          expect(lastItem).to.have.attribute('parent', element.href);
        },
      },

      async fail({ refs, element }) {
        const lastItem = refs.items[refs.items.length - 1];

        expect(lastItem).to.have.property('simplifyNsLoading', element.simplifyNsLoading);

        expect(lastItem).to.have.attribute('href', 'foxy://collection-page/fail');
        expect(lastItem).to.have.attribute('lang', element.lang);
        expect(lastItem).to.have.attribute('group', element.group);
        expect(lastItem).to.have.attribute('parent', element.href);

        await testItemProperty(refs, element);
      },

      async busy({ refs, element }) {
        const lastItem = refs.items[refs.items.length - 1];

        expect(lastItem).to.have.property('simplifyNsLoading', element.simplifyNsLoading);

        expect(lastItem).to.have.attribute('href', 'foxy://collection-page/stall');
        expect(lastItem).to.have.attribute('lang', element.lang);
        expect(lastItem).to.have.attribute('group', element.group);
        expect(lastItem).to.have.attribute('parent', element.href);

        await testItemProperty(refs, element);
      },
    },
  });

  // Dispatches a `foxy://collection-page/fail` request from inside the page, the way
  // a child card does, and resolves with whatever the page answers.
  const probeFailResponse = async (element: CollectionPage<any>): Promise<Response> => {
    const child = element.firstElementChild as HTMLElement;
    expect(child, 'page rendered at least one item to dispatch from').to.exist;

    return new Promise<Response>((resolve, reject) => {
      child.dispatchEvent(
        new FetchEvent('fetch', {
          cancelable: true,
          composed: true,
          bubbles: true,
          request: new Request('foxy://collection-page/fail'),
          resolve,
          reject,
        })
      );
    });
  };

  it('answers foxy://collection-page/fail with the recorded failure', async () => {
    const body = JSON.stringify({
      total: 1,
      _embedded: {
        'fx:errors': [
          {
            logref: 'id-1',
            message:
              'The current authenticated user does not appear to have read permission for customer resource.',
          },
        ],
      },
    });

    const element = await fixture<CollectionPage<any>>(html`
      <foxy-collection-page item="foxy-customer-card"></foxy-collection-page>
    `);

    element.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      if (event.request.url.startsWith('foxy://')) return;
      event.respondWith(Promise.resolve(new Response(body, { status: 401 })));
    });

    element.href = 'https://demo.api/hapi/customers';
    await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
    await element.updateComplete;

    const response = await probeFailResponse(element);

    expect(response).to.have.property('status', 401);
    expect((await response.json())._embedded['fx:errors'][0].message).to.contain(
      'does not appear to have read permission'
    );
  });

  it('clones the failure so two independent probes can each read its body', async () => {
    // This pins the invariant that makes `.clone()` necessary, not a regression test for
    // the fix itself: the old hardcoded `new Response(null, { status: 500 })` also handed
    // out a fresh Response per call, so this test would pass against the pre-fix code too.
    // Its job is to fail loudly if a future refactor hoists `failure.clone()` out of
    // `__failRequest` into a single shared value reused across calls (e.g.
    // `const forwarded = failure.clone()` computed once), which would let the first
    // reader consume the body and starve the second.
    const body = JSON.stringify({
      total: 1,
      _embedded: {
        'fx:errors': [
          {
            logref: 'id-1',
            message:
              'The current authenticated user does not appear to have read permission for customer resource.',
          },
        ],
      },
    });

    const element = await fixture<CollectionPage<any>>(html`
      <foxy-collection-page item="foxy-customer-card"></foxy-collection-page>
    `);

    element.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      if (event.request.url.startsWith('foxy://')) return;
      event.respondWith(Promise.resolve(new Response(body, { status: 401 })));
    });

    element.href = 'https://demo.api/hapi/customers';
    await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
    await element.updateComplete;

    const [firstResponse, secondResponse] = await Promise.all([
      probeFailResponse(element),
      probeFailResponse(element),
    ]);

    const [firstJson, secondJson] = await Promise.all([
      firstResponse.json(),
      secondResponse.json(),
    ]);

    expect(firstJson._embedded['fx:errors'][0].message).to.contain(
      'does not appear to have read permission'
    );
    expect(secondJson._embedded['fx:errors'][0].message).to.contain(
      'does not appear to have read permission'
    );
  });

  it('forwards a non-scope failure unchanged', async () => {
    const element = await fixture<CollectionPage<any>>(html`
      <foxy-collection-page item="foxy-customer-card"></foxy-collection-page>
    `);

    element.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      if (event.request.url.startsWith('foxy://')) return;
      event.respondWith(Promise.resolve(new Response(null, { status: 500 })));
    });

    element.href = 'https://demo.api/hapi/customers';
    await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
    await element.updateComplete;

    // this.failure is the recorded 500 here (not null), so this exercises the
    // `failure.clone()` branch, not the null fallback. A 500 has no fx:errors,
    // so the forwarded status is simply the original one.
    const response = await probeFailResponse(element);
    expect(response).to.have.property('status', 500);
  });

  it('falls back to a 500 when no failure has been recorded', async () => {
    // No `href` is ever set, so the page never fetches and `this.failure` stays
    // null. This exercises the `new Response(null, { status: 500 })` fallback,
    // not the `failure.clone()` branch.
    const element = await fixture<CollectionPage<any>>(html`
      <foxy-collection-page item="foxy-customer-card"></foxy-collection-page>
    `);

    expect(element.failure).to.be.null;

    const response = await probeFailResponse(element);
    expect(response).to.have.property('status', 500);
  });

  it('propagates access-denied status to a rendered child card (end-to-end)', async () => {
    const body = JSON.stringify({
      total: 1,
      _embedded: {
        'fx:errors': [
          {
            logref: 'id-1',
            message:
              'The current authenticated user does not appear to have read permission for customer resource.',
          },
        ],
      },
    });

    const element = await fixture<CollectionPage<any>>(html`
      <foxy-collection-page item="foxy-customer-card"></foxy-collection-page>
    `);

    element.addEventListener('fetch', (evt: Event) => {
      const event = evt as FetchEvent;
      if (event.request.url.startsWith('foxy://')) return;
      event.respondWith(Promise.resolve(new Response(body, { status: 401 })));
    });

    element.href = 'https://demo.api/hapi/customers';
    await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
    await element.updateComplete;

    const child = element.firstElementChild as HTMLElement & { accessDenied: boolean };
    expect(child, 'page rendered a child card in the fail state').to.exist;

    await waitUntil(() => child.accessDenied === true, undefined, { timeout: 5000 });
    expect(child.accessDenied).to.equal(true);
  });
});

async function testItemProperty(refs: Refs, element: CollectionPage<Data>) {
  const items = element.form?._embedded?.['fx:attributes'] ?? [];
  let itemElements = refs.items;

  items.forEach((item, index) => {
    expect(itemElements[index]).to.have.property('simplifyNsLoading', element.simplifyNsLoading);

    expect(itemElements[index]).to.have.attribute('href', item._links.self.href);
    expect(itemElements[index]).to.have.attribute('lang', element.lang);
    expect(itemElements[index]).to.have.attribute('group', element.group);
    expect(itemElements[index]).to.have.attribute('parent', element.href);
  });

  element.item = ctx => ctx.html`
    <foxy-foo
      .data=${ctx.data}
      href=${ctx.href}
      lang=${ctx.lang}
      group=${ctx.group}
      parent=${ctx.parent}
      data-testclass="items"
    >
    </foxy-foo>
  `;

  await element.requestUpdate();

  itemElements = Array.from(
    element.renderRoot.querySelectorAll('[data-testclass="items"]')
  ) as HTMLElement[];

  items.forEach((item, index) => {
    expect(itemElements[index]).to.have.property('simplifyNsLoading', element.simplifyNsLoading);
    expect(itemElements[index]).to.have.property('localName', 'foxy-foo');
    expect(itemElements[index]).to.have.property('data', item);

    expect(itemElements[index]).to.have.attribute('href', item._links.self.href);
    expect(itemElements[index]).to.have.attribute('lang', element.lang);
    expect(itemElements[index]).to.have.attribute('group', element.group);
    expect(itemElements[index]).to.have.attribute('parent', element.href);
  });

  element.item = 'foxy-bar';
  await element.requestUpdate();

  itemElements = Array.from(
    element.renderRoot.querySelectorAll('[data-testclass="items"]')
  ) as HTMLElement[];

  items.forEach((item, index) => {
    expect(itemElements[index]).to.have.property('simplifyNsLoading', element.simplifyNsLoading);
    expect(itemElements[index]).to.have.property('localName', 'foxy-bar');

    expect(itemElements[index]).to.have.attribute('href', item._links.self.href);
    expect(itemElements[index]).to.have.attribute('lang', element.lang);
    expect(itemElements[index]).to.have.attribute('group', element.group);
    expect(itemElements[index]).to.have.attribute('parent', element.href);
  });
}
