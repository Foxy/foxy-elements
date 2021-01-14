import { cloneDeep, memoize } from 'lodash-es';

import traverse from 'traverse';

export class UnhandledRequestError extends Error {
  constructor() {
    super(
      'Unhandled request detected. Please add a request handler to connect this component to a backend.'
    );
  }
}

export interface RequestEventPayload {
  init: Parameters<Window['fetch']>;
  source: HTMLElement;
  handle: (fetch: Window['fetch']) => Promise<void>;
  onResponse: (intercept: (response: Response) => void) => void;
}

export interface RequestSendInit {
  source: HTMLElement;
  init: Parameters<Window['fetch']>;
}

export interface RequestEventInit extends RequestSendInit {
  resolve: (response: Response) => void;
  reject: (error: Error) => void;
}

function generalizeURL(value: string) {
  const url = new URL(value);
  url.search = '';
  url.hash = '';
  return url.toString();
}

export class RequestEvent extends CustomEvent<RequestEventPayload> {
  public static emit(params: RequestSendInit): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      const event = new RequestEvent({ resolve, reject, ...params });
      if (params.source.dispatchEvent(event)) reject(new UnhandledRequestError());
    });
  }

  /**
   * Constructs a Map from the response body where keys are embedded (or top-level) resource URIs
   * and values are the properties from those resources (excluding `_links` and `_embedded`).
   */
  public getPatch = memoize<() => Promise<Map<string, any> | null>>(async () => {
    if (!this.__response?.ok) return null;

    const json = await this.__response.clone().json();
    const patch = new Map<string, any>();
    const method = this.detail.init[1]?.method?.toUpperCase() ?? 'GET';

    traverse(json).forEach(function (node) {
      if (node?._links?.first || !node?._links?.self) return;

      const props = Object.entries(node).reduce(
        (p, [k, v]) => (k[0] === '_' ? p : { ...p, [k]: cloneDeep(v) }),
        {} as any
      );

      patch.set(generalizeURL(node?._links?.self?.href), props);
    });

    if (method === 'DELETE') {
      const url = generalizeURL(this.detail.init[0].toString());
      patch.set(url, null);
    }

    return patch;
  });

  private __interceptors: ((response: Response) => void)[] = [];

  private __response: Response | null = null;

  public constructor({ source, resolve, reject, init }: RequestEventInit) {
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

    const method = init[1]?.method ?? 'GET';
    const url = init[0].toString();

    console.log(method, url, 'EMITTED BY', source.nodeName);
  }
}
