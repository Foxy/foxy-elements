type FetchEventInit = EventInit & {
  request: Request;
  resolve: (response: Response) => void;
  reject: (err: unknown) => void;
};

export class FetchEvent extends Event {
  /** The `Request` the `EventTarget` intends to make. */
  readonly request: Request;

  private __resolve: (response: Response) => void;

  private __reject: (err: unknown) => void;

  constructor(type: 'fetch', init: FetchEventInit) {
    super(type, init);
    this.request = init.request;
    this.__reject = init.reject;
    this.__resolve = init.resolve;
  }

  /**
   * Prevent the `EventTarget`'s default fetch handling, and provide a promise for a response yourself.
   *
   * @param whenResponseReady
   * @example event.respondWith(Promise.resolve(new Response(null, { status: 500 })))
   */
  respondWith(whenResponseReady: Promise<Response>): void {
    this.preventDefault();
    this.stopImmediatePropagation();
    whenResponseReady.then(this.__resolve).catch(this.__reject);
  }
}
