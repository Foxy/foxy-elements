import type { Dataset, Defaults } from '../router/types';
import type { HandleResult, HandlerContext, Router } from 'service-worker-router';

type Option = { name: string; values: { value: string; sku_code?: string }[] };

const optionKey = (values: Record<string, string>) =>
  Object.entries(values)
    .map(([name, value]) => [name.trim().toLowerCase(), value.trim().toLowerCase()])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('&');

/** `POST /products/{id}/generate_variants`, as the hAPI answers it. */
export function createGenerateVariantsHandler(
  router: Router,
  dataset: Dataset,
  defaults: Defaults
) {
  return async ({ request, params, url }: HandlerContext): Promise<Response> => {
    const products = dataset.products;
    const parent = products.find(product => product.id == params.id);
    const options = (parent?.definition as { options?: Option[] } | undefined)?.options;
    if (!parent || !options?.length) return new Response('Not found', { status: 404 });

    const body = (await request?.json().catch(() => ({}))) ?? {};
    const pattern: string =
      body.sku_pattern ?? ['{parent}', ...options.map(o => `{${o.name}}`)].join('-');

    const active = products.filter(p => p.inherit_from_id === parent.id && !p.deleted_at);
    const taken = new Set(
      active.map(p => optionKey((p.option_values ?? {}) as Record<string, string>))
    );

    let combinations: Record<string, Option['values'][number]>[] = [{}];
    for (const option of options) {
      combinations = combinations.flatMap(c =>
        option.values.map(v => ({ ...c, [option.name]: v }))
      );
    }

    const created = combinations
      .map(combination => {
        const values = Object.fromEntries(
          Object.entries(combination).map(([n, v]) => [n, v.value])
        );
        const sku = Object.entries(combination).reduce(
          (result, [name, v]) =>
            result
              .split(`{${name}}`)
              .join(v.sku_code || v.value.toUpperCase().replace(/[^A-Z0-9]+/g, '-')),
          pattern.split('{parent}').join(String(parent.sku))
        );
        return { values, sku };
      })
      .filter(({ values }) => !taken.has(optionKey(values)));

    if (active.length + created.length > 250) {
      const message = 'That would make more than 250 variants.';
      return new Response(JSON.stringify({ _embedded: { 'fx:errors': [{ message }] } }), {
        status: 400,
      });
    }

    const query = new URLSearchParams({ store_id: String(parent.store_id) });
    const documents = created.map(({ sku, values }) => {
      const document = {
        ...defaults.products(query, dataset),
        sku,
        product_type: 'variant',
        inherit_from_id: parent.id,
        option_values: values,
      };
      products.push(document);
      return document;
    });

    if (documents.length) {
      parent.product_type = 'parent';
      parent.variant_count = active.length + documents.length;
    }

    const embedded = await Promise.all(
      documents.map(async document => {
        const self = new URL(`/${params.prefix}/products/${document.id}`, url).toString();
        const result = router.handleRequest(new Request(self)) as HandleResult;
        return (await result.handlerPromise).json();
      })
    );

    return new Response(
      JSON.stringify({
        _embedded: { 'fx:products': embedded },
        _links: { self: { href: url.toString() } },
        total_items: embedded.length,
        returned_items: embedded.length,
        offset: 0,
        limit: embedded.length,
      }),
      { status: embedded.length ? 201 : 200 }
    );
  };
}
