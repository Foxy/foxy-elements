import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { fetchJson } from '../utils';
import { compose } from '../composers/payment_method';

export type Params = {
  getPaymentMethodSetHostedPaymentGatewayUrl: (id: string) => string;
  getHostedPaymentGatewayUrl: (id: string) => string;
  getPaymentMethodSetUrl: (id: string) => string;
  getPaymentGatewayUrl: (id: string) => string;
  hostedPaymentGatewaysHelperUrl: string;
  paymentGatewaysHelperUrl: string;
  request: Request;
  fetch: Window['fetch'];
};

/**
 * Request handler.
 *
 * Endpoint: `/payment_presets/:presetId/payment_methods/:methodId`;
 * Methods: GET, PATCH, DELETE;
 * Curie: `fx:payment_method`;
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
      getPaymentMethodSetHostedPaymentGatewayUrl: getSetHostedGwUrl,
      getHostedPaymentGatewayUrl: getHostedGwUrl,
      getPaymentMethodSetUrl: getSetUrl,
      getPaymentGatewayUrl: getGwUrl,
      request,
      fetch,
    } = params;

    if (!['GET', 'PATCH', 'DELETE'].includes(request.method)) {
      status = 405;
      throw new Error('Method not allowed. Allowed methods: GET, PATCH, DELETE.');
    }

    const pathRegex = /\/payment_presets\/(?<presetId>.+)\/payment_methods\/(?<methodId>.+)/;
    const { presetId, methodId } = pathRegex.exec(request.url)!.groups!;

    const isHosted = methodId.startsWith('H');
    const setUrl = getSetUrl(presetId);
    const gwId = methodId.substring(1, isHosted ? methodId.indexOf('C') : undefined);

    type HostedGw = Resource<Rels.HostedPaymentGateway>;
    type Set = Resource<Rels.PaymentMethodSet>;
    type Gw = Resource<Rels.PaymentGateway>;
    type HostedGwsHelper = Resource<Rels.HostedPaymentGatewaysHelper>;
    type GwsHelper = Resource<Rels.PaymentGatewaysHelper>;

    const whenHostedGwsHelperLoaded = fetchJson<HostedGwsHelper>(fetch(hostedGwsHelperUrl));
    const whenGwsHelperLoaded = fetchJson<GwsHelper>(fetch(gwsHelperUrl));

    if (request.method === 'DELETE') {
      if (isHosted) {
        const setHostedGwId = methodId.substring(methodId.indexOf('C') + 1);
        const setHostedGwUrl = getSetHostedGwUrl(setHostedGwId);

        await fetchJson(fetch(setHostedGwUrl, { method: 'DELETE' }));
      } else {
        const setEdits: Partial<Set> = { gateway_uri: '' };
        const setEditsAsString = JSON.stringify(setEdits);

        await fetchJson(fetch(setUrl, { method: 'PATCH', body: setEditsAsString }));
      }
    }

    let requestBody = await request.text();

    try {
      const requestBodyAsJSON = JSON.parse(requestBody);
      delete requestBodyAsJSON.helper;
      requestBody = JSON.stringify(requestBodyAsJSON);
    } catch {
      // ignore
    }

    if (isHosted) {
      const hapiRequest = fetch(getHostedGwUrl(gwId), {
        method: request.method,
        body: request.method === 'PATCH' ? requestBody : null,
      });

      const hostedGwsHelper = await whenHostedGwsHelperLoaded;
      const hostedGw = await fetchJson<HostedGw>(hapiRequest);

      if (request.method === 'DELETE') {
        body = JSON.stringify({ message: 'Payment method was successfully deleted.' });
      } else {
        body = JSON.stringify(
          compose({
            paymentMethodSetHostedPaymentGatewayId: methodId.substring(methodId.indexOf('C') + 1),
            hostedPaymentGateway: hostedGw,
            paymentPresetId: presetId,
            helper: hostedGwsHelper.values[hostedGw.type],
            base: new URL(request.url).origin,
          })
        );
      }
    } else {
      const hapiRequest = fetch(getGwUrl(gwId), {
        method: request.method,
        body: request.method === 'PATCH' ? requestBody : null,
      });

      const gwsHelper = await whenGwsHelperLoaded;
      const gw = await fetchJson<Gw>(hapiRequest);

      if (request.method === 'DELETE') {
        body = JSON.stringify({ message: 'Payment method was successfully deleted.' });
      } else {
        body = JSON.stringify(
          compose({
            paymentGateway: gw,
            paymentPresetId: presetId,
            helper: gwsHelper.values[gw.type],
            base: new URL(request.url).origin,
          })
        );
      }
    }
  } catch (err) {
    body = err instanceof Error ? err.message : String(err);
    status = status ?? 500;
  }

  return new Response(body, { status });
}
