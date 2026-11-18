import type { Data as Product } from '../ProductForm/types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';

const BASE = 'https://demo.api/hapi';

type Overrides = Partial<Omit<Product, 'definition'>> & { definition?: Product['definition'] };

/** A product as the API returns it, with `compiled_definition` filled from `definition`. */
export function product(id: number, overrides: Overrides = {}): Product {
  const definition = overrides.definition ?? {};
  return {
    _links: { self: { href: `${BASE}/products/${id}` } },
    sku: `SKU-${id}`,
    product_type: 'standalone',
    inherit_from_id: null,
    option_values: null,
    hidden: false,
    stock_level: null,
    stock_level_initial: null,
    variant_count: 0,
    collection_id: null,
    deleted_at: null,
    date_created: null,
    date_modified: null,
    compiled_definition: definition,
    ...overrides,
    definition,
  } as unknown as Product;
}

/** A small store: a tee with three variants, a low mug, an untracked wrap, a sold-out coffee. */
export function catalog(): Product[] {
  const options = [
    {
      name: 'size',
      label: 'Size',
      values: [{ value: 'S' }, { value: 'M' }, { value: 'L', price_mod: '2.50' }],
    },
  ];
  const tee = { name: 'Organic Cotton Tee', price: '24.95', options };
  return [
    product(34, {
      sku: 'TEE-ORG',
      product_type: 'parent',
      variant_count: 3,
      collection_id: 19,
      definition: tee,
    }),
    product(35, {
      sku: 'TEE-ORG-S',
      product_type: 'variant',
      inherit_from_id: 34,
      option_values: { size: 'S' },
      stock_level: 17,
      compiled_definition: tee,
    }),
    product(36, {
      sku: 'TEE-ORG-M',
      product_type: 'variant',
      inherit_from_id: 34,
      option_values: { size: 'M' },
      stock_level: 0,
      compiled_definition: tee,
    }),
    product(37, {
      sku: 'TEE-ORG-L',
      product_type: 'variant',
      inherit_from_id: 34,
      option_values: { size: 'L' },
      stock_level: 4,
      compiled_definition: tee,
    }),
    product(41, {
      sku: 'MUG-ENAMEL-12',
      stock_level: 3,
      collection_id: 20,
      definition: { name: 'Enamel Camp Mug, 12 oz', price: 16.4 },
    }),
    product(42, { sku: 'GIFT-WRAP', definition: { name: 'Gift wrap and note', price: '4.5' } }),
    product(43, {
      sku: 'COF-COL-HUILA-340',
      stock_level: 0,
      hidden: true,
      inherit_from_id: 44,
      collection_id: 25,
      definition: { name: 'Colombia Huila', price: '17.25' },
    }),
    product(44, { sku: 'TPL-COFFEE-340', product_type: 'template', stock_level: 10 }),
  ];
}

/** Collections as deep as three levels, in no particular order, with their ids only in their links. */
export function collections(): {
  _links: { self: { href: string } };
  name: string;
  path: string;
}[] {
  const collection = (id: number, name: string, path: string) => ({
    _links: { self: { href: `${BASE}/product_collections/${id}` } },
    name,
    path,
  });
  return [
    collection(20, 'Brewing Gear', '/gear'),
    collection(25, 'Colombia', '/coffee/single-origin/colombia'),
    collection(18, 'Apparel', '/apparel'),
    collection(17, 'Coffee', '/coffee'),
    collection(19, 'T-Shirts', '/apparel/t-shirts'),
    collection(21, 'Single Origin', '/coffee/single-origin'),
  ];
}

export interface Server {
  products: Product[];
  collections: ReturnType<typeof collections>;
  settings: { low_stock_threshold: number };
  requests: { method: string; url: string; body: unknown }[];
  /** Hrefs whose PATCH is refused with a 400. */
  failing: Set<string>;
  handle: (evt: FetchEvent) => void;
}

/** Answers the products collection in pages, PATCHes of a product and the store's settings. */
export function createServer(products = catalog()): Server {
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  const server: Server = {
    products,
    collections: collections(),
    settings: { low_stock_threshold: 5 },
    requests: [],
    failing: new Set(),
    handle: evt => {
      evt.preventDefault();
      evt.respondWith(
        (async () => {
          const url = new URL(evt.request.url);
          const method = evt.request.method;
          const body = method === 'GET' ? null : await evt.request.clone().json();
          server.requests.push({ method, url: evt.request.url, body });

          if (url.pathname.endsWith('/product_settings')) {
            if (method === 'PATCH') Object.assign(server.settings, body);
            return json(server.settings);
          }

          if (url.pathname.endsWith('/product_collections')) {
            return json({
              _embedded: { 'fx:product_collections': server.collections },
              total_items: server.collections.length,
            });
          }

          if (url.pathname.endsWith('/products')) {
            const limit = Number(url.searchParams.get('limit') ?? 20);
            const offset = Number(url.searchParams.get('offset') ?? 0);
            const page = server.products.slice(offset, offset + limit);
            return json({
              _links: { self: { href: evt.request.url } },
              _embedded: { 'fx:products': page },
              total_items: server.products.length,
              returned_items: page.length,
              offset,
              limit,
            });
          }

          const index = server.products.findIndex(p => p._links.self.href === evt.request.url);
          if (index === -1 || server.failing.has(evt.request.url)) return json({}, 400);
          if (method === 'PATCH') {
            server.products[index] = { ...server.products[index], ...(body as Product) };
          }
          return json(server.products[index]);
        })()
      );
    },
  };
  return server;
}

export const productsHref = `${BASE}/stores/0/products`;
export const collectionsHref = `${BASE}/stores/0/product_collections`;
export const settingsHref = `${BASE}/stores/0/product_settings`;
