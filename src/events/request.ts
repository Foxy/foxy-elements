import { cloneDeep, memoize } from 'lodash-es';

import traverse from 'traverse';

export class UnhandledRequestError extends Error {
  constructor() {
    super(
      'Unhandled request detected. Please add a request handler to connect this component to a backend.'
    );
  }
}

export interface RequestEventPayload<TSource extends HTMLElement> {
  init: Parameters<Window['fetch']>;
  source: TSource;
  handle: (fetch: Window['fetch']) => Promise<void>;
  onResponse: (intercept: (response: Response) => void) => void;
}

export interface RequestSendInit<TSource extends HTMLElement> {
  source: TSource;
  init: Parameters<Window['fetch']>;
}

export interface RequestEventInit<TSource extends HTMLElement> extends RequestSendInit<TSource> {
  resolve: (response: Response) => void;
  reject: (error: Error) => void;
}

export class RequestEvent<TSource extends HTMLElement = HTMLElement> extends CustomEvent<
  RequestEventPayload<TSource>
> {
  public static emit<TSource extends HTMLElement>(
    params: RequestSendInit<TSource>
  ): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      const event = new RequestEvent<HTMLElement>({ resolve, reject, ...params });
      if (params.source.dispatchEvent(event)) reject(new UnhandledRequestError());
    });
  }

  /**
   * Constructs a Map from the response body where keys are embedded (or top-level) resource URIs
   * and values are the properties from those resources (excluding `_links` and `_embedded`).
   */
  public getPatch = memoize<() => Promise<Map<string, any> | null>>(async () => {
    const method = this.detail.init[1]?.method?.toUpperCase() ?? 'GET';
    if (method === 'DELETE' || !this.__response) return null;

    const json = await this.__response.clone().json();
    const walker = traverse(json);

    return walker.reduce(function (patch, node) {
      if (!node?._links?.first && node?._links?.self) {
        const props = Object.entries(node).reduce(
          (p, [k, v]) => (k[0] === '_' ? p : { ...p, [k]: cloneDeep(v) }),
          {} as any
        );

        patch.set(node?._links?.self?.href, props);
      }

      return patch;
    }, new Map<string, any>());
  });

  private __interceptors: ((response: Response) => void)[] = [];

  private __response: Response | null = null;

  public constructor({ source, resolve, reject, init }: RequestEventInit<TSource>) {
    super('request', {
      cancelable: true,
      composed: true,
      bubbles: true,
      detail: {
        init,
        source,
        onResponse: async intercept => {
          if (this.__response) {
            intercept(this.__response.clone());
          } else {
            this.__interceptors.push(intercept);
          }
        },
        handle: async (fetch: Window['fetch']): Promise<void> => {
          this.stopImmediatePropagation();
          this.preventDefault();

          try {
            this.__response = await fetch(...init);
            this.getPatch.cache.clear?.();
            this.__interceptors.forEach(intercept => intercept(this.__response!.clone()));
            resolve(this.__response.clone());
          } catch (err) {
            reject(err);
          }
        },
      },
    });
  }
}
