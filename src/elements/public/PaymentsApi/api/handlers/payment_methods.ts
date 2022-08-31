import type { PaymentMethod } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { compose as composePaymentMethods } from '../composers/payment_methods';
import { compose as composePaymentMethod } from '../composers/payment_method';
import { fetchJson } from '../utils';

export type Params = {
  hostedPaymentGatewaysHelperUrl: string;
  paymentGatewaysHelperUrl: string;
  hostedPaymentGatewaysUrl: string;
  paymentGatewaysUrl: string;
  getPaymentMethodSetUrl: (id: string) => string;
  request: Request;
  fetch: Window['fetch'];
};

/**
 * Request handler.
 *
 * Endpoint: `/payment_presets/:presetId/payment_methods`;
 * Methods: GET, POST;
 * Curie: `fx:payment_methods`;
 * Type: resource.
 *
 * Method ID template for regular gateways: `R{{ payment gateway id }}`;
 * For hosted gateways: `H{{ hosted payment gateway id }}C{{ payment method set hosted payment gateway id }}`.
 */
export async function handle(params: Params): Promise<Response> {
  let status: number | undefined = undefined;
  let body: string;

  try {
    const {
      hostedPaymentGatewaysHelperUrl: hostedGwsHelperUrl,
      paymentGatewaysHelperUrl: gwsHelperUrl,
      hostedPaymentGatewaysUrl: hostedGwsUrl,
      getPaymentMethodSetUrl: getSetUrl,
      paymentGatewaysUrl: gwsUrl,
      request,
      fetch,
    } = params;

    if (!['GET', 'POST'].includes(request.method)) {
      status = 405;
      throw new Error('Method not allowed. Allowed methods: GET, POST.');
    }

    const url = new URL(request.url);
    const pathRegex = /\/payment_presets\/(?<presetId>.+)\/payment_methods/;
    const presetId = pathRegex.exec(url.pathname)!.groups!.presetId;

    type HostedGwsHelper = Resource<Rels.HostedPaymentGatewaysHelper>;
    type GwsHelper = Resource<Rels.PaymentGatewaysHelper>;
    type SetHostedGws = Resource<Rels.PaymentMethodSetHostedPaymentGateways>;
    type SetHostedGw = Resource<Rels.PaymentMethodSetHostedPaymentGateway>;
    type HostedGw = Resource<Rels.HostedPaymentGateway>;
    type Set = Resource<Rels.PaymentMethodSet>;
    type Gw = Resource<Rels.PaymentGateway>;

    const [hostedGwsHelper, gwsHelper, set] = await Promise.all([
      fetchJson<HostedGwsHelper>(fetch(hostedGwsHelperUrl)),
      fetchJson<GwsHelper>(fetch(gwsHelperUrl)),
      fetchJson<Set>(fetch(getSetUrl(presetId))),
    ]);

    if (request.method === 'GET') {
      const offset = parseInt(url.searchParams.get('offset') ?? '0');
      const limit = parseInt(url.searchParams.get('limit') ?? '20');

      const shgwsURL = new URL(set._links['fx:payment_method_set_hosted_payment_gateways'].href);

      shgwsURL.searchParams.set('offset', String(Math.max(0, offset - 1)));
      shgwsURL.searchParams.set('limit', String(limit));

      const gwUrl = set._links['fx:payment_gateway']?.href as string | undefined;

      const [gw, shgws] = await Promise.all([
        gwUrl && offset === 0 ? fetchJson<Gw>(fetch(gwUrl)) : null,
        fetchJson<SetHostedGws>(fetch(shgwsURL.toString())),
      ]);

      const hgws = await Promise.all(
        shgws._embedded['fx:payment_method_set_hosted_payment_gateways'].map(async shgw => {
          return fetchJson<HostedGw>(fetch(shgw._links['fx:hosted_payment_gateway'].href));
        })
      );

      const output = composePaymentMethods({
        paymentMethodSetHostedPaymentGateways: shgws,
        hostedPaymentGatewaysHelper: hostedGwsHelper,
        paymentGatewaysHelper: gwsHelper,
        hostedPaymentGateways: hgws,
        paymentPresetId: presetId,
        paymentGateway: gw ? gw : gwUrl ? 'not-on-page' : undefined,
        query: new URL(request.url).search,
        base: new URL(request.url).origin,
      });

      status = 200;
      body = JSON.stringify(output);
    } else {
      const requestBody = (await request.clone().json()) as Partial<PaymentMethod>;
      const isHosted = !!hostedGwsHelper.values[requestBody.type ?? ''];

      delete requestBody.helper;

      if (isHosted) {
        const newHostedGw = await fetchJson<HostedGw>(
          fetch(hostedGwsUrl, { method: 'POST', body: JSON.stringify(requestBody) })
        );

        const newSetHostedGw = await fetchJson<SetHostedGw>(
          fetch(set._links['fx:payment_method_set_hosted_payment_gateways'].href, {
            method: 'POST',
            body: JSON.stringify({
              payment_method_set_uri: set._links.self.href,
              hosted_payment_gateway_uri: newHostedGw._links.self.href,
            }),
          })
        );

        const output = composePaymentMethod({
          paymentMethodSetHostedPaymentGatewayId: new URL(newSetHostedGw._links.self.href).pathname
            .split('/')
            .pop() as string,
          hostedPaymentGateway: newHostedGw,
          paymentPresetId: presetId,
          helper: hostedGwsHelper.values[newHostedGw.type],
          base: new URL(request.url).origin,
        });

        status = 200;
        body = JSON.stringify(output);
      } else {
        const hapiRequest = fetch(gwsUrl, {
          method: request.method,
          body: JSON.stringify(requestBody),
        });

        const newGw = await fetchJson<Gw>(hapiRequest);
        const setEdits: Partial<Set> = { gateway_uri: newGw._links.self.href };

        await Promise.all([
          fetchJson(
            fetch(set._links.self.href, { method: 'PATCH', body: JSON.stringify(setEdits) })
          ),
          set.gateway_uri ? fetchJson(fetch(set.gateway_uri, { method: 'DELETE' })) : null,
        ]);

        const output = composePaymentMethod({
          paymentPresetId: presetId,
          paymentGateway: newGw,
          helper: gwsHelper.values[newGw.type],
          base: new URL(request.url).origin,
        });

        status = 200;
        body = JSON.stringify(output);
      }
    }
  } catch (err) {
    body = err instanceof Error ? err.message : String(err);
    status = status ?? 500;
  }

  return new Response(body, { status });
}
