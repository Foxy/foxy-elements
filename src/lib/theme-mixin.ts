type ThemeDefinition = {
  property: `theme${string}`;
  attribute: `theme-${string}`;
  cssVariable: `--${string}`;
};

const THEME_DEFINITIONS = [
  {
    property: "themeBackground",
    attribute: "theme-background",
    cssVariable: "--background",
  },
  {
    property: "themeForeground",
    attribute: "theme-foreground",
    cssVariable: "--foreground",
  },
  {
    property: "themeCard",
    attribute: "theme-card",
    cssVariable: "--card",
  },
  {
    property: "themeCardForeground",
    attribute: "theme-card-foreground",
    cssVariable: "--card-foreground",
  },
  {
    property: "themePrimary",
    attribute: "theme-primary",
    cssVariable: "--primary",
  },
  {
    property: "themePrimaryForeground",
    attribute: "theme-primary-foreground",
    cssVariable: "--primary-foreground",
  },
  {
    property: "themeMutedForeground",
    attribute: "theme-muted-foreground",
    cssVariable: "--muted-foreground",
  },
  {
    property: "themeDestructive",
    attribute: "theme-destructive",
    cssVariable: "--destructive",
  },
  {
    property: "themeBorder",
    attribute: "theme-border",
    cssVariable: "--border",
  },
  {
    property: "themeInput",
    attribute: "theme-input",
    cssVariable: "--input",
  },
  {
    property: "themeRing",
    attribute: "theme-ring",
    cssVariable: "--ring",
  },
  {
    property: "themeFontSans",
    attribute: "theme-font-sans",
    cssVariable: "--font-sans",
  },
  {
    property: "themeRadius",
    attribute: "theme-radius",
    cssVariable: "--radius",
  },
  {
    property: "themeSpacing",
    attribute: "theme-spacing",
    cssVariable: "--spacing",
  },
  {
    property: "themeInputPlaceholderColor",
    attribute: "theme-input-placeholder-color",
    cssVariable: "--input-placeholder-color",
  },
  {
    property: "themeInputHeight",
    attribute: "theme-input-height",
    cssVariable: "--input-height",
  },
  {
    property: "themeInputPadding",
    attribute: "theme-input-padding",
    cssVariable: "--input-padding",
  },
  {
    property: "themeInputPaddingX",
    attribute: "theme-input-padding-x",
    cssVariable: "--input-padding-x",
  },
  {
    property: "themeInputPaddingY",
    attribute: "theme-input-padding-y",
    cssVariable: "--input-padding-y",
  },
  {
    property: "themeInputTextColor",
    attribute: "theme-input-text-color",
    cssVariable: "--input-text-color",
  },
  {
    property: "themeInputErrorTextColor",
    attribute: "theme-input-error-text-color",
    cssVariable: "--input-error-text-color",
  },
  {
    property: "themeInputFontSize",
    attribute: "theme-input-font-size",
    cssVariable: "--input-font-size",
  },
] as const satisfies readonly ThemeDefinition[];

export type CanonicalThemeDefinition = (typeof THEME_DEFINITIONS)[number];
export type ThemePropertyName = CanonicalThemeDefinition["property"];
export type ThemeAttributeName = CanonicalThemeDefinition["attribute"];
export type ThemeCssVar = CanonicalThemeDefinition["cssVariable"];
export type ThemePropertyValues = Partial<Record<ThemePropertyName, string>>;

type ThemeLookupOptions = {
  includeCssVarDefaults?: boolean;
};

export type ThemeMixinMethods = {
  getThemeProperty(
    name: ThemePropertyName,
    options?: ThemeLookupOptions,
  ): string | undefined;
  setThemeProperty(name: ThemePropertyName, value: string | undefined): void;
  getThemeCssVarMap(
    definitions?: readonly CanonicalThemeDefinition[],
    options?: ThemeLookupOptions,
  ): Partial<Record<ThemeCssVar, string>>;
  syncThemeCssVarsToStyle(
    definitions?: readonly CanonicalThemeDefinition[],
  ): void;
};

export const THEME_ATTRIBUTE_NAMES = THEME_DEFINITIONS.map(
  ({ attribute }) => attribute,
) as ThemeAttributeName[];

export const THEME_PROPERTY_TO_ATTRIBUTE = Object.fromEntries(
  THEME_DEFINITIONS.map(({ property, attribute }) => [property, attribute]),
) as Record<ThemePropertyName, ThemeAttributeName>;

export const THEME_ATTRIBUTE_TO_CSS_VAR = Object.fromEntries(
  THEME_DEFINITIONS.map(({ attribute, cssVariable }) => [
    attribute,
    cssVariable,
  ]),
) as Record<ThemeAttributeName, ThemeCssVar>;

export const THEME_DEFINITION_BY_PROPERTY = Object.fromEntries(
  THEME_DEFINITIONS.map((definition) => [definition.property, definition]),
) as Record<ThemePropertyName, CanonicalThemeDefinition>;

export const THEME_DEFINITION_BY_ATTRIBUTE = Object.fromEntries(
  THEME_DEFINITIONS.map((definition) => [definition.attribute, definition]),
) as Record<ThemeAttributeName, CanonicalThemeDefinition>;

export type ThemeElement = HTMLElement &
  ThemePropertyValues &
  ThemeMixinMethods;

export type ThemeElementConstructor = abstract new (
  ...args: any[]
) => ThemeElement;

export type ThemeElementClass = ThemeElementConstructor & {
  readonly themeDefinitions: readonly CanonicalThemeDefinition[];
  readonly themeAttributeNames: readonly ThemeAttributeName[];
};

type ThemeInlineStyleSnapshot = {
  priority: string;
  value: string;
};

const THEME_INLINE_STYLE_SNAPSHOTS = Symbol("themeInlineStyleSnapshots");

function normalizeThemeValue(
  value: string | null | undefined,
): string | undefined {
  return value?.trim() || undefined;
}

function readThemeCssVarDefault(
  element: HTMLElement,
  cssVariable: ThemeCssVar,
): string | undefined {
  const inlineValue = normalizeThemeValue(
    element.style.getPropertyValue(cssVariable),
  );
  if (inlineValue) return inlineValue;

  if (typeof getComputedStyle === "function") {
    const computedValue = normalizeThemeValue(
      getComputedStyle(element).getPropertyValue(cssVariable),
    );
    if (computedValue) return computedValue;
  }

  if (typeof document === "undefined") return undefined;
  const root = document.documentElement;
  if (!root) return undefined;

  const rootInlineValue = normalizeThemeValue(
    root.style.getPropertyValue(cssVariable),
  );
  if (rootInlineValue) return rootInlineValue;

  if (typeof getComputedStyle === "function") {
    return normalizeThemeValue(
      getComputedStyle(root).getPropertyValue(cssVariable),
    );
  }

  return undefined;
}

export function getThemeDefinitionsByAttributeNames(
  attributeNames: readonly ThemeAttributeName[],
): CanonicalThemeDefinition[] {
  return attributeNames.map((attributeName) => {
    return THEME_DEFINITION_BY_ATTRIBUTE[attributeName];
  });
}

export function ThemeMixin(Base: typeof HTMLElement): ThemeElementClass {
  abstract class ThemeElement extends Base {
    static get themeDefinitions(): readonly CanonicalThemeDefinition[] {
      return THEME_DEFINITIONS;
    }

    static get themeAttributeNames(): readonly ThemeAttributeName[] {
      return THEME_ATTRIBUTE_NAMES;
    }

    getThemeProperty(
      name: ThemePropertyName,
      options: ThemeLookupOptions = {},
    ): string | undefined {
      const attributeValue = normalizeThemeValue(
        this.getAttribute(THEME_PROPERTY_TO_ATTRIBUTE[name]),
      );
      if (attributeValue) return attributeValue;
      if (options.includeCssVarDefaults === false) return undefined;

      return readThemeCssVarDefault(
        this,
        THEME_DEFINITION_BY_PROPERTY[name].cssVariable,
      );
    }

    setThemeProperty(name: ThemePropertyName, value: string | undefined): void {
      const normalized = normalizeThemeValue(value);
      const attributeName = THEME_PROPERTY_TO_ATTRIBUTE[name];

      if (normalized === undefined) {
        this.removeAttribute(attributeName);
        return;
      }

      if (this.getAttribute(attributeName) !== normalized) {
        this.setAttribute(attributeName, normalized);
      }
    }

    getThemeCssVarMap(
      definitions: readonly CanonicalThemeDefinition[] = THEME_DEFINITIONS,
      options: ThemeLookupOptions = {},
    ): Partial<Record<ThemeCssVar, string>> {
      const style: Partial<Record<ThemeCssVar, string>> = {};

      for (const definition of definitions) {
        const value = this.getThemeProperty(definition.property, options);
        if (!value) continue;
        style[definition.cssVariable] = value;
      }

      return style;
    }

    syncThemeCssVarsToStyle(
      definitions: readonly CanonicalThemeDefinition[] = THEME_DEFINITIONS,
    ): void {
      const themeCssVarMap = this.getThemeCssVarMap(definitions, {
        includeCssVarDefaults: false,
      });
      const styleSnapshots = ((
        this as ThemeElement & {
          [THEME_INLINE_STYLE_SNAPSHOTS]?: Map<
            ThemeCssVar,
            ThemeInlineStyleSnapshot
          >;
        }
      )[THEME_INLINE_STYLE_SNAPSHOTS] ??= new Map());

      for (const definition of definitions) {
        const tokenValue = themeCssVarMap[definition.cssVariable]?.trim();

        if (tokenValue) {
          if (!styleSnapshots.has(definition.cssVariable)) {
            styleSnapshots.set(definition.cssVariable, {
              priority: this.style.getPropertyPriority(definition.cssVariable),
              value: this.style.getPropertyValue(definition.cssVariable),
            });
          }

          this.style.setProperty(definition.cssVariable, tokenValue);
          continue;
        }

        const snapshot = styleSnapshots.get(definition.cssVariable);
        if (!snapshot) continue;

        if (snapshot.value) {
          this.style.setProperty(
            definition.cssVariable,
            snapshot.value,
            snapshot.priority,
          );
        } else {
          this.style.removeProperty(definition.cssVariable);
        }

        styleSnapshots.delete(definition.cssVariable);
      }
    }
  }

  for (const definition of THEME_DEFINITIONS) {
    Object.defineProperty(ThemeElement.prototype, definition.property, {
      configurable: true,
      enumerable: true,
      get(this: ThemeElement) {
        return this.getThemeProperty(definition.property);
      },
      set(this: ThemeElement, value: string | undefined) {
        this.setThemeProperty(definition.property, value);
      },
    });
  }

  return ThemeElement as ThemeElementClass;
}
