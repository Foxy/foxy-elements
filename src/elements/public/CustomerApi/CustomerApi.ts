import { LitElement, PropertyDeclarations } from 'lit-element';

import { API } from '@foxy.io/sdk/customer';
import { FetchEvent } from '../NucleonElement/FetchEvent';

/**
 * Element connector for Customer API.
 *
 * @element foxy-customer-api
 * @since 1.4.0
 */
export class CustomerApi extends LitElement {
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

    const getResponse = async () => {
      const storage =
        typeof this.storage === 'object'
          ? this.storage
          : this.storage === 'local'
          ? localStorage
          : this.storage === 'session'
          ? sessionStorage
          : undefined;

      const api = new API({
        level: this.level,
        base: new URL(this.base),
        ...(storage ? { storage } : undefined),
      });

      if (evt.request.url === 'foxy://auth/session') {
        try {
          if (evt.request.method === 'DELETE') await api.signOut();

          if (evt.request.method === 'POST') {
            const payload = await evt.request.clone().json();
            if (payload.type === 'password') await api.signIn(payload.credential);
          }

          return new Response(null, { status: 200 });
        } catch (err) {
          const status = err instanceof API.AuthError && err.code === 'UNAUTHORIZED' ? 401 : 500;
          return new Response(null, { status });
        }
      }

      if (evt.request.url === 'foxy://auth/recover') {
        try {
          if (evt.request.method === 'POST') {
            const payload = await evt.request.clone().json();
            if (payload.type === 'email') await api.sendPasswordResetEmail(payload.detail);
          }

          return new Response(null, { status: 200 });
        } catch (err) {
          return new Response(null, { status: 500 });
        }
      }

      return api.fetch(evt.request.url, evt.request);
    };

    evt.respondWith(getResponse());
  };

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
