import { LitElement, PropertyDeclarations } from 'lit-element';

import { API } from '@foxy.io/sdk/customer';
import { FetchEvent } from '../NucleonElement/FetchEvent';

/**
 * Element connector for Customer API.
 *
 * @fires CustomerApi#signout - Instance of `CustomerApi.SignOutEvent`. Dispatched on an element when session expires or code 401 is returned.
 * @fires CustomerApi#signin - Instance of `CustomerApi.SignInEvent`. Dispatched on an element once authenticated.
 *
 * @element foxy-customer-api
 * @since 1.4.0
 */
export class CustomerApi extends LitElement {
  static readonly SignOutEvent = class extends CustomEvent<void> {};

  static readonly SignInEvent = class extends CustomEvent<void> {};

  static get properties(): PropertyDeclarations {
    return {
      storage: { type: String },
      level: { type: Number },
      base: { type: String },
    };
  }

  /** Credentials storage implementing Web Storage API. Access tokens and other related info will be stored here. Defaults to in-memory storage. */
  storage: 'memory' | 'session' | 'local' | Storage = 'memory';

  /** Numeric Consola log level. If omitted, Consola defaults will be used. */
  level = 0;

  /** Bookmark URL for this API. This is where the tree traversal begins. We also use this URL as a base for relative paths. */
  base = '';

  private __handleFetch = async (evt: unknown) => {
    if (!(evt instanceof FetchEvent) || evt.defaultPrevented) return;
    if (evt.eventPhase === evt.AT_TARGET) return;

    const getResponse = async () => {
      console.log(evt.request);
      if (evt.request.url === 'foxy://auth/session') {
        try {
          if (evt.request.method === 'DELETE') {
            await this.api.signOut();
            this.dispatchEvent(new CustomerApi.SignOutEvent('signout'));
            return new Response();
          }

          if (evt.request.method === 'POST') {
            const payload = await evt.request.clone().json();

            if (payload.type === 'password') {
              await this.api.signIn(payload.credential);
              this.dispatchEvent(new CustomerApi.SignInEvent('signin'));
            }

            return new Response(
              JSON.stringify({
                _links: { self: { href: evt.request.url } },
                ...payload,
              })
            );
          }
        } catch (err) {
          const status = err instanceof API.AuthError && err.code === 'UNAUTHORIZED' ? 401 : 500;
          return new Response(null, { status });
        }
      }

      if (evt.request.url === 'foxy://auth/recover') {
        try {
          if (evt.request.method === 'POST') {
            const payload = await evt.request.clone().json();

            if (payload.type === 'email') {
              await this.api.sendPasswordResetEmail(payload.detail);
              return new Response(
                JSON.stringify({
                  _links: { self: { href: evt.request.url } },
                  email: payload.email,
                })
              );
            }
          }
        } catch {
          //
        }

        return new Response(null, { status: 500 });
      }

      const response = await this.api.fetch(evt.request);

      if (response.status === 401) {
        await this.api.signOut();
        this.dispatchEvent(new CustomerApi.SignOutEvent('signout'));
      }

      return response;
    };

    evt.respondWith(getResponse());
  };

  /** `FoxySDK.Customer.API` instance used by this element to communicate with the backend. */
  get api(): API {
    const storage =
      typeof this.storage === 'object'
        ? this.storage
        : this.storage === 'local'
        ? localStorage
        : this.storage === 'session'
        ? sessionStorage
        : undefined;

    return new API({
      level: this.level,
      base: new URL(this.base),
      ...(storage ? { storage } : undefined),
    });
  }

  createRenderRoot(): CustomerApi {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('fetch', this.__handleFetch);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('fetch', this.__handleFetch);
  }
}
