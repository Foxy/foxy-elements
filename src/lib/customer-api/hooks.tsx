import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useSyncExternalStore } from "react";
import type { API } from "@foxy.io/sdk/customer";
import { RequestCache, serialiseQuery, type CacheEntry } from "./cache";
import { assertReadSucceeded, type ReadResponse } from "./read";
import { assertWriteSucceeded, WriteError, type WriteResponse } from "./write";

/**
 * The shape link enrichment gives every `_links` entry: the original `href`
 * plus request methods bound to an already-resolved node.
 *
 * `get` and `patch` resolve with the SDK's `Response`, which extends the
 * native one and therefore reports `ok` and `status`. The type says so
 * because the status is the only thing that distinguishes a resolved read or
 * a saved write from a rejected one — the SDK never throws on a 4xx.
 */
export type FollowableLink<T> = {
  href: string;
  get(query?: Record<string, unknown>): Promise<ReadResponse<T>>;
  patch?(body: unknown): Promise<WriteResponse>;
};

type ApiContextValue = { api: API; cache: RequestCache };

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider(props: {
  api: API;
  cache: RequestCache;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ api: props.api, cache: props.cache }),
    [props.api, props.cache],
  );

  return <ApiContext value={value}>{props.children}</ApiContext>;
}

export function useApi(): ApiContextValue {
  const value = useContext(ApiContext);
  if (!value) throw new Error("useApi must be used inside <ApiProvider>.");
  return value;
}

const IDLE: CacheEntry<never> = { data: null, error: null, isLoading: false };

function useEntry<T>(
  link: FollowableLink<T> | null,
  query: Record<string, unknown> | undefined,
): { entry: CacheEntry<T>; key: string | null; cache: RequestCache } {
  const { cache } = useApi();
  const key = link ? `${link.href}|${serialiseQuery(query)}` : null;

  const subscribe = useCallback(
    (listener: () => void) => (key ? cache.subscribe(key, listener) : () => {}),
    [cache, key],
  );

  const getSnapshot = useCallback(() => {
    if (!link || !key) return IDLE as CacheEntry<T>;
    return cache.read<T>(key, async () => {
      const response = await link.get(query);
      // The SDK resolves on a 4xx, so the status is the only thing that
      // distinguishes a resource from an error body.
      assertReadSucceeded(response);
      return response.json();
    });
    // `query` is read through `key`, which already encodes it.
  }, [cache, key, link, query]);

  return { entry: useSyncExternalStore(subscribe, getSnapshot), key, cache };
}

export function useResource<T>(
  link: FollowableLink<T> | null,
  query?: Record<string, unknown>,
) {
  const { entry, key, cache } = useEntry<T>(link, query);

  const refresh = useCallback(() => {
    if (key) cache.invalidate(key);
  }, [cache, key]);

  const patch = useCallback(
    async (body: Partial<T>) => {
      if (!link?.patch) throw new WriteError("This resource is not writable.");
      // The SDK resolves on a 4xx, so the response has to be inspected before
      // this can report a save.
      assertWriteSucceeded(await link.patch(body));
      refresh();
    },
    [link, refresh],
  );

  return { ...entry, refresh, patch };
}

type CollectionPage = {
  total_items?: number;
  offset?: number;
  limit?: number;
  _embedded?: Record<string, unknown[]>;
};

export function useCollection<T>(
  link: FollowableLink<CollectionPage> | null,
  query?: Record<string, unknown>,
) {
  const limit = (query?.limit as number | undefined) ?? 20;
  const [pagedHref, setPagedHref] = useState(link?.href ?? null);
  const [rawOffset, setRawOffset] = useState(0);

  const currentHref = link?.href ?? null;
  const hrefChanged = currentHref !== pagedHref;

  // The offset belongs to the collection it was paged through. When the link
  // changes — FX-275's Active/Inactive toggle is exactly this — page 3 of the
  // old collection is not page 3 of the new one, and may not exist at all.
  //
  // `offset` is *derived* rather than read back from state on purpose. Calling
  // a setter during render re-runs the component, but the rest of this render
  // body still executes first — so reading `rawOffset` here would let
  // `useEntry` below fire a request for the stale page before the re-run
  // corrects it. Deriving means the very first pass already uses 0.
  const offset = hrefChanged ? 0 : rawOffset;

  if (hrefChanged) {
    setPagedHref(currentHref);
    setRawOffset(0);
  }

  const pageQuery = useMemo(
    () => ({ ...query, limit, offset }),
    [query, limit, offset],
  );

  const { entry, key, cache } = useEntry<CollectionPage>(link, pageQuery);

  // The customer API returns exactly one embedded collection per page, and its
  // curie varies by resource. Take the first rather than hardcoding curies.
  const items = useMemo(() => {
    const embedded = entry.data?._embedded ?? {};
    return (Object.values(embedded)[0] ?? []) as T[];
  }, [entry.data]);

  const totalItems = entry.data?.total_items ?? 0;

  // `error` and `isLoading` are listed rather than spread: spreading `entry`
  // would also publish `data`, the raw HAL page, which is not part of this
  // hook's surface and would become a contract the moment anything read it.
  return {
    error: entry.error,
    isLoading: entry.isLoading,
    items,
    totalItems,
    offset,
    limit,
    loadNext: useCallback(
      () =>
        setRawOffset((current) =>
          current + limit < totalItems ? current + limit : current,
        ),
      [limit, totalItems],
    ),
    loadPrev: useCallback(
      () => setRawOffset((current) => Math.max(0, current - limit)),
      [limit],
    ),
    refresh: useCallback(() => {
      if (key) cache.invalidate(key);
    }, [cache, key]),
  };
}
