import { LitElement, PropertyDeclarations, TemplateResult } from 'lit-element';
import i18next, { StringMap, TOptions } from 'i18next';

import HTTPBackend from 'i18next-http-backend';
import { cdn } from '../../../env';
import { format } from './format';

export class I18NElement extends LitElement {
  static readonly defaultNodeName = 'foxy-i18n';

  static readonly fallbackLng = 'en';

  static readonly i18next = i18next.createInstance().use(HTTPBackend);

  static onTranslationChange(handler: () => void): () => void {
    const events = ['initialized', 'removed', 'loaded', 'added'] as const;
    events.forEach(type => I18NElement.i18next.on(type, handler));
    return () => events.forEach(type => I18NElement.i18next.off(type, handler));
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
    this.__unsubscribe = I18NElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    return I18NElement.i18next.getFixedT(this.lang, this.ns)(this.key, this.opts);
  }

  updated(changedProperties: Map<keyof I18NElement, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('lang')) I18NElement.i18next.loadLanguages(this.lang);
    if (changedProperties.has('ns')) I18NElement.i18next.loadNamespaces(this.ns);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__unsubscribe?.();
  }
}

I18NElement.i18next.init({
  supportedLngs: ['nl', 'en', 'es', 'sv', 'fi', 'fr', 'de', 'zh', 'no', 'it'],
  interpolation: { format },
  fallbackLng: I18NElement.fallbackLng,
  fallbackNS: 'global',
  defaultNS: 'global',
  backend: { loadPath: `${cdn}/translations/{{ns}}/{{lng}}.json` },
  ns: ['global'],
});
