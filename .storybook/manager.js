import { addons } from '@web/storybook-prebuilt/addons';
import { create } from '@web/storybook-prebuilt/theming/create';

addons.setConfig({
  panelPosition: 'right',
  enableShortcuts: false,
  selectedPanel: 'controls',
  initialActive: 'canvas',
  theme: create({
    base: 'light',
    colorPrimary: '#61226d',
    colorSecondary: '#61226d',
    appBg: 'hsla(214, 61%, 25%, 0.05)',
    appContentBg: 'white',
    appBorderColor: 'hsla(214, 57%, 24%, 0.1)',
    appBorderRadius: 8,
    textColor: 'hsla(214, 40%, 16%, 0.94)',
    textInverseColor: 'hsla(0, 0%, 100%, 0.3)',
    barTextColor: 'hsla(214, 42%, 18%, 0.72)',
    barSelectedColor: '#61226d',
    barBg: 'white',
    inputBg: 'white',
    inputBorder: 'hsla(214, 57%, 24%, 0.1)',
    inputTextColor: 'hsla(214, 40%, 16%, 0.94)',
    inputBorderRadius: 4,
    brandTitle: 'Foxy.io',
    brandUrl: 'https://foxy.io',
    brandImage: 'logo.png',
    fontCode: 'monospace',
    fontBase:
      '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  }),
});
