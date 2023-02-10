import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { fetchJson } from '../utils';
import { compose } from '../composers/available_payment_methods';

export type Params = {
  hostedPaymentGatewaysHelperUrl: string;
  paymentGatewaysHelperUrl: string;
  getPaymentMethodSetUrl: (id: string) => string;
  request: Request;
  fetch: Window['fetch'];
};

/**
 * Request handler.
 *
 * Endpoint: `/payment_presets/:presetId/available_payment_methods`;
 * Methods: GET;
 * Curie: `fx:available_payment_methods`;
 * Type: property helper.
 */
export async function handle(params: Params): Promise<Response> {
  let status: number | undefined = undefined;
  let body: string;

  try {
    const {
      hostedPaymentGatewaysHelperUrl: hostedGwsHelperUrl,
      paymentGatewaysHelperUrl: gwsHelperUrl,
      getPaymentMethodSetUrl: getSetUrl,
      request,
      fetch,
    } = params;

    if (request.method !== 'GET') {
      status = 405;
      throw new Error('Method not allowed. Allowed methods: GET.');
    }

    const pathRegex = /\/payment_presets\/(?<presetId>.+)\/available_payment_methods/;
    const presetId = pathRegex.exec(new URL(request.url).pathname)!.groups!.presetId;

    type HostedGwsHelper = Resource<Rels.HostedPaymentGatewaysHelper>;
    type GwsHelper = Resource<Rels.PaymentGatewaysHelper>;
    type Set = Resource<Rels.PaymentMethodSet>;
    type Gw = Resource<Rels.PaymentGateway>;

    const whenHostedGwsHelperLoaded = fetchJson<HostedGwsHelper>(fetch(hostedGwsHelperUrl));
    const whenGwsHelperLoaded = fetchJson<GwsHelper>(fetch(gwsHelperUrl));
    const set = await fetchJson<Set>(fetch(getSetUrl(presetId)));
    const gwUrl = set._links['fx:payment_gateway']?.href as string | undefined;
    const gw = gwUrl ? await fetchJson<Gw>(fetch(gwUrl)) : undefined;

    const output = compose({
      hostedPaymentGatewaysHelper: await whenHostedGwsHelperLoaded,
      paymentGatewaysHelper: await whenGwsHelperLoaded,
      paymentPresetId: presetId,
      paymentGateway: gw,
      base: new URL(request.url).origin,
    });

    body = JSON.stringify(output);
    status = 200;
  } catch (err) {
    body = err instanceof Error ? err.message : String(err);
    status = status ?? 500;
  }

  return new Response(body, { status });
}
