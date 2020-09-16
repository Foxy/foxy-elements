import { RequestEvent } from '../../../events/request';
import { bookmark } from '../../../mocks/FxBookmark';
import { customerPortalSettings } from '../../../mocks/FxCustomerPortalSettings';
import { store } from '../../../mocks/FxStore';
import { subscriptions } from '../../../mocks/FxSubscriptions';
import { transactions } from '../../../mocks/FxTransactions';
import { user } from '../../../mocks/FxUser';

export function handleRequest(evt: RequestEvent): void {
  evt.detail.handle(async (...fetchArgs) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // normalize URL so that it always has a trailing slash
    const url = new URL(fetchArgs[0] as string, 'https://api.foxy.test');
    if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`;

    const init = fetchArgs[1];
    const isLoggedInKey = '@foxy.io/elements::storybook.is_admin_signed_in';

    // handle special sign in URL
    if (url.toString() === 'foxy://sign-in') {
      const { email, password, newPassword } = JSON.parse(init!.body!.toString());
      if (email === 'hello@foxy.io' && password === '1234567890') {
        sessionStorage.setItem(isLoggedInKey, '1');
        return new Response(null, { status: 200 });
      } else if (email === 'reset@foxy.io' && password === '1234567890') {
        if (newPassword) sessionStorage.setItem(isLoggedInKey, '1');
        return new Response(null, { status: newPassword ? 200 : 205 });
      } else {
        return new Response(null, { status: 401 });
      }
    }

    // handle special sign out URL
    if (url.toString() === 'foxy://sign-out') {
      sessionStorage.removeItem(isLoggedInKey);
      return new Response(null, { status: 200 });
    }

    // handle special password reset URL
    if (url.toString() === 'foxy://reset-password') {
      return new Response(null, { status: 200 });
    }

    // respond with 401 Unauthorized if not logged in
    if (!sessionStorage.getItem(isLoggedInKey)) {
      return new Response(null, { status: 401 });
    }

    // respond with subscriptions stub
    if (url.pathname === '/stores/8/subscriptions/') {
      return new Response(JSON.stringify(subscriptions));
    }

    // respond with transactions stub
    if (url.pathname === '/stores/8/transactions/') {
      return new Response(JSON.stringify(transactions));
    }

    // respond with customer portal settings stub
    if (url.pathname === '/stores/8/customer_portal_settings/') {
      return new Response(JSON.stringify(customerPortalSettings));
    }

    // respond with store stub
    if (url.toString() === 'https://api.foxy.test/stores/8/') {
      return new Response(JSON.stringify(store));
    }

    // respond with user stub
    if (url.toString() === 'https://api.foxy.test/users/2/') {
      return new Response(JSON.stringify(user));
    }

    // respond with bookmark stub
    if (url.toString() === 'https://api.foxy.test/') {
      return new Response(JSON.stringify(bookmark));
    }

    // any other route is not implemented, so 404
    console.error('Unhandled route: ', url.toString());
    return new Response(null, { status: 404 });
  });
}
