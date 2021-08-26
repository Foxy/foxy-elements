import { API } from '@foxy.io/sdk/customer';
import CookieStorageModule from 'cookie-storage';
import { cookieStorage } from './cookieStorage';
import { expect } from '@open-wc/testing';

describe('CustomerApi', () => {
  describe('cookieStorage', () => {
    it('extends CookieStorage class from the cookie-storage package', () => {
      expect(cookieStorage).to.be.instanceOf(CookieStorageModule.CookieStorage);
    });

    it('constructs SDK.Customer.API.SESSION value from multiple cookie entries (without sso)', () => {
      document.cookie = 'fx.customer=test-session-token';
      document.cookie = 'fx.customer.duration=123456';
      document.cookie = 'fx.customer.start=2021-08-01';
      document.cookie = 'fx.customer.jwt=test-jwt';

      const session = JSON.parse(cookieStorage.getItem(API.SESSION) as string);

      expect(session).to.have.property('session_token', 'test-session-token');
      expect(session).to.have.property('date_created', '2021-08-01');
      expect(session).to.have.property('expires_in', 123456);
      expect(session).to.have.property('jwt', 'test-jwt');

      document.cookie = 'fx.customer=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.duration=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.start=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.jwt=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    it('constructs SDK.Customer.API.SESSION value from multiple cookie entries (with sso)', () => {
      document.cookie = 'fx.customer=test-session-token';
      document.cookie = 'fx.customer.duration=123456';
      document.cookie = 'fx.customer.start=2021-08-01';
      document.cookie = 'fx.customer.jwt=test-jwt';
      document.cookie = 'fx.customer.sso=test-sso-value';

      const session = JSON.parse(cookieStorage.getItem(API.SESSION) as string);

      expect(session).to.have.property('session_token', 'test-session-token');
      expect(session).to.have.property('date_created', '2021-08-01');
      expect(session).to.have.property('expires_in', 123456);
      expect(session).to.have.property('jwt', 'test-jwt');
      expect(session).to.have.property('sso', 'test-sso-value');

      document.cookie = 'fx.customer=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.duration=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.start=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.jwt=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.sso=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    it('returns null for SDK.Customer.API.SESSION value when some of the session cookies are not present', () => {
      document.cookie = 'fx.customer.duration=123456';
      document.cookie = 'fx.customer.start=2021-08-01';

      expect(cookieStorage.getItem(API.SESSION)).to.be.null;

      document.cookie = 'fx.customer.duration=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.start=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    it('returns null for SDK.Customer.API.SESSION value when none of the session cookies are present', () => {
      expect(cookieStorage.getItem(API.SESSION)).to.be.null;
    });

    it('returns value for custom key as usual', () => {
      document.cookie = 'foo=bar';

      expect(cookieStorage.getItem('foo')).to.equal('bar');
      expect(cookieStorage.getItem('bar')).to.be.null;

      document.cookie = 'foo=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    it('creates multiple cookies from SDK.Customer.API.SESSION value', () => {
      const session = {
        session_token: 'test-session-token',
        date_created: new Date().toISOString(),
        expires_in: 123456,
        jwt: 'test-jwt',
        sso: 'test-sso-value',
      };

      cookieStorage.setItem(API.SESSION, JSON.stringify(session));

      const cookie = document.cookie.split(';').map(v => v.trim());

      expect(cookie).to.include(`fx.customer.duration=${session.expires_in}`);
      expect(cookie).to.include(`fx.customer.start=${encodeURIComponent(session.date_created)}`);
      expect(cookie).to.include(`fx.customer.jwt=${session.jwt}`);
      expect(cookie).to.include(`fx.customer.sso=${session.sso}`);
      expect(cookie).to.include(`fx.customer=${session.session_token}`);

      document.cookie = 'fx.customer=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.duration=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.start=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.jwt=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.sso=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    it('creates a custom cookie as usual', () => {
      const expires = new Date(Date.now() + 10000000);
      cookieStorage.setItem('foo', 'bar', { expires });

      expect(cookieStorage.getItem('foo')).to.equal('bar');

      document.cookie = 'foo=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });

    it('clears all cookies starting with fx.customer on .clear()', () => {
      document.cookie = 'fx.foo=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fx.customer.foo=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'baz=;expires=Thu, 01 Jan 1970 00:00:00 GMT';

      const expires = new Date(Date.now() + 10000000);

      cookieStorage.setItem('fx.customer.foo', 'bar', { expires });
      cookieStorage.setItem('baz', 'qux', { expires });
      cookieStorage.clear();

      expect(cookieStorage.getItem('fx.customer.foo')).to.be.null;
      expect(cookieStorage.getItem('baz')).to.equal('qux');
    });
  });
});
