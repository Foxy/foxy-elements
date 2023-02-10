import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { fetchJson } from '../utils';
import { compose } from '../composers/fraud_protection';

export type Params = {
  getPaymentMethodSetUrl: (id: string) => string;
  getFraudProtectionUrl: (id: string) => string;
  request: Request;
  fetch: Window['fetch'];
};

/**
 * Request handler.
 *
 * Endpoint: `/payment_presets/:presetId/fraud_protection/:protectionId`;
 * Methods: GET, PATCH, DELETE;
 * Curie: `fx:fraud_protection`;
 * Type: resource.
 *
 * ID template: `{{ fraud protection id }}C{{ payment method set fraud protection id }}`.
 */
export async function handle(params: Params): Promise<Response> {
  let status: number | undefined = undefined;
  let body: string;

  try {
    const {
      getPaymentMethodSetUrl: getSetUrl,
      getFraudProtectionUrl: getFpUrl,
      request,
      fetch,
    } = params;

    if (!['GET', 'PATCH', 'DELETE'].includes(request.method)) {
      status = 405;
      throw new Error('Method not allowed. Allowed methods: GET, PATCH, DELETE.');
    }

    const pathRegex = /\/payment_presets\/(?<presetId>.+)\/fraud_protections\/(?<protectionId>.+)/;
    const { presetId, protectionId } = pathRegex.exec(request.url)!.groups!;

    const setUrl = getSetUrl(presetId);
    const fpId = protectionId.substring(0, protectionId.indexOf('C'));

    type SetFps = Resource<Rels.PaymentMethodSetFraudProtections>;
    type Set = Resource<Rels.PaymentMethodSet>;
    type Fp = Resource<Rels.FraudProtection>;

    if (request.method === 'DELETE') {
      const set = await fetchJson<Set>(fetch(setUrl));
      const setFpsUrl = set._links['fx:payment_method_set_fraud_protections'].href;

      const setFpsURL = new URL(setFpsUrl);
      setFpsURL.searchParams.set('fraud_protection_id', fpId);

      const setFps = await fetchJson<SetFps>(fetch(setFpsURL.toString()));
      const setFpsEmbeds = setFps._embedded;
      const removals = setFpsEmbeds['fx:payment_method_set_fraud_protections'].map(data =>
        fetchJson(fetch(data._links.self.href, { method: 'DELETE' }))
      );

      await Promise.all(removals);
    }

    let requestBody = await request.text();

    try {
      const requestBodyAsJSON = JSON.parse(requestBody);
      delete requestBodyAsJSON.helper;
      requestBody = JSON.stringify(requestBodyAsJSON);
    } catch {
      // ignore
    }

    const hapiRequest = fetch(getFpUrl(fpId), {
      method: request.method,
      body: request.method === 'PATCH' ? requestBody : null,
    });

    const fp = await fetchJson<Fp>(hapiRequest);

    if (request.method === 'DELETE') {
      body = JSON.stringify({ message: 'Fraud protection was successfully deleted.' });
    } else {
      body = JSON.stringify(
        compose({
          paymentMethodSetFraudProtectionId: protectionId.substring(protectionId.indexOf('C') + 1),
          fraudProtection: fp,
          paymentPresetId: presetId,
          base: new URL(request.url).origin,
        })
      );
    }
  } catch (err) {
    body = err instanceof Error ? err.message : String(err);
    status = status ?? 500;
  }

  return new Response(body, { status });
}
