import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSyncExternalStore } from "react";
import type { API } from "@foxy.io/sdk/customer";
import { RequestCache, serialiseQuery, type CacheEntry } from "./cache";
import { assertReadSucceeded, type ReadResponse } from "./read";
import { UnauthenticatedError } from "./session";
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

type ApiContextValue = {
  api: API;
  cache: RequestCache;
  /**
   * Called when the API refuses a request because the session is gone. Reads
   * route through `UnauthenticatedError`; writes call this directly, because a
   * 401 on a write carrying a password means the password was wrong, not the
   * session — only the caller knows which it sent.
   */
  onUnauthenticated: () => void;
};

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider(props: {
  api: API;
  cache: RequestCache;
  onUnauthenticated: () => void;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      api: props.api,
      cache: props.cache,
      onUnauthenticated: props.onUnauthenticated,
    }),
    [props.api, props.cache, props.onUnauthenticated],
  );

  return <ApiContext value={value}>{props.children}</ApiContext>;
}

export function useApi(): ApiContextValue {
  const value = useContext(ApiContext);
  if (!value) throw new Error("useApi must be used inside <ApiProvider>.");
  return value;
}

const IDLE: CacheEntry<never> = { data: null, error: null, isLoading: false };

/**
 * `skipUnauthenticatedRouting` opts a read out of the routing effect below.
 * The one read this exists for is `view.tsx`'s `customer_portal_settings`
 * fetch: it is public and unrelated to the customer's session (see that
 * file's doc comment), it runs on every screen including sign-in, and a
 * misconfigured store answering it with 401/403 must not clear a signed-in
 * customer's session and bounce them out.
 */
type EntryOptions = { skipUnauthenticatedRouting?: boolean };

function useEntry<T>(
  link: FollowableLink<T> | null,
  query: Record<string, unknown> | undefined,
  options?: EntryOptions,
): {
  entry: CacheEntry<T>;
  key: string | null;
  cache: RequestCache;
  isUnauthenticated: boolean;
} {
  const { cache, onUnauthenticated } = useApi();
  const skipRouting = options?.skipUnauthenticatedRouting ?? false;
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

  const entry = useSyncExternalStore(subscribe, getSnapshot);
  const isUnauthenticated = entry.error instanceof UnauthenticatedError;

  // Centralised so every `useResource`/`useCollection` consumer inherits
  // this — FX-276 and FX-277 will add more collections, and this used to be
  // wired up only for the account screen's own resource (see `account.tsx`),
  // which left every other read stuck retrying a session that can never come
  // back. Routing has to happen in an effect, never during render: `error`
  // is read during render, and calling `onUnauthenticated` from there would
  // update the ancestor that owns the current screen mid-render.
  //
  // `isUnauthenticated` only flips true->false again when the cache entry
  // itself changes (a new key, or a `refresh()`/`invalidate()` that produces
  // a fresh entry object) -- not on every render -- so this fires once per
  // rejection rather than looping.
  useEffect(() => {
    if (isUnauthenticated && !skipRouting) onUnauthenticated();
  }, [isUnauthenticated, skipRouting, onUnauthenticated]);

  return { entry, key, cache, isUnauthenticated };
}

export function useResource<T>(
  link: FollowableLink<T> | null,
  query?: Record<string, unknown>,
  options?: EntryOptions,
) {
  const { entry, key, cache, isUnauthenticated } = useEntry<T>(
    link,
    query,
    options,
  );

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

  return { ...entry, refresh, patch, isUnauthenticated };
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

  // A page belongs to a (link, query) pair, not to the link alone: a caller
  // that keeps the same link and swaps only the query — FX-275's
  // Active/Inactive toggle changes `filters` but not `fx:subscriptions` —
  // points at a different collection just as surely as a different href, and
  // page 3 of one may not exist in the other. `query` here is the caller's
  // query, before `offset`/`limit` are folded in below, so paging within one
  // collection never changes this key.
  const collection = `${link?.href ?? ""}|${serialiseQuery(query)}`;
  const [pagedCollection, setPagedCollection] = useState(collection);
  const [rawOffset, setRawOffset] = useState(0);

  const collectionChanged = collection !== pagedCollection;

  // `offset` is *derived* rather than read back from state on purpose. Calling
  // a setter during render re-runs the component, but the rest of this render
  // body still executes first — so reading `rawOffset` here would let
  // `useEntry` below fire a request for the stale page before the re-run
  // corrects it. Deriving means the very first pass already uses 0.
  const offset = collectionChanged ? 0 : rawOffset;

  if (collectionChanged) {
    setPagedCollection(collection);
    setRawOffset(0);
  }

  const pageQuery = useMemo(
    () => ({ ...query, limit, offset }),
    [query, limit, offset],
  );

  const { entry, key, cache, isUnauthenticated } = useEntry<CollectionPage>(
    link,
    pageQuery,
  );

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
    isUnauthenticated,
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
