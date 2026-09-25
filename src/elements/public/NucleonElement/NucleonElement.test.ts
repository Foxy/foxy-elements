import type { FetchEvent } from './FetchEvent';

import { expect, fixture, waitUntil } from '@open-wc/testing';
import { NucleonElement } from './NucleonElement';
import { generateTests } from './generateTests';
import { createRouter } from '../../../server/hapi';
import { html } from 'lit-html';
import { spy } from 'sinon';

customElements.define('foxy-nucleon-test', NucleonElement);

describe('NucleonElement', () => {
  generateTests({
    tag: 'foxy-nucleon-test',
    href: 'https://demo.api/hapi/customer_attributes/0',
    parent: 'https://demo.api/hapi/customer_attributes',
    isEmptyValid: true,
    maxTestsPerState: 5,
  });

  it('serves virtual resource from GET foxy://[virtualHost]/form/path/to/object', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/customer_portal_settings/0', {
        method: 'PATCH',
        body: JSON.stringify({
          signUp: {
            enabled: true,
            verification: {
              secretKey: '',
              siteKey: '',
              type: 'hcaptcha',
            },
          },
        }),
      })
    )?.handlerPromise;

    const wrapper = await fixture(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-nucleon-test href="https://demo.api/hapi/customer_portal_settings/0">
          <foxy-nucleon-test></foxy-nucleon-test>
        </foxy-nucleon-test>
      </div>
    `);

    const element = wrapper.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!element.data);

    const child = element.firstElementChild as NucleonElement<any>;
    child.href = `foxy://${element.virtualHost}/form/signUp`;
    await waitUntil(() => !!child.data);

    expect(child).to.have.deep.property('data', {
      _links: { self: { href: `foxy://${element.virtualHost}/form/signUp` } },
      enabled: true,
      verification: {
        secretKey: '',
        siteKey: '',
        type: 'hcaptcha',
      },
    });
  });

  it('serves virtual collection from GET foxy://[virtualHost]/form/path/to/array', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/customer_portal_settings/0', {
        method: 'PATCH',
        body: JSON.stringify({
          subscriptions: {
            allowFrequencyModification: [{ jsonataQuery: '*', values: ['1w'] }],
            allowNextDateModification: false,
          },
        }),
      })
    )?.handlerPromise;

    const wrapper = await fixture(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-nucleon-test href="https://demo.api/hapi/customer_portal_settings/0">
          <foxy-nucleon-test></foxy-nucleon-test>
        </foxy-nucleon-test>
      </div>
    `);

    const element = wrapper.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!element.data);

    const child = element.firstElementChild as NucleonElement<any>;
    child.href = `foxy://${element.virtualHost}/form/subscriptions/allowFrequencyModification`;
    await waitUntil(() => !!child.data);

    expect(child).to.have.deep.property('data', {
      _embedded: {
        'fx:slice': [
          {
            _links: {
              self: {
                href: `foxy://${element.virtualHost}/form/subscriptions/allowFrequencyModification/0`,
              },
            },
            jsonataQuery: '*',
            values: ['1w'],
          },
        ],
      },
      _links: {
        first: {
          href: `foxy://${element.virtualHost}/form/subscriptions/allowFrequencyModification?offset=0&limit=20`,
        },
        last: {
          href: `foxy://${element.virtualHost}/form/subscriptions/allowFrequencyModification?offset=0&limit=20`,
        },
        next: {
          href: `foxy://${element.virtualHost}/form/subscriptions/allowFrequencyModification?offset=1&limit=20`,
        },
        prev: {
          href: `foxy://${element.virtualHost}/form/subscriptions/allowFrequencyModification?offset=0&limit=20`,
        },
        self: {
          href: `foxy://${element.virtualHost}/form/subscriptions/allowFrequencyModification`,
        },
      },
      limit: 20,
      offset: 0,
      returned_items: 1,
      total_items: 1,
    });
  });

  it('supports PATCH to virtual resource at foxy://[virtualHost]/form/path/to/object', async () => {
    const router = createRouter();
    const wrapper = await fixture(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-nucleon-test href="https://demo.api/hapi/customer_portal_settings/0">
          <foxy-nucleon-test></foxy-nucleon-test>
        </foxy-nucleon-test>
      </div>
    `);

    const element = wrapper.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!element.data);

    element.edit({
      signUp: {
        enabled: false,
        verification: { secretKey: '', siteKey: '', type: 'hcaptcha' },
      },
    });

    const child = element.firstElementChild as NucleonElement<any>;
    child.href = `foxy://${element.virtualHost}/form/signUp`;
    await waitUntil(() => !!child.data);

    child.edit({ enabled: true });
    child.submit();
    await waitUntil(() => child.in('idle'));

    expect(element).to.have.nested.property('form.signUp.enabled', true);
  });

  it('supports DELETE to virtual resource at foxy://[virtualHost]/form/path/to/object (nested only)', async () => {
    const router = createRouter();
    const wrapper = await fixture(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-nucleon-test href="https://demo.api/hapi/customer_portal_settings/0">
          <foxy-nucleon-test></foxy-nucleon-test>
        </foxy-nucleon-test>
      </div>
    `);

    const element = wrapper.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!element.data);

    element.edit({
      signUp: {
        enabled: false,
        verification: { secretKey: '', siteKey: '', type: 'hcaptcha' },
      },
    });

    const child = element.firstElementChild as NucleonElement<any>;
    child.href = `foxy://${element.virtualHost}/form/signUp/verification`;
    await waitUntil(() => !!child.data);

    child.delete();
    await waitUntil(() => child.in('idle'));

    expect(element).to.not.have.nested.property('form.signUp.verification');
  });

  it('supports POST to virtual collection at foxy://[virtualHost]/form/path/to/array', async () => {
    const router = createRouter();

    await router.handleRequest(
      new Request('https://demo.api/hapi/customer_portal_settings/0', {
        method: 'PATCH',
        body: JSON.stringify({
          subscriptions: {
            allowFrequencyModification: [],
            allowNextDateModification: false,
          },
        }),
      })
    )?.handlerPromise;

    const wrapper = await fixture(html`
      <div @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}>
        <foxy-nucleon-test href="https://demo.api/hapi/customer_portal_settings/0">
          <foxy-nucleon-test></foxy-nucleon-test>
        </foxy-nucleon-test>
      </div>
    `);

    const element = wrapper.firstElementChild as NucleonElement<any>;
    await waitUntil(() => !!element.data);

    const child = element.firstElementChild as NucleonElement<any>;
    child.parent = `foxy://${element.virtualHost}/form/subscriptions/allowFrequencyModification`;
    child.edit({ jsonataQuery: '*', values: ['1w'] });
    child.submit();
    await waitUntil(() => child.in('idle'));

    expect(element).to.have.deep.nested.property('form.subscriptions.allowFrequencyModification', [
      { jsonataQuery: '*', values: ['1w'] },
    ]);
  });

  it('calls .reportValidity() on submit() by default', () => {
    const nucleon = new NucleonElement();
    const reportValidity = spy(nucleon, 'reportValidity');
    nucleon.submit();
    expect(reportValidity).to.have.been.calledOnce;
    expect(reportValidity).to.have.been.calledWithExactly();
  });

  it('skips .reportValidity() call when calling submit(false)', () => {
    const nucleon = new NucleonElement();
    const reportValidity = spy(nucleon, 'reportValidity');
    nucleon.submit(false);
    expect(reportValidity).to.have.not.been.called;
  });

  describe('accessDenied', () => {
    const SCOPE_DENIAL_BODY = JSON.stringify({
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

    const respondWith = (element: HTMLElement, response: () => Response) => {
      element.addEventListener('fetch', (evt: Event) => {
        const event = evt as FetchEvent;
        event.respondWith(Promise.resolve(response()));
      });
    };

    it('is false before any request', async () => {
      const element = await fixture<NucleonElement<any>>(
        html`<foxy-nucleon-test></foxy-nucleon-test>`
      );

      expect(element).to.have.property('accessDenied', false);
    });

    it('is true after a scope-denied request', async () => {
      const element = await fixture<NucleonElement<any>>(
        html`<foxy-nucleon-test></foxy-nucleon-test>`
      );

      respondWith(element, () => new Response(SCOPE_DENIAL_BODY, { status: 401 }));
      element.href = 'https://demo.api/hapi/customers/0';

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
      expect(element).to.have.property('accessDenied', true);
    });

    it('is false after a generic server error', async () => {
      const element = await fixture<NucleonElement<any>>(
        html`<foxy-nucleon-test></foxy-nucleon-test>`
      );

      respondWith(element, () => new Response(null, { status: 500 }));
      element.href = 'https://demo.api/hapi/customers/0';

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
      expect(element).to.have.property('accessDenied', false);
    });

    it('is false after an expired-token 401', async () => {
      const body = JSON.stringify({ error: 'invalid_token', error_description: 'expired' });
      const element = await fixture<NucleonElement<any>>(
        html`<foxy-nucleon-test></foxy-nucleon-test>`
      );

      respondWith(element, () => new Response(body, { status: 401 }));
      element.href = 'https://demo.api/hapi/customers/0';

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
      expect(element).to.have.property('accessDenied', false);
    });

    it('clears when a later request fails for a different reason', async () => {
      let denied = true;
      const element = await fixture<NucleonElement<any>>(
        html`<foxy-nucleon-test></foxy-nucleon-test>`
      );

      respondWith(element, () =>
        denied
          ? new Response(SCOPE_DENIAL_BODY, { status: 401 })
          : new Response(null, { status: 500 })
      );

      element.href = 'https://demo.api/hapi/customers/0';
      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
      expect(element).to.have.property('accessDenied', true);

      const deniedFailure = element.failure;

      denied = false;
      element.refresh();

      // Both failures leave the machine in `fail`, so waiting on state is useless —
      // wait for the failure object itself to change.
      await waitUntil(() => !!element.failure && element.failure !== deniedFailure, undefined, {
        timeout: 5000,
      });

      expect(element).to.have.property('accessDenied', false);
    });

    it('clears once a later request succeeds', async () => {
      let denied = true;
      const element = await fixture<NucleonElement<any>>(
        html`<foxy-nucleon-test></foxy-nucleon-test>`
      );

      respondWith(element, () =>
        denied
          ? new Response(SCOPE_DENIAL_BODY, { status: 401 })
          : new Response(
              JSON.stringify({ _links: { self: { href: 'https://demo.api/hapi/customers/0' } } }),
              {
                status: 200,
              }
            )
      );

      element.href = 'https://demo.api/hapi/customers/0';
      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });
      expect(element).to.have.property('accessDenied', true);

      denied = false;
      element.refresh();

      await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
      expect(element).to.have.property('accessDenied', false);
    });
  });
});
