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
            const body = await this.__response.text();
            this.__response = new Response(body, this.__response);
            intercept(new Response(body, this.__response));
          } else {
            this.__interceptors.push(intercept);
          }
        },
        handle: async (fetch: Window['fetch']): Promise<void> => {
          this.stopImmediatePropagation();
          this.preventDefault();

          try {
            const response = await fetch(...init);
            const body = await response.text();

            this.__response = new Response(body, response);
            this.__interceptors.forEach(intercept => intercept(new Response(body, response)));

            resolve(new Response(body, response));
          } catch (err) {
            reject(err);
          }
        },
      },
    });
  }
}
