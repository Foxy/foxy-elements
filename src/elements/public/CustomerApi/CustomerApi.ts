import type { StoredSession } from '@foxy.io/sdk/dist/types/customer/types';

import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '@foxy.io/sdk/customer';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { cookieStorage } from './cookieStorage';
import { InferrableMixin } from '../../../mixins/inferrable';

/**
 * Element connector for Customer API.
 *
 * @fires CustomerApi#signout - Instance of `CustomerApi.SignOutEvent`. Dispatched on an element when session expires or code 401 is returned.
 * @fires CustomerApi#signin - Instance of `CustomerApi.SignInEvent`. Dispatched on an element once authenticated.
 * @fires CustomerApi#signup - Instance of `CustomerApi.SignUpEvent`. Dispatched on an element once a customer is created (since v1.24.0).
 *
 * @element foxy-customer-api
 * @since 1.4.0
 */
export class CustomerApi extends ConfigurableMixin(InferrableMixin(LitElement)) {
  static readonly SignOutEvent = class extends CustomEvent<void> {};

  static readonly SignInEvent = class extends CustomEvent<{ forcePasswordReset: boolean }> {};

  static readonly SignUpEvent = class extends CustomEvent<void> {};

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      storage: { type: String, noAccessor: true },
      level: { type: Number, noAccessor: true },
      base: { type: String, noAccessor: true },
    };
  }

  private __storage: 'session' | 'cookie' | 'local' = 'local';

  private __level = 0;

  private __base = location.origin;

  private __api: API = this.__createAPIInstance();

  private __handleFetch = async (originalEvent: Event) => {
    if (!(originalEvent instanceof FetchEvent)) return;
    if (originalEvent.defaultPrevented) return;
    if (originalEvent.composedPath()[0] === this) return;

    originalEvent.preventDefault();

    const apiEvent = new FetchEvent('fetch', {
      cancelable: true,
      composed: true,
      request: originalEvent.request,
      bubbles: true,
      reject: (reason: unknown) => originalEvent.respondWith(Promise.reject(reason)),
      resolve: (response: Response) => {
        if (apiEvent.request.url === 'foxy://customer-api/session') this.requestUpdate();
        if (response.status === 401) this.requestUpdate();
        originalEvent.respondWith(Promise.resolve(response));
      },
    });

    if (this.dispatchEvent(apiEvent)) apiEvent.respondWith(this.__handleRequest(apiEvent.request));
  };

  get isLoggedIn(): boolean {
    return !!this.api.storage.getItem(API.SESSION);
  }

  /** `FoxySDK.Customer.API` instance used by this element to communicate with the backend. */
  get api(): API {
    return this.__api;
  }

  /** Bookmark URL for this API. This is where the tree traversal begins. We also use this URL as a base for relative paths. */
  get base(): string {
    return this.__base;
  }

  set base(value: string) {
    this.__base = value;
    this.__api = this.__createAPIInstance();
  }

  /** Numeric Consola log level. If omitted, Consola defaults will be used. */
  get level(): number {
    return this.__level;
  }

  set level(value: number) {
    this.__level = value;
    this.__api = this.__createAPIInstance();
  }

  /** Credentials storage implementing Web Storage API. Access tokens and other related info will be stored here. Defaults to in-memory storage. */
  get storage(): 'session' | 'cookie' | 'local' {
    return this.__storage;
  }

  set storage(value: 'session' | 'cookie' | 'local') {
    this.__storage = value;
    this.__api = this.__createAPIInstance();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('fetch', this.__handleFetch);
  }

  render(): TemplateResult {
    return html`
      ${this.renderTemplateOrSlot(this.isLoggedIn ? 'logged-in' : 'logged-out')}
      <slot></slot>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('fetch', this.__handleFetch);
  }

  private __createAPIInstance() {
    const storageOptions = {
      session: sessionStorage,
      cookie: cookieStorage,
      local: localStorage,
    };

    return new API({
      storage: storageOptions[this.storage],
      level: this.level,
      base: new URL(this.base),
    });
  }

  private async __handleVirtualAuthSessionDelete() {
    await this.api.signOut();

    this.dispatchEvent(new CustomerApi.SignOutEvent('signout'));
    this.requestUpdate();

    return new Response();
  }

  private async __handleVirtualAuthSessionPost(request: Request) {
    const payload = await request.clone().json();
    if (payload.type !== 'password') throw new Error(`Unknown payload type ${payload.type}`);

    let status: number;
    let body: unknown;

    try {
      await this.api.signIn(payload.credential);

      const session = JSON.parse(this.api.storage.getItem(API.SESSION) as string) as StoredSession;
      const detail = { forcePasswordReset: !!session.force_password_reset };

      this.dispatchEvent(new CustomerApi.SignInEvent('signin', { detail }));
      this.requestUpdate();

      status = 200;
      body = { _links: { self: { href: request.url } }, ...payload };
    } catch (err) {
      if (!(err instanceof API.AuthError)) throw err;
      if (!(err.code === 'UNAUTHORIZED')) throw err;

      const virtualAuthError = {
        message: err.message,
        logref: 'unavailable',
        code: 'invalid_credential_error',
      };

      status = 401;
      body = { total: 1, _embedded: { 'fx:errors': [virtualAuthError] } };
    }

    return new Response(JSON.stringify(body), { status });
  }

  private async __handleVirtualAuthSessionAny(request: Request) {
    return new Response(
      JSON.stringify({
        _links: { self: { href: request.url } },
        message: 'POST to this endpoint to sign in',
      })
    );
  }

  private async __handleVirtualAuthRecoverPost(request: Request) {
    const payload = await request.clone().json();

    if (payload.type === 'email') {
      await this.api.sendPasswordResetEmail(payload.detail);
      return new Response(
        JSON.stringify({
          _links: { self: { href: request.url } },
          email: payload.email,
        })
      );
    } else {
      throw new Error(`Unknown payload type ${payload.type}`);
    }
  }

  private async __handleVirtualAuthRecoverAny(request: Request) {
    return new Response(
      JSON.stringify({
        _links: { self: { href: request.url } },
        message: 'POST to this endpoint to request a password reset',
      })
    );
  }

  private async __handleVirtualAuthSignUpPost(request: Request) {
    const data = (await request.clone().json()) as {
      verification: { type: 'hcaptcha'; token: string };
      first_name?: string;
      last_name?: string;
      password?: string;
      email: string;
    };

    try {
      await this.api.signUp(data);
    } catch (err) {
      if (!(err instanceof API.AuthError)) throw err;

      let message: string;
      let status: number;

      if (err.code === 'UNAUTHORIZED') {
        message = 'Customer registration is disabled for this store.';
        status = 401;
      } else if (err.code === 'UNAVAILABLE') {
        message = 'This email address is already in use by an existing customer of this store.';
        status = 403;
      } else if (err.code === 'INVALID_FORM') {
        message = 'Client verification failed.';
        status = 400;
      } else {
        throw err;
      }

      const body = JSON.stringify({ total: 1, _embedded: { 'fx:errors': [{ message }] } });
      return new Response(body, { status });
    }

    if (data.password) await this.api.signIn(data as Required<typeof data>);
    this.requestUpdate();
    this.dispatchEvent(new CustomerApi.SignUpEvent('signup'));

    return new Response(
      JSON.stringify({
        _links: { self: { href: request.url } },
        message: 'Account created',
      })
    );
  }

  private async __handleVirtualAuthSignUpAny(request: Request) {
    return new Response(
      JSON.stringify({
        _links: { self: { href: request.url } },
        message: 'POST to this endpoint to create an account',
      })
    );
  }

  private async __handleRequest(request: Request) {
    const url = request.url;
    const method = request.method;

    try {
      if (url.startsWith('foxy://customer-api/session')) {
        if (method === 'DELETE') return this.__handleVirtualAuthSessionDelete();
        if (method === 'POST') return this.__handleVirtualAuthSessionPost(request);
        return this.__handleVirtualAuthSessionAny(request);
      }

      if (url.startsWith('foxy://customer-api/recover')) {
        if (method === 'POST') return this.__handleVirtualAuthRecoverPost(request);
        return this.__handleVirtualAuthRecoverAny(request);
      }

      if (url.startsWith('foxy://customer-api/signup')) {
        if (method === 'POST') return this.__handleVirtualAuthSignUpPost(request);
        return this.__handleVirtualAuthSignUpAny(request);
      }

      const response = await this.api.fetch(request);

      if (response.status === 401) {
        this.api.storage.clear();
        this.dispatchEvent(new CustomerApi.SignOutEvent('signout'));
        this.requestUpdate();
      }

      return response;
    } catch (err) {
      return new Response(null, { status: 500 });
    }
  }
}
