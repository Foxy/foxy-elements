import { Constructor, LitElement, PropertyDeclarations } from 'lit-element';
import i18next, { FormatFunction, StringMap, TFunction, i18n } from 'i18next';

import HttpApi from 'i18next-http-backend';
import { I18n } from '../elements/public/I18n/I18n';
import { Themeable } from './themeable';
import { cdn } from '../env';
import { InferrableMixinHost } from './inferrable';

/**
 * One of the base classes for each rel-specific element in the collection,
 * providing internationalization capabilities to the derived components.
 * This class MUST NOT be used on its own (hence the `abstract` keyword) or
 * referenced externally (outside of the package).
 *
 * @deprecated
 */
export abstract class Translatable extends Themeable {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      lang: { type: String, noAccessor: true },
      ns: { type: String, noAccessor: true },
    };
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
        const part = i === a.length - 1 ? ` $t(and) ` : ',';
        return `${part} ${v}`;
      })
      .join('');
  };

  /**
   * Chooses the right i18next formatter for the given template.
   * @see https://www.i18next.com/translation-function/formatting
   */
  private static __f: FormatFunction = (...args): string => {
    const value = args[0];
    const formats = args[1]?.split(' ') ?? [];

    return formats.reduce((result, format) => {
      switch (format) {
        case 'lowercase':
          return Translatable.__fLowercase(result);
        case 'list':
          return Translatable.__fList(result);
        default:
          return result;
      }
    }, value);
  };

  private static __whenI18NReady: Promise<TFunction>;

  private static __isI18NReady = false;

  private static __i18n: i18n;

  private __lang = (this._i18n.options.fallbackLng as string[])[0];

  private __ns = (this._i18n.options.fallbackNS as string[])[0];

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
   *
   * **Example:** `"en"`
   */
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

  /**
   * The namespace to look for the translations in. We use this property to
   * sync namespace settings with the parent element and it's highly unlikely
   * that you'll ever need to set or read it in your code.
   *
   * **Example:** `"admin"`
   */
  public get ns(): string {
    return this.__ns;
  }

  public set ns(value: string) {
    this.__ns = value;
    this._i18n.loadNamespaces(value).then(() => {
      if (this.__ns === value) this.requestUpdate();
    });
  }

  private static __initI18N() {
    this.__i18n = i18next.createInstance();
    this.__i18n.use(HttpApi);

    this.__whenI18NReady = this.__i18n.init({
      ns: ['global'],
      supportedLngs: ['nl', 'en', 'es', 'sv', 'fi', 'fr', 'de', 'zh', 'no', 'it', 'pl', 'se'],
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

  protected get _i18n(): i18n {
    return Translatable.__i18n ?? Translatable.__initI18N();
  }

  protected get _whenI18nReady(): Promise<TFunction> {
    return Translatable.__whenI18NReady;
  }

  protected get _isI18nReady(): boolean {
    return Translatable.__isI18NReady;
  }

  protected get _t(): TFunction {
    const ns = [this.__ns, this._i18n.options.fallbackNS as string];
    return this._i18n.getFixedT(this.__lang, ns);
  }
}

type Base = Constructor<InferrableMixinHost> &
  Constructor<LitElement> & { properties?: PropertyDeclarations; inferredProperties: string[] };

type Translator = (key: string, options?: StringMap) => string;

export declare class TranslatableMixinHost {
  /**
   * If true, this element won't attempt to load separate files for nested namespaces.
   * For example, if `ns` is set to `foo bar`, this element will only load `foo` and
   * expect that file to contain all translations for the `bar` namespace.
   */
  simplifyNsLoading: boolean;

  /** Optional ISO 639-1 code describing the language element content is written in. */
  lang: string;

  /**
   * Namespace used by this element.
   * @since 1.4.0
   */
  ns: string;

  /**
   * Translation function from i18next fixed to the current language and element namespace.
   * @since 1.4.0
   */
  get t(): Translator;
}

const InstanceMark = Symbol('TranslatableMixin');

export const TranslatableMixin = <T extends Base>(
  BaseElement: T,
  defaultNS = ''
): T & Constructor<TranslatableMixinHost> & { defaultNS: string } => {
  return class TranslatableElement extends BaseElement {
    static get inferredProperties(): string[] {
      return [...super.inferredProperties, 'simplifyNsLoading', 'lang', 'ns'];
    }

    static get properties(): PropertyDeclarations {
      return {
        ...super.properties,
        simplifyNsLoading: { type: Boolean, attribute: 'simplify-ns-loading' },
        lang: { type: String },
        ns: { type: String },
      };
    }

    static get defaultNS(): string {
      return defaultNS;
    }

    simplifyNsLoading = false;

    [InstanceMark] = true;

    lang = '';

    ns = defaultNS;

    t: Translator = (key, options) => {
      const I18nElement = customElements.get('foxy-i18n') as typeof I18n | undefined;

      if (!I18nElement) return key;

      let keys: string[];

      if (this.simplifyNsLoading) {
        const namespaces = this.ns.split(' ').filter(v => v.length > 0);
        const path = [...namespaces.slice(1), key].join('.');
        keys = namespaces[0] ? [`${namespaces[0]}:${path}`] : [path];
      } else {
        keys = this.ns
          .split(' ')
          .reverse()
          .map(v => v.trim())
          .filter(v => v.length > 0)
          .reverse()
          .map((v, i, a) => `${v}:${[...a.slice(i + 1), key].join('.')}`);
      }

      keys.push(key);

      return I18nElement.i18next.t(keys, { lng: this.lang, ...options }).toString();
    };

    private __untrackTranslations?: () => void;

    connectedCallback(): void {
      super.connectedCallback();
      const I18nElement = customElements.get('foxy-i18n') as typeof I18n | undefined;
      this.__untrackTranslations = I18nElement?.onTranslationChange(() => this.requestUpdate());
    }

    /** @readonly */
    updated(changedProperties: Map<keyof I18n, unknown>): void {
      super.updated(changedProperties);

      const I18nElement = customElements.get('foxy-i18n') as typeof I18n | undefined;

      if (!I18nElement) return;

      if (changedProperties.has('lang')) I18nElement.i18next.loadLanguages(this.lang);

      if (changedProperties.has('ns')) {
        const namespaces = this.ns.split(' ').filter(v => v.length > 0);

        if (this.simplifyNsLoading) {
          if (namespaces[0]) I18nElement.i18next.loadNamespaces(namespaces[0]);
        } else {
          I18nElement.i18next.loadNamespaces(namespaces);
        }
      }
    }

    disconnectedCallback(): void {
      super.disconnectedCallback();
      this.__untrackTranslations?.();
    }

    inferFromElement(key: string, element: HTMLElement): unknown | undefined {
      if ((key === 'lang' || key === 'ns') && !(InstanceMark in element)) return;
      return super.inferFromElement(key, element);
    }

    applyInferredProperties(context: Map<string, unknown>): void {
      super.applyInferredProperties(context);
      if (this.infer === null) return;

      const simplifyNsLoading = context.get('simplifyNsLoading') as boolean | undefined;
      const lang = context.get('lang') as string | undefined;
      const ns = context.get('ns') as string | undefined;

      this.simplifyNsLoading = simplifyNsLoading ?? false;
      this.lang = lang ?? '';
      this.ns = ns ? `${ns} ${this.infer}`.trim() : defaultNS;
    }
  };
};
