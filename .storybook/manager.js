import { addons } from '@web/storybook-prebuilt/addons';
import { create } from '@web/storybook-prebuilt/theming/create';

addons.setConfig({
  panelPosition: 'right',
  enableShortcuts: false,
  selectedPanel: 'controls',
  initialActive: 'canvas',
  theme: create({
    base: 'light',
    colorPrimary: 'hsl(290, 52%, 28%)',
    colorSecondary: 'hsl(290, 52%, 28%)',
    appBg: 'hsla(290, 52%, 3%, 0.05)',
    appContentBg: 'hsl(0, 0%, 100%)',
    appBorderColor: 'hsla(290, 52%, 3%, 0.1)',
    appBorderRadius: 8,
    textColor: 'hsl(290, 52%, 3%)',
    textInverseColor: 'hsl(0, 0%, 100%)',
    barTextColor: 'hsla(290, 52%, 3%, 0.7)',
    barSelectedColor: 'hsl(290, 52%, 28%)',
    barBg: 'hsl(0, 0%, 100%)',
    inputBg: 'hsl(0, 0%, 100%)',
    inputBorder: 'hsla(290, 52%, 3%, 0.1)',
    inputTextColor: 'hsl(290, 52%, 3%)',
    inputBorderRadius: 4,
    brandTitle: 'Foxy.io',
    brandUrl: 'https://foxy.io',
    brandImage: 'logo.png',
    fontCode: 'monospace',
    fontBase:
      '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  }),
});
