import type { FraudProtection, FraudProtections } from '../types';

import { fetchJson } from '../utils';
import { compose } from '../composers/available_fraud_protections';

export type Params = {
  request: Request;
  fetch: Window['fetch'];
};

/**
 * Request handler.
 *
 * Endpoint: `/payment_presets/:presetId/available_fraud_protections`;
 * Methods: GET;
 * Curie: `fx:available_fraud_protections`;
 * Type: property helper.
 */
export async function handle(params: Params): Promise<Response> {
  let status: number | undefined = undefined;
  let body: string;

  try {
    const { request, fetch } = params;

    if (request.method !== 'GET') {
      status = 405;
      throw new Error('Method not allowed. Allowed methods: GET.');
    }

    const pathRegex = /\/payment_presets\/(?<presetId>.+)\/available_fraud_protections/;
    const presetId = pathRegex.exec(new URL(request.url).pathname)!.groups!.presetId;

    const whenFraudProtectionLoaded = (async () => {
      const result: FraudProtection[] = [];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const base = new URL(request.url).origin;
        const url = new URL(`${base}/payment_presets/${presetId}/fraud_protections`);
        url.searchParams.set('offset', result.length.toString());
        url.searchParams.set('limit', '200');

        const json = await fetchJson<FraudProtections>(fetch(url.toString()));
        result.push(...json._embedded['fx:fraud_protections']);

        if (json._embedded['fx:fraud_protections'].length < 200) break;
      }

      return result;
    })();

    const output = compose({
      fraudProtections: await whenFraudProtectionLoaded,
      paymentPresetId: presetId,
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
