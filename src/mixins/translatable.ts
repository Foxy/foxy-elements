import i18next, { FormatFunction, i18n, TFunction } from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { property, internalProperty } from 'lit-element';
import { cdn, version } from '../env';
import { Themeable } from './themeable';
import { TranslationEvent } from '../events/translation';

interface CacheItem {
  i18n: i18n;
  whenReady: Promise<TFunction>;
}

/**
 * One of the base classes for each rel-specific element in the collection,
 * providing internationalization capabilities to the derived components.
 * This class MUST NOT be used on its own (hence the `abstract` keyword) or
 * referenced externally (outside of the package).
 */
export abstract class Translatable extends Themeable {
  private static __i18nInstanceCache = new Map<string, CacheItem>();

  private static __createI18nInstance(defaultNS: string, fallbackNS: string) {
    const ns = [...new Set([defaultNS, fallbackNS])];
    const key = ns.join();

    if (!this.__i18nInstanceCache.has(key)) {
      const i18n = i18next.createInstance();

      i18n.use(LanguageDetector);
      i18n.use(ChainedBackend);

      const whenReady = i18n.init({
        supportedLngs: ['en'],
        interpolation: { format: this.__f },
        fallbackLng: 'en',
        fallbackNS,
        defaultNS,
        backend: {
          backends: [LocalStorageBackend, HttpApi],
          backendOptions: [
            { defaultVersion: version },
            { loadPath: `${cdn}/translations/{{ns}}/{{lng}}.json` },
          ],
        },
        ns,
      });

      this.__i18nInstanceCache.set(key, { i18n, whenReady });
    }

    return this.__i18nInstanceCache.get(key)!;
  }

  /**
   * i18next formatter that converts given value to lowecase.
   * @see https://www.i18next.com/translation-function/formatting
   */
  private static __fLowercase: FormatFunction = (value): string => {
    return value.toLowerCase();
  };

  /**
   * i18next formatter that presents an array of serializable items
   * as `[0], [1], [...] and [length - 1]`. For example, given an array like
   * the following: `['a', 'b', 'c']`, it will output `'a, b and c'`.
   * @see https://www.i18next.com/translation-function/formatting
   */
  private static __fList: FormatFunction = (value): string => {
    return (value as string[])
      .map((v, i, a) => {
        if (i === 0) return v;
        const part = i === a.length - 1 ? ` {{and}}` : ',';
        return `${part} ${v}`;
      })
      .join('');
  };

  /**
   * Chooses the right i18next formatter for the given template.
   * @see https://www.i18next.com/translation-function/formatting
   */
  private static __f: FormatFunction = (...args): string => {
    const [value, format] = args;

    switch (format) {
      case 'lowercase':
        return Translatable.__fLowercase(...args);
      case 'list':
        return Translatable.__fList(...args);
      default:
        return value;
    }
  };

  protected readonly _i18n: i18n;
  protected readonly _whenI18nReady: Promise<TFunction>;

  @internalProperty()
  protected _isI18nReady = false;

  /**
   * Creates class instance and starts loading missing translations
   * in background. Triggers render when ready.
   *
   * @param defaultNS Name of the folder translations for this component are stored in. Usually a node name without vendor prefix.
   * @param fallbackNS Global (default) namespace for common translations.
   */
  constructor(defaultNS = 'global', fallbackNS = 'global') {
    super();

    const { whenReady, i18n } = Translatable.__createI18nInstance(defaultNS, fallbackNS);

    this._i18n = i18n;
    this._whenI18nReady = whenReady;

    whenReady.then(() => {
      this._isI18nReady = true;
      this.requestUpdate();
      this.dispatchEvent(new TranslationEvent({ lang: this.lang }));
    });
  }

  /**
   * Contains the language this component presents its translatable
   * content in. Assigning a value to this property will load new
   * translations in background and trigger a render afterwards.
   */
  @property({ type: String, reflect: true, noAccessor: true })
  public get lang(): string {
    return this._i18n.language;
  }
  public set lang(value: string) {
    this._whenI18nReady
      .then(() => this._i18n.changeLanguage(value))
      .then(() => {
        this.requestUpdate();
        this.dispatchEvent(new TranslationEvent({ lang: this.lang }));
      });
  }
}
