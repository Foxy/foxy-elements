import './index';

import { expect, fixture, html, nextFrame, oneEvent } from '@open-wc/testing';
import { spy, stub } from 'sinon';

import { API } from '@foxy.io/sdk/customer';
import { CustomerApi } from './CustomerApi';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { LitElement } from 'lit-element';
import { cookieStorage } from './cookieStorage';

describe('CustomerApi', () => {
  it('extends LitElement', () => {
    expect(new CustomerApi()).to.be.instanceOf(LitElement);
  });

  it('registers as foxy-customer-api', () => {
    expect(customElements.get('foxy-customer-api')).to.equal(CustomerApi);
  });

  it('initializes with the correct defaults', () => {
    const element = new CustomerApi();

    expect(element).to.have.property('storage', 'local');
    expect(element).to.have.property('level', 0);
    expect(element).to.have.property('base', location.origin);
  });

  it('reflects attribute values to the respective properties', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api storage="session" level="3" base="https://foxy.io/"></foxy-customer-api>
    `);

    expect(element).to.have.property('storage', 'session');
    expect(element).to.have.property('level', 3);
    expect(element).to.have.property('base', 'https://foxy.io/');
  });

  it('returns false from the .isLoggedIn getter if logged out', () => {
    expect(new CustomerApi().isLoggedIn).to.be.false;
  });

  it('returns true from the .isLoggedIn getter if logged in', () => {
    localStorage.setItem(API.SESSION, 'session stub');
    expect(new CustomerApi().isLoggedIn).to.be.true;
    localStorage.removeItem(API.SESSION);
  });

  it('returns SDK.Customer.API instance from the .api getter', () => {
    expect(new CustomerApi().api).to.be.instanceOf(API);
  });

  it('initializes SDK.Customer.API at .api with the element property values', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api level="3" base="https://foxy.io/"></foxy-customer-api>
    `);

    expect(element).to.have.nested.property('api.console.level', 3);
    expect(element).to.have.deep.nested.property('api.base', new URL('https://foxy.io/'));
  });

  it('uses session storage if storage="session"', async () => {
    const layout = html`<foxy-customer-api storage="session"></foxy-customer-api>`;
    const element = await fixture<CustomerApi>(layout);
    expect(element).to.have.nested.property('api.storage', sessionStorage);
  });

  it('uses local storage if storage="local"', async () => {
    const layout = html`<foxy-customer-api storage="local"></foxy-customer-api>`;
    const element = await fixture<CustomerApi>(layout);
    expect(element).to.have.nested.property('api.storage', localStorage);
  });

  it('uses cookie storage if storage="cookie"', async () => {
    const layout = html`<foxy-customer-api storage="cookie"></foxy-customer-api>`;
    const element = await fixture<CustomerApi>(layout);
    expect(element).to.have.nested.property('api.storage', cookieStorage);
  });

  it('ignores custom fetch events', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api>
        <div></div>
      </foxy-customer-api>
    `);

    const event = new CustomEvent('fetch', { bubbles: true, cancelable: true });
    element.firstElementChild!.dispatchEvent(event);

    expect(event).to.have.property('defaultPrevented', false);
  });

  it('ignores handled fetch events', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api><div></div></foxy-customer-api>
    `);

    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      request: new Request('/'),
      resolve: () => new Response(),
      reject: () => void 0,
    });

    const respondWithStub = stub(event, 'respondWith');
    event.preventDefault();
    element.firstElementChild!.dispatchEvent(event);

    expect(respondWithStub).not.to.have.been.called;
  });

  it('ignores fetch events dispatched directly on the element', async () => {
    const layout = html`<foxy-customer-api></foxy-customer-api>`;
    const element = await fixture<CustomerApi>(layout);
    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      request: new Request('/'),
      resolve: () => new Response(),
      reject: () => void 0,
    });

    const respondWithStub = stub(event, 'respondWith');
    element.dispatchEvent(event);
    expect(respondWithStub).not.to.have.been.called;
  });

  it('ignores fetch events handled in a parent connector', async () => {
    const element = await fixture<CustomerApi>(html`
      <div @fetch=${(evt: FetchEvent) => evt.preventDefault()}>
        <foxy-customer-api><div></div></foxy-customer-api>
      </div>
    `);

    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      request: new Request('/'),
      resolve: () => new Response(),
      reject: () => void 0,
    });

    const respondWithMethod = stub(event, 'respondWith');
    element.firstElementChild!.firstElementChild!.dispatchEvent(event);

    expect(respondWithMethod).not.to.have.been.called;
  });

  it('handles a DELETE request to the virtual foxy://customer-api/session endpoint', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api><div></div></foxy-customer-api>
    `);

    const apiSignOutMethod = stub(element.api, 'signOut');
    const resolveCallback = spy();
    const child = element.firstElementChild as HTMLDivElement;
    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      request: new Request('foxy://customer-api/session', { method: 'DELETE' }),
      resolve: resolveCallback,
      reject: spy(),
    });

    child.dispatchEvent(event);

    await oneEvent(element, 'signout');
    await nextFrame();

    expect(apiSignOutMethod).to.have.been.called;
    expect(resolveCallback).to.have.been.called;
  });

  it('handles a POST request to the virtual foxy://customer-api/session endpoint', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api><div></div></foxy-customer-api>
    `);

    const apiSignInMethod = stub(element.api, 'signIn');
    const resolveCallback = spy();
    const credential = { email: 'justice.witts@example.com', password: 'Fo0BarBAZ!1' };
    const child = element.firstElementChild as HTMLDivElement;
    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      reject: spy(),
      resolve: resolveCallback,
      request: new Request('foxy://customer-api/session', {
        method: 'POST',
        body: JSON.stringify({ type: 'password', credential }),
      }),
    });

    child.dispatchEvent(event);

    await oneEvent(element, 'signin');
    await nextFrame();

    expect(apiSignInMethod).to.have.been.calledWith(credential);
    expect(resolveCallback).to.have.been.called;
  });

  it('handles a POST request to the virtual foxy://customer-api/recover endpoint', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api><div></div></foxy-customer-api>
    `);

    const apiSendPasswordResetEmailMethod = stub(element.api, 'sendPasswordResetEmail');
    const resolveCallback = spy();
    const detail = { email: 'justice.witts@example.com', password: 'Fo0BarBAZ!1' };
    const child = element.firstElementChild as HTMLDivElement;
    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      reject: spy(),
      resolve: resolveCallback,
      request: new Request('foxy://customer-api/recover', {
        method: 'POST',
        body: JSON.stringify({ type: 'email', detail }),
      }),
    });

    child.dispatchEvent(event);
    await nextFrame();

    expect(apiSendPasswordResetEmailMethod).to.have.been.calledWith(detail);
    expect(resolveCallback).to.have.been.called;
  });

  it('makes an API request for any non-virtual endpoint', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api><div></div></foxy-customer-api>
    `);

    const apiFetchMethod = stub(element.api, 'fetch');
    const resolveCallback = spy();
    const child = element.firstElementChild as HTMLDivElement;
    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      request: new Request('https://demo.foxycart.com/s/customer/transactions'),
      resolve: resolveCallback,
      reject: spy(),
    });

    child.dispatchEvent(event);
    await nextFrame();

    expect(apiFetchMethod).to.have.been.calledWith(event.request);
    expect(resolveCallback).to.have.been.called;
  });

  it('signs out locally on HTTP 401', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api><div></div></foxy-customer-api>
    `);

    const apiStorageClearMethod = stub(element.api.storage, 'clear');
    const apiFetchMethod = stub(element.api, 'fetch').returns(
      Promise.resolve(new Response(null, { status: 401 }))
    );

    const resolveCallback = spy();
    const child = element.firstElementChild as HTMLDivElement;
    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      request: new Request('https://demo.foxycart.com/s/customer'),
      resolve: resolveCallback,
      reject: spy(),
    });

    child.dispatchEvent(event);

    await oneEvent(element, 'signout');
    await nextFrame();

    expect(apiStorageClearMethod).to.have.been.called;
    expect(resolveCallback).to.have.been.called;

    apiStorageClearMethod.restore();
    apiFetchMethod.restore();
  });

  it('returns HTTP 500 on network or SDK error', async () => {
    const element = await fixture<CustomerApi>(html`
      <foxy-customer-api><div></div></foxy-customer-api>
    `);

    const apiFetchMethod = stub(element.api, 'fetch').throws(new Error());
    const resolveCallback = spy();
    const child = element.firstElementChild as HTMLDivElement;
    const event = new FetchEvent('fetch', {
      cancelable: true,
      bubbles: true,
      request: new Request('https://demo.foxycart.com/s/customer'),
      resolve: resolveCallback,
      reject: spy(),
    });

    child.dispatchEvent(event);
    await nextFrame();

    expect(resolveCallback).to.have.been.calledWith(new Response(null, { status: 500 }));
    apiFetchMethod.restore();
  });
});
