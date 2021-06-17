export class UnhandledRequestError extends Error {
  constructor() {
    super(
      'Unhandled request detected. Please add a request handler to connect this component to a backend.'
    );
  }
}

export interface RequestEventPayload<TSource extends HTMLElement> {
  source: TSource;
  handle: (fetch: Window['fetch']) => Promise<void>;
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
      const event = new RequestEvent<HTMLElement>({ reject, resolve, ...params });
      if (params.source.dispatchEvent(event)) reject(new UnhandledRequestError());
    });
  }

  public constructor({ source, resolve, reject, init }: RequestEventInit<TSource>) {
    super('request', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        source,
        handle: async (fetch: Window['fetch']): Promise<void> => {
          this.stopImmediatePropagation();
          this.preventDefault();

          try {
            resolve(await fetch(...init));
          } catch (err) {
            reject(err);
          }
        },
      },
    });
  }
}
