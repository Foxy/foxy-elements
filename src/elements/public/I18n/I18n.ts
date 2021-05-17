import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';
import i18next, { StringMap, TOptions } from 'i18next';

import { FetchEvent } from '../NucleonElement/FetchEvent';
import { TranslatableMixin } from '../../../mixins/translatable';
import { backend } from './backend';
import { format } from './format';

/**
 * Custom element for effortless localization with i18next.
 *
 * @fires I18n#fetch - Instance of `I18n.FetchEvent`. Emitted before each translation request.
 *
 * @element foxy-i18n
 * @since 1.1.0
 */
export class I18n extends TranslatableMixin(LitElement, '') {
  /** Instances of this event are dispatched on an element before each translation request. */
  static readonly FetchEvent = FetchEvent;

  /** Shared [i18next](https://www.i18next.com) instance for all I18n elements. */
  static readonly i18next = i18next.createInstance().use(backend);

  /**
   * Registers a joint event listener for all i18next events that indicate
   * the availability of new translations. If you're using `I18n.i18next` to localize
   * your components, this function will call the provided handler every time an update is needed.
   *
   * @param handler Callback to invoke when translation changes.
   * @example const unsubscribe = I18n.onTranslationChange(triggerUpdate);
   */
  static onTranslationChange(handler: () => void): () => void {
    const i18nextEvents = ['initialized', 'loaded'] as const;
    const storeEvents = ['removed', 'added'] as const;

    i18nextEvents.forEach(type => I18n.i18next.on(type, handler));
    storeEvents.forEach(type => I18n.i18next.store.on(type, handler));

    return () => {
      i18nextEvents.forEach(type => I18n.i18next.off(type, handler));
      storeEvents.forEach(type => I18n.i18next.store.off(type, handler));
    };
  }

  /**
   * Registers a global event listener that calls `handler` every time an i18next resource
   * is downloaded by `foxy-i18n`. Allows devs to specify resource location and/or fetch it
   * via a different channel (e.g. web sockets or using a localization SaaS).
   *
   * @param handler Callback to invoke on resource fetch.
   * @example const unsubscribe = I18n.onResourceFetch((ns, lang) => fetch(`path/to/${ns}/${lang}`));
   */
  static onResourceFetch(handler: (ns: string, lang: string) => Promise<Response>): () => void {
    const handleFetch = (evt: unknown) => {
      if (evt instanceof FetchEvent && evt.request.url.startsWith('foxy://i18n/')) {
        const [lang, ns] = evt.request.url.split('/').reverse();
        evt.respondWith(handler(ns, lang));
      }
    };

    addEventListener('fetch', handleFetch);
    return () => removeEventListener('fetch', handleFetch);
  }

  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Object },
      key: { type: String },
    };
  }

  /**
   * Optional i18next translation function
   * [options](https://www.i18next.com/translation-function/essentials#overview-options).
   */
  options: TOptions<StringMap> = {};

  /**
   * Optional key to translate. Empty by default (renders nothing).
   * See [i18next docs](https://www.i18next.com/translation-function/essentials#accessing-keys) for more info.
   */
  key = '';

  private __unsubscribe?: () => void;

  /** @readonly */
  connectedCallback(): void {
    super.connectedCallback();
    this.__unsubscribe = I18n.onTranslationChange(() => this.requestUpdate());
  }

  /** @readonly */
  render(): TemplateResult {
    return html`${this.t(this.key, { ...this.options, lng: this.lang })}`;
  }

  /** @readonly */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__unsubscribe?.();
  }
}

I18n.i18next.init({
  interpolation: { format },
  fallbackLng: 'en',
  fallbackNS: 'shared',
  defaultNS: 'shared',
  ns: ['shared'],
});
