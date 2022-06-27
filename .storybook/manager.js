import { addons } from '@web/storybook-prebuilt/addons';
import { create } from '@web/storybook-prebuilt/theming/create';
import { FORCE_RE_RENDER } from '@web/storybook-prebuilt/core-events';

addons.setConfig({
  panelPosition: 'right',
  enableShortcuts: false,
  selectedPanel: 'controls',
  initialActive: 'canvas',
});

addons.register('auto-theme-switcher', api => {
  const sharedTheme = {
    inputBorderRadius: 4,
    appBorderRadius: 8,
    brandTitle: 'Foxy.io',
    brandUrl: 'https://foxy.io',
    fontCode: 'monospace',
    fontBase:
      '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  };

  const lightTheme = create({
    ...sharedTheme,
    base: 'light',
    colorPrimary: 'hsl(290, 52%, 28%)',
    colorSecondary: 'hsl(290, 52%, 28%)',
    appBg: 'hsla(290, 52%, 3%, 0.05)',
    appContentBg: 'hsl(0, 0%, 100%)',
    appBorderColor: 'hsla(290, 52%, 3%, 0.1)',
    textColor: 'hsl(290, 52%, 3%)',
    textInverseColor: 'hsl(0, 0%, 100%)',
    barTextColor: 'hsla(290, 52%, 3%, 0.7)',
    barSelectedColor: 'hsl(290, 52%, 28%)',
    barBg: 'hsl(0, 0%, 100%)',
    inputBg: 'hsl(0, 0%, 100%)',
    inputBorder: 'hsla(290, 52%, 3%, 0.1)',
    inputTextColor: 'hsl(290, 52%, 3%)',
    brandImage: 'logo-light.png',
  });

  const darkTheme = create({
    ...sharedTheme,
    base: 'dark',
    colorPrimary: 'hsl(290, 52%, 58%)',
    colorSecondary: 'hsl(290, 52%, 58%)',
    appBg: 'hsl(290, 10%, 10%)',
    appContentBg: 'hsl(288, 7%, 15%)',
    appBorderColor: 'hsla(290, 52%, 100%, 0.1)',
    textColor: 'hsl(290, 52%, 100%)',
    textInverseColor: 'hsl(290, 10%, 10%)',
    barTextColor: 'hsla(290, 52%, 100%, 0.7)',
    barSelectedColor: 'hsl(290, 52%, 58%)',
    barBg: 'hsl(288, 7%, 15%)',
    inputBg: 'hsl(290, 10%, 10%)',
    inputBorder: 'hsla(290, 52%, 100%, 0.1)',
    inputTextColor: 'hsl(290, 52%, 100%)',
    brandImage: 'logo-dark.png',
  });

  const query = matchMedia('(prefers-color-scheme: dark)');
  const handleQueryChange = evt => {
    api.setOptions({ theme: evt.matches ? darkTheme : lightTheme });
    addons.getChannel().emit(FORCE_RE_RENDER);
  };

  handleQueryChange(query);
  query.addEventListener('change', handleQueryChange);
});
