import type { PaymentPreset, PaymentPresets } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { compose as composePaymentPresets } from '../composers/payment_presets';
import { compose as composePaymentPreset } from '../composers/payment_preset';
import { fetchJson } from '../utils';

export type Params = {
  paymentMethodSetsUrl: string;
  request: Request;
  fetch: Window['fetch'];
};

/**
 * Request handler.
 *
 * Endpoint: `/payment_presets`;
 * Methods: GET, POST;
 * Curie: `fx:payment_presets`;
 * Type: collection.
 */
export async function handle(params: Params): Promise<Response> {
  let status: number | undefined = undefined;
  let body: string;

  try {
    const { paymentMethodSetsUrl: setsUrl, request, fetch } = params;

    if (!['GET', 'POST'].includes(request.method)) {
      status = 405;
      throw new Error('Method not allowed. Allowed methods: GET, POST.');
    }

    const requestURL = new URL(request.url);
    const setsURL = new URL(setsUrl);
    setsURL.search = requestURL.search;

    type Set = Resource<Rels.PaymentMethodSet>;
    type Sets = Resource<Rels.PaymentMethodSets>;

    let output: PaymentPreset | PaymentPresets;

    if (request.method === 'POST') {
      const hapiRequest = fetch(setsURL.toString(), { method: 'POST', body: await request.text() });
      output = composePaymentPreset({
        paymentMethodSet: await fetchJson<Set>(hapiRequest),
        base: requestURL.origin,
      });
    } else {
      output = composePaymentPresets({
        paymentMethodSets: await fetchJson<Sets>(fetch(setsURL.toString())),
        base: requestURL.origin,
      });
    }

    body = JSON.stringify(output);
    status = 200;
  } catch (err) {
    body = err instanceof Error ? err.message : String(err);
    status = status ?? 500;
  }

  return new Response(body, { status });
}
