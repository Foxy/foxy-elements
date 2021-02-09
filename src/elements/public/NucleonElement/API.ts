import { API as CoreAPI } from '@foxy.io/sdk/core';
import { FetchEvent } from './FetchEvent';

export class API extends CoreAPI<any> {
  constructor(target: EventTarget) {
    super({
      base: new URL(document.baseURI),
      fetch: (...args: Parameters<Window['fetch']>): Promise<Response> =>
        new Promise<Response>((resolve, reject) => {
          const request = new Request(...args);

          request.headers.set('Content-Type', 'application/json');
          request.headers.set('FOXY-API-VERSION', '1');

          const event = new FetchEvent('fetch', {
            cancelable: true,
            composed: true,
            bubbles: true,
            request,
            resolve,
            reject,
          });

          target.dispatchEvent(event);
          if (!event.defaultPrevented) fetch(request).then(resolve).catch(reject);
        }),
    });
  }
}
