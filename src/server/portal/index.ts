import { HandlerContext, Router } from 'service-worker-router';

import { createRouter as createBaseRouter } from '../router/createRouter';
import { createDataset } from '../hapi/createDataset';
import { defaults } from '../hapi/defaults';
import { links } from './links';

export function createRouter(): Router {
  const dataset = createDataset();
  const publicRouter = new Router();
  const privateRouter = createBaseRouter({ dataset, defaults, links });

  publicRouter.get('/:prefix/customer_portal_settings', async (ctx: HandlerContext) => {
    return new Response(
      JSON.stringify({
        session_lifespan_in_minutes: 90,
        subscriptions: {
          allow_frequency_modification: [
            {
              jsonata_query: '$contains(frequency, "m")',
              values: ['.5m', '1m', '2m'],
            },
            {
              jsonata_query: '$contains(frequency, "y")',
              values: ['1y', '2y'],
            },
          ],
          allow_next_date_modification: [
            {
              allowed_days: {
                days: [1, 3, 5],
                type: 'day',
              },
              disallowed_dates: ['2021-09-02', '2021-09-03', '2021-09-01'],
              jsonata_query: '$contains(frequency, "m")',
              max: '2y',
              min: '1w',
            },
          ],
        },
        date_modified: '2021-09-01T00:00:00Z',
        date_created: '2021-09-01T00:00:00Z',
        sso: true,
        tos_checkbox_settings: {
          usage: 'optional' as const,
          url: 'https://foxy.io/terms-of-service/',
          initial_state: 'unchecked' as const,
          is_hidden: false,
        },
        sign_up: {
          verification: { type: 'hcaptcha' as const, site_key: '123' },
          enabled: true,
        },
        _links: { self: { href: ctx.url.toString() } },
      })
    );
  });

  publicRouter.post('/:prefix/forgot_password', async () => {
    return new Response(null, { status: 200 });
  });

  publicRouter.post('/:prefix/authenticate', async ({ request }) => {
    const json = await request.json();
    const customer = dataset.customers.find(customer => customer.email === json.email);

    // any password works
    // session expiration date is set to 4 weeks
    // session token includes unsigned state
    // JWT payload is empty

    let body: string;
    let status = 200;

    if (customer) {
      body = JSON.stringify({
        force_password_reset: false,
        session_token: `${customer.id}-${Date.now() + 2419200 * 1000}`,
        expires_in: 2419200,
        jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
      });
    } else {
      status = 401;
      body = JSON.stringify({
        total: 1,
        _embedded: {
          'fx:errors': [{ logref: 'unavailable', message: 'Incorrect email and/or password.' }],
        },
      });
    }

    return new Response(body, { status });
  });

  publicRouter.delete('/:prefix/authenticate', async () => {
    return new Response(null, { status: 200 });
  });

  publicRouter.all('/:prefix/:collection', async ({ request }: HandlerContext) => {
    const token = request?.headers.get('Authorization')?.replace('Bearer ', '');

    if (token) {
      const [customerId, expiresTimestamp] = token.split('-').map(v => parseInt(v));
      const customer = dataset.customers.find(customer => customer.id == customerId);

      if (expiresTimestamp > Date.now() && customer) {
        return privateRouter.handleRequest(request as Request)?.handlerPromise;
      }
    }

    return new Response(
      JSON.stringify({
        total: 1,
        _embedded: {
          'fx:errors': [
            { logref: 'unavailable', message: 'This route is protected. Please login.' },
          ],
        },
      }),
      { status: 401 }
    );
  });

  publicRouter.all('/:prefix(/)', async ({ url, request }: HandlerContext) => {
    const token = request?.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
    const customerId = token.split('-')[0];
    const method = request?.method ?? 'GET';
    const body = method === 'GET' ? undefined : await request?.text();
    const redirectedURL = new URL(`./customers/${customerId}`, url);
    const redirectedRequest = new Request(redirectedURL.toString(), {
      headers: request?.headers,
      method,
      body,
    });

    return publicRouter.handleRequest(redirectedRequest)?.handlerPromise;
  });

  return publicRouter;
}
