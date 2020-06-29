import i18next, { FormatFunction, TFunction } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { property } from 'lit-element';
import { cdn } from './common/env.js';
import { Themeable } from './themeable.js';

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
  private static __fList: FormatFunction = (value, _, lng): string => {
    return (value as string[])
      .map((v, i, a) => {
        if (i === 0) return v;
        const part =
          i === a.length - 1 ? ` ${Translatable._i18n.t('and', { lng })}` : ',';
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

  /**
   * Shared i18next instance for all components to avoid
   * loading translations multiple times. Not using the default in case
   * the host project is also relying on i18next without creating a separate instance.
   */
  protected static readonly _i18n = i18next.createInstance();

  /**
   * Creates class instance and starts loading missing translations
   * in background. Triggers render when ready.
   *
   * @param __namespace Name of the folder translations for this component are stored in. Usually a node name without vendor prefix.
   * @param __global Global (default) namespace for common translations.
   */
  constructor(
    private readonly __namespace: string,
    private readonly __global: string = 'translations'
  ) {
    super();

    let whenInitialized: Promise<unknown>;

    if (Translatable._i18n.isInitialized) {
      whenInitialized = Translatable._i18n.loadNamespaces(this.__namespace);
    } else {
      Translatable._i18n.use(LanguageDetector);
      Translatable._i18n.use(HttpApi);

      whenInitialized = Translatable._i18n.init({
        partialBundledLanguages: true,
        interpolation: { format: Translatable.__f },
        fallbackLng: 'en',
        backend: { loadPath: `${cdn}/translations/{{ns}}/{{lng}}.json` },
        ns: [this.__global, this.__namespace],
      });
    }

    whenInitialized.then(() => this.requestUpdate());
  }

  /**
   * Translation function locked to the component's namespace and
   * the language specified by the `lang` attribute with fallbacks to
   * the global namespace and the default language.
   */
  protected get _t(): TFunction {
    return Translatable._i18n.getFixedT(this.lang, [this.__global, 'global']);
  }

  /**
   * Contains the language this component presents its translatable
   * content in. Assigning a value to this property will load new
   * translations in background and trigger a render afterwards.
   */
  @property({ type: String, reflect: true, noAccessor: true })
  public get lang(): string {
    return Translatable._i18n.language;
  }
  public set lang(value: string) {
    Translatable._i18n.loadLanguages(value).then(() => this.requestUpdate());
  }
}
