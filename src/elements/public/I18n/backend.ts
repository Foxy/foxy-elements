import { BackendModule } from 'i18next';
import { FetchEvent } from '../NucleonElement/FetchEvent';

export const backend: BackendModule = {
  type: 'backend',

  init: () => void 0,

  read: (language, namespace, callback) => {
    const resolve = async (response: Response) => {
      const error = response.ok ? null : new Error(await response.text());
      const body = response.ok ? await response.json() : false;
      callback(error, body);
    };

    const reject = (error: unknown) => {
      const callbackError = error instanceof Error ? error : new Error(String(error));
      callback(callbackError, false);
    };

    const event = new FetchEvent('fetch', {
      bubbles: true,
      cancelable: true,
      composed: true,
      reject,
      request: new Request(`foxy://i18n/${namespace}/${language}`),
      resolve,
    });

    dispatchEvent(event);
    if (!event.defaultPrevented) fetch(event.request).then(resolve).catch(reject);
  },

  create: () => {
    throw new Error('foxy-i18n does not support resource creation');
  },
};
