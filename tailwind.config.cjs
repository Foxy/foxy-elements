/* eslint-disable @typescript-eslint/no-var-requires */

const plugin = require('tailwindcss/plugin');
const postcss = require('postcss');

/**
 * This is a custom TailwindCSS config based on the Vaadin Lumo
 * theme variables. It brings all the benefits of utility CSS for Shadow
 * DOM content while also allowing end users to override specific values
 * in Light DOM using Lumo theme builder.
 *
 * @see https://cdn.vaadin.com/vaadin-lumo-styles/1.6.0/demo/index.html
 * @see https://demo.vaadin.com/lumo-editor/
 *
 * For project-specific internal utilities and extra base styles please
 * refer to the `src/tailwind.css` file.
 */

function cssVar(foxy, fallback) {
  return `var(--lumo-${foxy}, ${fallback})`;
}

const colorsMap = {
  transparent: 'transparent',
  current: 'currentColor',
  base: cssVar('base-color', '#fff'),
  tint: {
    5: cssVar('tint-5pct', 'hsla(0, 0%, 100%, 0.3)'),
    10: cssVar('tint-10pct', 'hsla(0, 0%, 100%, 0.37)'),
    20: cssVar('tint-20pct', 'hsla(0, 0%, 100%, 0.44)'),
    30: cssVar('tint-30pct', 'hsla(0, 0%, 100%, 0.5)'),
    40: cssVar('tint-40pct', 'hsla(0, 0%, 100%, 0.57)'),
    50: cssVar('tint-50pct', 'hsla(0, 0%, 100%, 0.64)'),
    60: cssVar('tint-60pct', 'hsla(0, 0%, 100%, 0.7)'),
    70: cssVar('tint-70pct', 'hsla(0, 0%, 100%, 0.77)'),
    80: cssVar('tint-80pct', 'hsla(0, 0%, 100%, 0.84)'),
    90: cssVar('tint-90pct', 'hsla(0, 0%, 100%, 0.9)'),
    DEFAULT: cssVar('tint', '#fff'),
  },
  shade: {
    5: cssVar('shade-5pct', 'hsla(214, 61%, 25%, 0.05)'),
    10: cssVar('shade-10pct', 'hsla(214, 57%, 24%, 0.1)'),
    20: cssVar('shade-20pct', 'hsla(214, 53%, 23%, 0.16)'),
    30: cssVar('shade-30pct', 'hsla(214, 50%, 22%, 0.26)'),
    40: cssVar('shade-40pct', 'hsla(214, 47%, 21%, 0.38)'),
    50: cssVar('shade-50pct', 'hsla(214, 45%, 20%, 0.5)'),
    60: cssVar('shade-60pct', 'hsla(214, 43%, 19%, 0.61)'),
    70: cssVar('shade-70pct', 'hsla(214, 42%, 18%, 0.72)'),
    80: cssVar('shade-80pct', 'hsla(214, 41%, 17%, 0.83)'),
    90: cssVar('shade-90pct', 'hsla(214, 40%, 16%, 0.94)'),
    DEFAULT: cssVar('shade', 'hsl(214, 35%, 15%)'),
  },
  contrast: {
    5: cssVar('contrast-5pct', 'hsla(214, 61%, 25%, 0.05)'),
    10: cssVar('contrast-10pct', 'hsla(214, 57%, 24%, 0.1)'),
    20: cssVar('contrast-20pct', 'hsla(214, 53%, 23%, 0.16)'),
    30: cssVar('contrast-30pct', 'hsla(214, 50%, 22%, 0.26)'),
    40: cssVar('contrast-40pct', 'hsla(214, 47%, 21%, 0.38)'),
    50: cssVar('contrast-50pct', 'hsla(214, 45%, 20%, 0.5)'),
    60: cssVar('contrast-60pct', 'hsla(214, 43%, 19%, 0.61)'),
    70: cssVar('contrast-70pct', 'hsla(214, 42%, 18%, 0.72)'),
    80: cssVar('contrast-80pct', 'hsla(214, 41%, 17%, 0.83)'),
    90: cssVar('contrast-90pct', 'hsla(214, 40%, 16%, 0.94)'),
    DEFAULT: cssVar('contrast', 'hsl(214, 35%, 15%)'),
  },
  primary: {
    10: cssVar('primary-color-10pct', 'hsla(214, 90%, 52%, 0.1)'),
    50: cssVar('primary-color-50pct', 'hsla(214, 90%, 52%, 0.5)'),
    DEFAULT: cssVar('primary-color', 'hsl(214, 90%, 52%)'),
    contrast: cssVar('primary-contrast-color', '#fff'),
  },
  error: {
    10: cssVar('error-color-10pct', 'hsla(3, 100%, 60%, 0.1)'),
    50: cssVar('error-color-50pct', 'hsla(3, 100%, 60%, 0.5)'),
    DEFAULT: cssVar('error-color', 'hsl(3, 100%, 61%)'),
    contrast: cssVar('error-contrast-color', '#fff'),
  },
  success: {
    10: cssVar('success-color-10pct', 'hsla(145, 76%, 44%, 0.12)'),
    50: cssVar('success-color-50pct', 'hsla(145, 76%, 44%, 0.55)'),
    DEFAULT: cssVar('success-color', 'hsl(145, 80%, 42%)'),
    contrast: cssVar('success-contrast-color', '#fff'),
  },
};

const spacingMap = {
  0: '0',
  xs: cssVar('space-xs', '0.25rem'),
  s: cssVar('space-s', '0.5rem'),
  m: cssVar('space-m', '1rem'),
  l: cssVar('space-l', '1.5rem'),
  xl: cssVar('space-xl', '2.5rem'),
  DEFAULT: cssVar('space-m', '1rem'),
};

const textColorMap = Object.assign({}, colorsMap, {
  header: cssVar('header-text-color', 'hsl(214, 35%, 15%)'),
  body: cssVar('body-text-color', 'hsla(214, 40%, 16%, 0.94)'),
  disabled: cssVar('disabled-text-color', 'hsla(214, 50%, 22%, 0.26)'),
  secondary: cssVar('secondary-text-color', 'hsla(214, 42%, 18%, 0.72)'),
  tertiary: cssVar('tertiary-text-color', 'hsla(214, 45%, 20%, 0.5)'),
  primary: Object.assign({}, colorsMap.primary, {
    DEFAULT: cssVar('primary-text-color', 'hsl(214, 90%, 52%)'),
  }),
  success: Object.assign({}, colorsMap.success, {
    DEFAULT: cssVar('success-text-color', 'hsl(145, 100%, 32%)'),
  }),
  error: Object.assign({}, colorsMap.error, {
    DEFAULT: cssVar('error-text-color', 'hsl(3, 92%, 53%)'),
  }),
});

const borderRadiusMap = {
  none: '0',
  s: cssVar('border-radius-s', '0.25em'),
  m: cssVar('border-radius', '0.5em'),
  l: cssVar('border-radius-l', '0.75em'),
  full: '100%',
  DEFAULT: cssVar('border-radius', '0.5em'),
};

const boxShadowMap = {
  'none': 'none',
  'xxxs': cssVar(
    'box-shadow-xxxs',
    '0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)'
  ),
  'xxs': cssVar(
    'box-shadow-xxs',
    '0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 1px 8px 0 rgba(0, 0, 0, 0.12), 0 3px 3px -2px rgba(0, 0, 0, 0.4)'
  ),
  'xs': cssVar(
    'box-shadow-xs',
    '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)'
  ),
  's': cssVar(
    'box-shadow-s',
    '0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.4)'
  ),
  'm': cssVar(
    'box-shadow-m',
    '0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.4)'
  ),
  'l': cssVar(
    'box-shadow-l',
    '0 12px 16px 1px rgba(0, 0, 0, 0.14), 0 4px 22px 3px rgba(0, 0, 0, 0.12), 0 6px 7px -4px rgba(0, 0, 0, 0.4)'
  ),
  'xl': cssVar(
    'box-shadow-xl',
    '0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.4)'
  ),
  'xxl': cssVar(
    'box-shadow-xxl',
    '0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12), 0 11px 15px -7px rgba(0, 0, 0, 0.4)'
  ),
  'outline': `0 0 0 2px ${cssVar('primary-color-50pct', 'hsla(214, 90%, 52%, 0.5)')};`,
  'outline-success': `0 0 0 2px ${cssVar('success-color-50pct', 'hsla(145, 76%, 44%, 0.55)')};`,
  'outline-error': `0 0 0 2px ${cssVar('error-color-50pct', 'hsla(3, 100%, 60%, 0.1)')};`,
  'outline-base': `0 0 0 2px ${cssVar('base-color', '#fff')};`,
};

const fontFamilyMap = {
  display: cssVar(
    'display-font-family',
    cssVar(
      'font-family',
      '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
    )
  ),
  lumo: cssVar(
    'font-family',
    '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
  ),
};

const fontSizeMap = {
  xxxs: cssVar('font-size-xxxs', '0.5625rem'),
  xxs: cssVar('font-size-xxs', '0.75rem'),
  xs: cssVar('font-size-xs', '0.8125rem'),
  s: cssVar('font-size-s', '0.875rem'),
  m: cssVar('font-size-m', '1rem'),
  l: cssVar('font-size-l', '1.125rem'),
  xl: cssVar('font-size-xl', '1.375rem'),
  xxl: cssVar('font-size-xxl', '1.75rem'),
  xxxl: cssVar('font-size-xxxl', '2.5rem'),
  xxxxl: cssVar('font-size-xxxxl', '3.75rem'),
  xxxxxl: cssVar('font-size-xxxxxl', '6rem'),
};

const lineHeightMap = {
  none: '1',
  xs: cssVar('line-height-xs', '1.25'),
  s: cssVar('line-height-s', '1.375'),
  m: cssVar('line-height-m', '1.625'),
};

const sizeMap = {
  '0': '0px',
  'auto': 'auto',
  'px': '1px',
  'xxs': cssVar('size-xxs', '1.5rem'),
  'xs': cssVar('size-xs', '1.625rem'),
  's': cssVar('size-s', '1.875rem'),
  'm': cssVar('size-m', '2.25rem'),
  'l': cssVar('size-l', '2.75rem'),
  'xl': cssVar('size-xl', '3.5rem'),
  '1-3': '33.333333%',
  '1-2': '50%',
  '2-3': '66.666667%',
  'full': '100%',
  'min': 'min-content',
  'max': 'max-content',
};

module.exports = {
  purge: {
    enabled: true,
    content: ['./src/**/*.ts'],
    options: {
      safelist: [/:host/],
    },
  },
  variants: [
    'sm',
    'md',
    'lg',
    'xl',
    'media-group-hover',
    'group-focus',
    'focus-within',
    'media-hover',
    'focus',
    'disabled',
  ],
  separator: '-',
  theme: {
    colors: colorsMap,
    spacing: spacingMap,
    textColor: textColorMap,
    borderRadius: borderRadiusMap,
    boxShadow: boxShadowMap,
    fontFamily: fontFamilyMap,
    fontSize: fontSizeMap,
    lineHeight: lineHeightMap,
    screens: {},
    width: { ...sizeMap, screen: '100vw' },
    height: { ...sizeMap, screen: '100vh' },
  },
  plugins: [
    plugin(({ addVariant, e }) => {
      ['sm', 'md', 'lg', 'xl'].forEach(breakpoint => {
        addVariant(breakpoint, ({ modifySelectors, separator }) => {
          modifySelectors(({ className }) => {
            const newClassName = e(`${breakpoint}${separator}${className}`);
            return `:host([${breakpoint}]) .${newClassName}`;
          });
        });
      });

      addVariant('media-hover', ({ container, separator, modifySelectors }) => {
        modifySelectors(({ className }) => {
          return `.${e(`hover${separator}${className}`)}:hover`;
        });

        const atRule = postcss.atRule({ name: 'media', params: '(hover: hover)' });
        atRule.append(container.nodes);
        container.append(atRule);
      });

      addVariant('media-group-hover', ({ container, separator, modifySelectors }) => {
        modifySelectors(({ className }) => {
          return `.group:hover .${e(`group-hover${separator}${className}`)}`;
        });

        const atRule = postcss.atRule({ name: 'media', params: '(hover: hover)' });
        atRule.append(container.nodes);
        container.append(atRule);
      });
    }),
  ],
};
