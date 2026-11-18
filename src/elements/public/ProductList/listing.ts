import type { Data } from '../ProductForm/types';

export type StockState = 'in_stock' | 'low_stock' | 'out_of_stock' | 'untracked';

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export const STOCK_COLORS: Record<StockState, string> = {
  in_stock: '#2DBE60',
  low_stock: '#E8A317',
  out_of_stock: '#C2402F',
  untracked: '#A9B0B8',
};

/** A product that isn't a variant, with its active variants. */
export interface ProductGroup {
  product: Data;
  variants: Data[];
}

export interface StockSummary {
  state: StockState;
  /** Units across everything in the group that holds stock. */
  units: number;
  /** How many stock holders are at zero, and how many are low. */
  out: number;
  low: number;
  holders: number;
}

/** A threshold of 0 means nothing counts as low. */
export function stockState(level: number | null | undefined, threshold: number): StockState {
  if (level === null || level === undefined) return 'untracked';
  if (level <= 0) return 'out_of_stock';
  return level <= threshold ? 'low_stock' : 'in_stock';
}

/**
 * What counts as low for this product: its own number when it has one, which
 * it may inherit from its parent or template, else the store's.
 */
export function lowStockThresholdOf(product: Data, storeThreshold: number): number {
  const own = product.compiled_definition?.low_stock_threshold;
  return typeof own === 'number' && own >= 0 ? own : storeThreshold;
}

/** The stock state of one product, by its own low-stock number or the store's. */
export function productStockState(product: Data, storeThreshold: number): StockState {
  return stockState(product.stock_level, lowStockThresholdOf(product, storeThreshold));
}

export function productId(product: Data): number {
  return Number(product._links.self.href.split('?')[0].split('/').pop());
}

/** The name with inheritance applied, or an empty string for a product without one. */
export function productName(product: Data): string {
  return product.compiled_definition?.name || product.definition?.name || '';
}

/** A variant's option values as "S / Black", in the order its parent declares the options. */
export function variantLabel(parent: Data | null, variant: Data): string {
  const values = variant.option_values ?? {};
  const options = parent?.compiled_definition?.options ?? parent?.definition?.options ?? [];
  const names = options.length ? options.map(option => option.name) : Object.keys(values);
  const labels = names
    .filter(name => values[name] !== undefined)
    .map(name => {
      const option = options.find(o => o.name === name);
      const value = option?.values.find(v => v.value.toLowerCase() === values[name].toLowerCase());
      return value?.label || value?.value || values[name];
    });
  return labels.join(' / ');
}

/**
 * Groups variants under their product and sorts the groups by name, then SKU,
 * which is the order the rows are shown in. A product without a name sorts by
 * its SKU.
 */
export function groupProducts(products: readonly Data[]): ProductGroup[] {
  const groups = new Map<number, ProductGroup>();
  const active = products.filter(product => !product.deleted_at);

  for (const product of active) {
    if (product.product_type !== 'variant') {
      groups.set(productId(product), { product, variants: [] });
    }
  }

  for (const product of active) {
    if (product.product_type !== 'variant') continue;
    groups.get(product.inherit_from_id as number)?.variants.push(product);
  }

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const key = (group: ProductGroup) => productName(group.product) || group.product.sku;
  const result = Array.from(groups.values());
  result.forEach(group => group.variants.sort((a, b) => collator.compare(a.sku, b.sku)));
  return result.sort(
    (a, b) => collator.compare(key(a), key(b)) || collator.compare(a.product.sku, b.product.sku)
  );
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * What a variant costs: its own price, or its parent's plus the price changes
 * of its option values, which only apply to a variant that sets no price.
 */
export function variantPrice(parent: Data, variant: Data): number | null {
  const own = toNumber(variant.definition?.price);
  if (own !== null) return own;

  const base = toNumber(parent.compiled_definition?.price ?? parent.definition?.price);
  if (base === null) return null;

  const options = parent.compiled_definition?.options ?? parent.definition?.options ?? [];
  const values = variant.option_values ?? {};
  let price = base;
  for (const option of options) {
    const chosen = values[option.name]?.toLowerCase();
    const value = option.values.find(v => v.value.toLowerCase() === chosen);
    price += toNumber(value?.price_mod) ?? 0;
  }
  return price;
}

/** Lowest and highest price in the group; equal for a product without variants. */
export function priceRange(group: ProductGroup): [number, number] | null {
  const prices = group.variants.length
    ? group.variants.map(variant => variantPrice(group.product, variant))
    : [toNumber(group.product.compiled_definition?.price ?? group.product.definition?.price)];
  const known = prices.filter((price): price is number => price !== null);
  if (!known.length) return null;
  return [Math.min(...known), Math.max(...known)];
}

/**
 * The products in a group that hold stock of their own: the product itself,
 * its variants, or both. A template's stock is only where new products start.
 */
export function stockHolders(group: ProductGroup): Data[] {
  if (group.product.product_type === 'template') return [];
  return [group.product, ...group.variants].filter(
    product => product.stock_level !== null && product.stock_level !== undefined
  );
}

export function stockSummary(group: ProductGroup, threshold: number): StockSummary {
  const holders = stockHolders(group);
  const states = holders.map(holder => productStockState(holder, threshold));
  const units = holders.reduce((sum, holder) => sum + Math.max(0, holder.stock_level ?? 0), 0);
  const out = states.filter(state => state === 'out_of_stock').length;
  const low = states.filter(state => state === 'low_stock').length;

  let state: StockState = 'in_stock';
  if (!holders.length) state = 'untracked';
  else if (out === holders.length) state = 'out_of_stock';
  else if (out || low) state = 'low_stock';

  return { state, units, out, low, holders: holders.length };
}

export type SortColumn = 'name' | 'sku' | 'type' | 'price' | 'stock';

export type TypeFilter = 'all' | 'standalone' | 'parent' | 'template';

/** What the Type column says: a product with variants is a parent whatever the API calls it. */
export function groupType(group: ProductGroup): Exclude<TypeFilter, 'all'> {
  if (group.variants.length) return 'parent';
  return group.product.product_type === 'template' ? 'template' : 'standalone';
}

/**
 * The groups ordered by a column. Price orders by the lowest price and stock
 * by units, with products that have neither last in both directions. Ties
 * keep the order the groups came in, which is by name.
 */
export function sortGroups(
  groups: readonly ProductGroup[],
  column: SortColumn,
  descending: boolean
): ProductGroup[] {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const text: Record<'name' | 'sku' | 'type', (group: ProductGroup) => string> = {
    name: group => productName(group.product) || group.product.sku,
    sku: group => group.product.sku,
    type: groupType,
  };
  const amount = (group: ProductGroup): number | null => {
    if (column === 'price') return priceRange(group)?.[0] ?? null;
    const holders = stockHolders(group);
    if (!holders.length) return null;
    return holders.reduce((sum, holder) => sum + Math.max(0, holder.stock_level ?? 0), 0);
  };
  const sign = descending ? -1 : 1;

  return [...groups].sort((a, b) => {
    if (column === 'price' || column === 'stock') {
      const [x, y] = [amount(a), amount(b)];
      if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
      return sign * (x - y);
    }
    return sign * collator.compare(text[column](a), text[column](b));
  });
}

/** Whether the product's name or SKU, or one of its variants' SKUs, contains the query. */
export function matchesQuery(group: ProductGroup, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [productName(group.product), group.product.sku, ...group.variants.map(v => v.sku)].some(
    text => text.toLowerCase().includes(needle)
  );
}

export function formatPrice(amount: number, currency: string | null, lang: string): string {
  const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  try {
    return currency
      ? amount.toLocaleString(lang || undefined, { ...options, style: 'currency', currency })
      : amount.toLocaleString(lang || undefined, options);
  } catch {
    return amount.toFixed(2);
  }
}

export function formatPriceRange(
  range: [number, number] | null,
  currency: string | null,
  lang: string
): string {
  if (!range) return '';
  const [min, max] = range;
  const low = formatPrice(min, currency, lang);
  return min === max ? low : `${low} – ${formatPrice(max, currency, lang)}`;
}

const PAGE_SIZE = 200;

/** Every resource of a collection, page by page. */
export async function loadAll<T>(
  href: string,
  rel: string,
  fetchPage: (url: string) => Promise<unknown>
): Promise<T[]> {
  const resources: T[] = [];
  const url = new URL(href);
  url.searchParams.set('limit', String(PAGE_SIZE));

  for (let offset = 0; ; offset += PAGE_SIZE) {
    url.searchParams.set('offset', String(offset));
    const page = (await fetchPage(url.toString())) as {
      total_items?: number | string;
      _embedded?: Record<string, T[]>;
    };
    const items = page?._embedded?.[rel] ?? [];
    resources.push(...items);
    if (!items.length || offset + items.length >= Number(page.total_items ?? 0)) break;
  }

  return resources;
}

/** Every product of a `fx:products` collection, page by page. Callers leave out deleted ones. */
export function loadAllProducts(
  href: string,
  fetchPage: (url: string) => Promise<unknown>
): Promise<Data[]> {
  return loadAll<Data>(href, 'fx:products', fetchPage);
}

/** What the list needs of a product collection. */
export interface ListedCollection {
  id: number;
  name: string;
  /** Its place in the tree, such as `/coffee/blends`. */
  path: string;
}

/** The collections in tree order, each with its depth and its ancestors' names before its own. */
export function collectionTree(
  collections: readonly ListedCollection[]
): (ListedCollection & { depth: number; trail: string })[] {
  const names = new Map(collections.map(collection => [collection.path, collection.name]));
  // Segment by segment, so that /coffee-beans can't land between /coffee and /coffee/blends.
  const key = (collection: ListedCollection) => collection.path.split('/').join('\u0000');
  return [...collections]
    .sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0))
    .map(collection => {
      const slugs = collection.path.split('/').filter(Boolean);
      const trail = slugs.map((_, i) => names.get(`/${slugs.slice(0, i + 1).join('/')}`));
      return {
        ...collection,
        depth: Math.max(0, slugs.length - 1),
        trail: trail.filter(Boolean).join(' › ') || collection.name,
      };
    });
}

/** `''` is any collection, `'none'` is no collection, else a collection's id. */
export function matchesCollection(
  group: ProductGroup,
  filter: string,
  collections: readonly ListedCollection[]
): boolean {
  if (!filter) return true;
  const own = collections.find(collection => collection.id === group.product.collection_id);
  if (filter === 'none') return !own;
  const chosen = collections.find(collection => String(collection.id) === filter);
  if (!chosen || !own) return false;
  // A collection holds what its sub-collections hold.
  return own.path === chosen.path || own.path.startsWith(`${chosen.path}/`);
}
