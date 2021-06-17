import { API as CoreAPI } from '@foxy.io/sdk/core';
import { FetchEvent } from './FetchEvent';

/**
 * Universal [API](https://sdk.foxy.dev/classes/_core_index_.api.html) client
 * that dispatches the `fetch` event on an element before each request. It bubbles, crosses
 * shadow DOM boundaries, and if cancelled, the target element will not make the request
 * and instead will wait for a response from `event.respondWith()`.
 */
export class API extends CoreAPI<any> {
  /** Instances of this event are dispatched on an element before each request. */
  static readonly FetchEvent = FetchEvent;

  /** @param target `EventTarget` to dispatch `fetch` events on (e.g. element or window). */
  constructor(target: EventTarget) {
    super({
      base: new URL(document.baseURI),
      fetch: (...args: Parameters<Window['fetch']>): Promise<Response> =>
        new Promise<Response>((resolve, reject) => {
          const request = typeof args[0] === 'string' ? new API.WHATWGRequest(...args) : args[0];

          request.headers.set('Content-Type', 'application/json');
          request.headers.set('FOXY-API-VERSION', '1');

          const event = new FetchEvent('fetch', {
            bubbles: true,
            cancelable: true,
            composed: true,
            reject,
            request,
            resolve,
          });

          target.dispatchEvent(event);
          if (!event.defaultPrevented) fetch(request).then(resolve).catch(reject);
        }),
    });
  }
}
