import { API } from '@foxy.io/sdk/customer';
import { CookieOptions } from 'cookie-storage/lib/cookie-options';
import CookieStorageModule from 'cookie-storage';
import { StoredSession } from '@foxy.io/sdk/dist/types/customer/types';

type ExtendedStoredSession = StoredSession & { sso?: string };

/**
 * Compatibility solution for the 3rd-party code designed to work with the original beta
 * version of the customer portal (StencilJS-based). Supports only one key (`session`) and
 * and stores provided value in `fx.customer`, `fx.customer.jwt`, `fx.customer.sso` cookies.
 * Clearing the storage will result in removal of all cookies prefixed with `fx.customer`.
 *
 * This storage will be replaced with a better solution from v2 of our SDK in
 * the next major version of the elements package.
 */
class CustomCookieStorage extends CookieStorageModule.CookieStorage {
  constructor() {
    super({
      sameSite: 'Strict',
      expires: new Date(),
      secure: true,
      domain: location.hostname,
      path: '/',
    });
  }

  getItem(name: string): string | null {
    if (name === API.SESSION) {
      const customer = super.getItem('fx.customer');
      const duration = super.getItem('fx.customer.duration');
      const start = super.getItem('fx.customer.start');
      const jwt = super.getItem('fx.customer.jwt');

      if (customer === null || duration === null || start === null || jwt === null) return null;

      const value: ExtendedStoredSession = {
        session_token: customer,
        date_created: start,
        expires_in: parseInt(duration),
        jwt,
      };

      const sso = super.getItem('fx.customer.sso');
      if (sso !== null) value.sso = sso;

      return JSON.stringify(value);
    } else {
      return super.getItem(name);
    }
  }

  setItem(name: string, value: string, options?: CookieOptions): void {
    if (name === API.SESSION) {
      const session = JSON.parse(value) as ExtendedStoredSession;
      const expiresInMs = session.expires_in * 1000;
      const expires = new Date(new Date(session.date_created).getTime() + expiresInMs);

      super.setItem('fx.customer', session.session_token, { expires });
      super.setItem('fx.customer.jwt', session.jwt, { expires });
      super.setItem('fx.customer.start', session.date_created, { expires });
      super.setItem('fx.customer.duration', String(session.expires_in), { expires });

      if (session.sso) super.setItem('fx.customer.sso', session.sso, { expires });
    } else {
      return super.setItem(name, value, options);
    }
  }

  clear(): void {
    for (let index = 0; index < this.length; ) {
      const name = super.key(index) as string;

      if (name.startsWith('fx.customer')) {
        super.removeItem(name);
      } else {
        index++;
      }
    }
  }
}

export const cookieStorage = new CustomCookieStorage();
