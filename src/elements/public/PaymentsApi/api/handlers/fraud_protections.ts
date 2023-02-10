import type { FraudProtection } from '../types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { compose as composeFraudProtections } from '../composers/fraud_protections';
import { compose as composeFraudProtection } from '../composers/fraud_protection';

import { fetchJson } from '../utils';

export type Params = {
  fraudProtectionsUrl: string;
  getPaymentMethodSetUrl: (id: string) => string;
  request: Request;
  fetch: Window['fetch'];
};

/**
 * Request handler.
 *
 * Endpoint: `/payment_presets/:presetId/fraud_protections`;
 * Methods: GET, POST;
 * Curie: `fx:fraud_protections`;
 * Type: resource.
 *
 * ID template: `{{ fraud protection id }}C{{ payment method set fraud protection id }}`;
 */
export async function handle(params: Params): Promise<Response> {
  let status: number | undefined = undefined;
  let body: string;

  try {
    const {
      fraudProtectionsUrl: fpUrl,
      getPaymentMethodSetUrl: getSetUrl,
      request,
      fetch,
    } = params;

    if (!['GET', 'POST'].includes(request.method)) {
      status = 405;
      throw new Error('Method not allowed. Allowed methods: GET, POST.');
    }

    const url = new URL(request.url);
    const pathRegex = /\/payment_presets\/(?<presetId>.+)\/fraud_protections/;
    const presetId = pathRegex.exec(url.pathname)!.groups!.presetId;

    type SetFps = Resource<Rels.PaymentMethodSetFraudProtections>;
    type SetFp = Resource<Rels.PaymentMethodSetFraudProtection>;
    type Fp = Resource<Rels.FraudProtection>;
    type Set = Resource<Rels.PaymentMethodSet>;

    const set = await fetchJson<Set>(fetch(getSetUrl(presetId)));

    if (request.method === 'GET') {
      const offset = parseInt(url.searchParams.get('offset') ?? '0');
      const limit = parseInt(url.searchParams.get('limit') ?? '20');

      const sfpsURL = new URL(set._links['fx:payment_method_set_fraud_protections'].href);

      sfpsURL.searchParams.set('offset', String(Math.max(0, offset - 1)));
      sfpsURL.searchParams.set('limit', String(limit));

      const sfps = await fetchJson<SetFps>(fetch(sfpsURL.toString()));
      const fps = await Promise.all(
        sfps._embedded['fx:payment_method_set_fraud_protections'].map(async shgw => {
          return fetchJson<Fp>(fetch(shgw._links['fx:fraud_protection'].href));
        })
      );

      const output = composeFraudProtections({
        paymentMethodSetFraudProtections: sfps,
        fraudProtections: fps,
        paymentPresetId: presetId,
        base: new URL(request.url).origin,
      });

      status = 200;
      body = JSON.stringify(output);
    } else {
      const requestBody = (await request.json()) as Partial<FraudProtection>;
      delete requestBody.helper;

      const hapiRequest = fetch(fpUrl, { method: 'POST', body: JSON.stringify(requestBody) });
      const newFp = await fetchJson<Fp>(hapiRequest);

      const newSetFp = await fetchJson<SetFp>(
        fetch(set._links['fx:payment_method_set_fraud_protections'].href, {
          method: 'POST',
          body: JSON.stringify({
            payment_method_set_uri: set._links.self.href,
            fraud_protection_uri: newFp._links.self.href,
          }),
        })
      );

      const output = composeFraudProtection({
        paymentMethodSetFraudProtectionId: new URL(newSetFp._links.self.href).pathname
          .split('/')
          .pop() as string,
        fraudProtection: newFp,
        paymentPresetId: presetId,
        base: new URL(request.url).origin,
      });

      status = 200;
      body = JSON.stringify(output);
    }
  } catch (err) {
    body = err instanceof Error ? err.message : String(err);
    status = status ?? 500;
  }

  return new Response(body, { status });
}
