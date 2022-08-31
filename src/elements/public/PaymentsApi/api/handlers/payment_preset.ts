import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { fetchJson } from '../utils';
import { compose } from '../composers/payment_preset';

export type Params = {
  getPaymentMethodSetUrl: (id: string) => string;
  request: Request;
  fetch: Window['fetch'];
};

/**
 * Request handler.
 *
 * Endpoint: `/payment_presets/:presetId`;
 * Methods: GET, PATCH, DELETE;
 * Curie: `fx:payment_preset`;
 * Type: resource.
 */
export async function handle(params: Params): Promise<Response> {
  let status: number | undefined = undefined;
  let body: string;

  try {
    const { getPaymentMethodSetUrl: getSetUrl, request, fetch } = params;

    if (!['GET', 'PATCH', 'DELETE'].includes(request.method)) {
      status = 405;
      throw new Error('Method not allowed. Allowed methods: GET, PATCH, DELETE.');
    }

    const pathRegex = /payment_presets\/(?<presetId>.+)/;
    const presetId = pathRegex.exec(request.url)!.groups!.presetId;
    const url = new URL(request.url);

    const setURL = new URL(getSetUrl(presetId));
    setURL.search = url.search;

    const set = await fetchJson<Resource<Rels.PaymentMethodSet>>(
      fetch(setURL.toString(), {
        method: request.method,
        body: request.method === 'PATCH' ? await request.text() : null,
      })
    );

    if (request.method === 'DELETE') {
      body = JSON.stringify({ message: 'Payment preset was successfully deleted.' });
    } else {
      body = JSON.stringify(compose({ paymentMethodSet: set, base: new URL(request.url).origin }));
    }
  } catch (err) {
    body = err instanceof Error ? err.message : String(err);
    status = status ?? 500;
  }

  return new Response(body, { status });
}
