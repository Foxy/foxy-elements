import { compose } from '../composers/available_fraud_protections';

export type Params = {
  request: Request;
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
    const { request } = params;

    if (request.method !== 'GET') {
      status = 405;
      throw new Error('Method not allowed. Allowed methods: GET.');
    }

    const pathRegex = /\/payment_presets\/(?<presetId>.+)\/available_fraud_protections/;
    const presetId = pathRegex.exec(new URL(request.url).pathname)!.groups!.presetId;

    const output = compose({
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
