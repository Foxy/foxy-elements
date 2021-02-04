type FetchEventInit = EventInit & {
  request: Request;
  resolve: (response: Response) => void;
  reject: (err: unknown) => void;
};

export class FetchEvent extends Event {
  readonly request: Request;

  private __resolve: (response: Response) => void;

  private __reject: (err: unknown) => void;

  constructor(type: 'fetch', init: FetchEventInit) {
    super(type, init);
    this.request = init.request;
    this.__reject = init.reject;
    this.__resolve = init.resolve;
  }

  respondWith(whenResponseReady: Promise<Response>): void {
    this.preventDefault();
    this.stopImmediatePropagation();
    whenResponseReady.then(this.__resolve).catch(this.__reject);
  }
}
