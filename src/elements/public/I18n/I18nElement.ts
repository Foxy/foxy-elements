import { LitElement, PropertyDeclarations, TemplateResult } from 'lit-element';
import i18next, { StringMap, TOptions } from 'i18next';

import { backend } from './backend';
import { format } from './format/index';

export class I18nElement extends LitElement {
  static readonly fallbackLng = 'en';

  static readonly i18next = i18next.createInstance().use(backend);

  static onTranslationChange(handler: () => void): () => void {
    const events = ['initialized', 'removed', 'loaded', 'added'] as const;
    events.forEach(type => I18nElement.i18next.on(type, handler));
    return () => events.forEach(type => I18nElement.i18next.off(type, handler));
  }

  static get properties(): PropertyDeclarations {
    return {
      lang: { type: String },
      opts: { attribute: false },
      key: { type: String },
      ns: { type: String },
    };
  }

  lang = '';

  opts: TOptions<StringMap> = {};

  key = '';

  ns = '';

  private __unsubscribe?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__unsubscribe = I18nElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    return I18nElement.i18next.getFixedT(this.lang, this.ns)(this.key, this.opts);
  }

  updated(changedProperties: Map<keyof I18nElement, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('lang')) I18nElement.i18next.loadLanguages(this.lang);
    if (changedProperties.has('ns')) I18nElement.i18next.loadNamespaces(this.ns);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__unsubscribe?.();
  }
}

I18nElement.i18next.init({
  supportedLngs: ['nl', 'en', 'es', 'sv', 'fi', 'fr', 'de', 'zh', 'no', 'it'],
  interpolation: { format },
  fallbackLng: I18nElement.fallbackLng,
  fallbackNS: 'global',
  defaultNS: 'global',
  ns: ['global'],
});
