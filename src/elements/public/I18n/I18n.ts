import { LitElement, PropertyDeclarations, TemplateResult } from 'lit-element';
import i18next, { StringMap, TOptions } from 'i18next';

import { FetchEvent } from '../NucleonElement/FetchEvent';
import { backend } from './backend';
import { format } from './format/index';

/**
 * Custom element for effortless localization with i18next.
 *
 * @fires I18n#fetch - Instance of `I18n.FetchEvent`. Emitted before each translation request.
 *
 * @element foxy-i18n
 * @since 1.1.0
 */
export class I18n extends LitElement {
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

  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      options: { type: Object },
      lang: { type: String },
      key: { type: String },
      ns: { type: String },
    };
  }

  /**
   * Optional i18next translation function
   * [options](https://www.i18next.com/translation-function/essentials#overview-options).
   */
  options: TOptions<StringMap> = {};

  /**
   * Optional language to translate `element.key` into (ISO 639-1).
   * Default and fallback: `en`.
   */
  lang = 'en';

  /**
   * Optional key to translate. Empty by default (renders nothing).
   * See [i18next docs](https://www.i18next.com/translation-function/essentials#accessing-keys) for more info.
   */
  key = '';

  /**
   * Optional namespace to use translations from. Default and fallback: `shared`.
   * To provide multiple namespaces, separate them with a space.
   */
  ns = 'shared';

  private __unsubscribe?: () => void;

  /** @readonly */
  connectedCallback(): void {
    super.connectedCallback();
    this.__unsubscribe = I18n.onTranslationChange(() => this.requestUpdate());
  }

  /** @readonly */
  render(): TemplateResult {
    return I18n.i18next.getFixedT(this.lang, this.ns.split(' '))(this.key, this.options);
  }

  /** @readonly */
  updated(changedProperties: Map<keyof I18n, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('lang')) I18n.i18next.loadLanguages(this.lang);
    if (changedProperties.has('ns')) I18n.i18next.loadNamespaces(this.ns);
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
