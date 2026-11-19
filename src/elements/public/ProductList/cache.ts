import type { ListedCollection } from './listing';
import type { Data, ProductDefinition } from '../ProductForm/types';

/** What the list keeps of its last load, to show while the next one is on its way. */
export interface CachedList {
  products: Data[];
  collections: ListedCollection[];
}

const PREFIX = 'foxy-product-list:';

// In characters. Browsers allow about 5 million per origin, shared with everything else stored there.
const MAX_LENGTH = 1_500_000;

function keys(storage: Storage): string[] {
  return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
    (key): key is string => !!key?.startsWith(PREFIX)
  );
}

// Only what a row shows or is sorted, searched and filtered by: a description or
// a product's other images would use up the room for no benefit.
function slimDefinition(definition: ProductDefinition | null | undefined) {
  if (!definition) return definition;
  const { name, price, options, images, low_stock_threshold } = definition;
  return { name, price, options, images: images?.slice(0, 1), low_stock_threshold };
}

function slim(product: Data): Data {
  return {
    ...product,
    definition: slimDefinition(product.definition),
    compiled_definition: slimDefinition(product.compiled_definition),
  } as Data;
}

/** The copy kept for this collection URL, or null. Storage can be missing, full or refuse access. */
export function readCachedList(storage: Storage, href: string): CachedList | null {
  try {
    const stored = JSON.parse(storage.getItem(PREFIX + href) ?? 'null') as CachedList | null;
    return Array.isArray(stored?.products) && Array.isArray(stored?.collections) ? stored : null;
  } catch {
    return null;
  }
}

/** Keeps one list at a time, so that a visit to another store's products replaces the copy. */
export function writeCachedList(storage: Storage, href: string, list: CachedList): void {
  try {
    clearCachedLists(storage);
    const value = JSON.stringify({ ...list, products: list.products.map(slim) });
    if (value.length <= MAX_LENGTH) storage.setItem(PREFIX + href, value);
  } catch {
    // The list then loads without a copy to show first.
  }
}

/** Removes every copy. The page that gave the list a storage calls this when its user signs out. */
export function clearCachedLists(storage: Storage): void {
  try {
    keys(storage).forEach(key => storage.removeItem(key));
  } catch {
    // Nothing was stored if storage can't be reached.
  }
}
