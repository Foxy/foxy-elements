import i18next, { FormatFunction, i18n, TFunction } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { cdn } from '../env';
import { Themeable } from './themeable';
import { property } from 'lit-element';

/**
 * One of the base classes for each rel-specific element in the collection,
 * providing internationalization capabilities to the derived components.
 * This class MUST NOT be used on its own (hence the `abstract` keyword) or
 * referenced externally (outside of the package).
 */
export abstract class Translatable extends Themeable {
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

  private static __whenI18NReady: Promise<TFunction>;
  private static __isI18NReady = false;
  private static __i18n: i18n;

  private static __initI18N() {
    this.__i18n = i18next.createInstance();

    this.__i18n.use(LanguageDetector);
    this.__i18n.use(HttpApi);

    this.__whenI18NReady = this.__i18n.init({
      supportedLngs: ['nl', 'en', 'es', 'sv', 'fi', 'fr', 'de', 'zh', 'no', 'it'],
      interpolation: { format: Translatable.__f },
      fallbackLng: 'en',
      fallbackNS: 'global',
      defaultNS: 'global',
      detection: {
        order: ['querystring', 'navigator', 'htmlTag', 'path', 'subdomain'],
        caches: [],
      },
      backend: {
        loadPath: `${cdn}/translations/{{ns}}/{{lng}}.json`,
      },
    });

    this.__whenI18NReady.then(() => (this.__isI18NReady = true));

    return this.__i18n;
  }

  private __lang = (this._i18n.options.fallbackLng as string[])[0];
  private __ns = (this._i18n.options.fallbackNS as string[])[0];

  protected get _i18n(): i18n {
    return Translatable.__i18n ?? Translatable.__initI18N();
  }

  protected get _whenI18nReady(): Promise<TFunction> {
    return Translatable.__whenI18NReady;
  }

  protected get _isI18nReady(): boolean {
    return Translatable.__isI18NReady;
  }

  /**
   * Creates class instance and starts loading missing translations
   * in background. Triggers render when ready.
   *
   * @param defaultNS Name of the folder translations for this component are stored in. Usually a node name without vendor prefix.
   */
  constructor(defaultNS = 'global') {
    super();
    this.ns = defaultNS;
    this._whenI18nReady.then(() => this.requestUpdate());
  }

  /**
   * Contains the language this component presents its translatable
   * content in. Assigning a value to this property will load new
   * translations in background and trigger a render afterwards.
   */
  @property({ type: String, noAccessor: true })
  public get lang(): string {
    return this.__lang;
  }

  public set lang(value: string) {
    if (!value || value === 'undefined') return;
    this.__lang = value;
    this._i18n.loadLanguages(value).then(() => {
      if (this.__lang === value) this.requestUpdate();
    });
  }

  @property({ type: String, noAccessor: true })
  public get ns(): string {
    return this.__ns;
  }
  public set ns(value: string) {
    this.__ns = value;
    this._i18n.loadNamespaces(value).then(() => {
      if (this.__ns === value) this.requestUpdate();
    });
  }

  protected get _t(): TFunction {
    const ns = [this.__ns, this._i18n.options.fallbackNS as string];
    return this._i18n.getFixedT(this.__lang, ns);
  }
}
