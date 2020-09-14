/* global window */

import { configure, setCustomElements } from '@storybook/web-components';
import { persistHistoryStateBetweenReloads } from './utils';
import customElements from '../custom-elements.json';

const context = require.context('../src/elements/public', true, /\.stories\.mdx$/);

setCustomElements(customElements);
configure(context, module);

if (module.hot) {
  persistHistoryStateBetweenReloads({
    lastStoryKey: '@foxy.io/elements::storybook.last_story',
    lastPathKey: '@foxy.io/elements::storybook.last_path',
    refreshRate: 250,
    module,
  });

  module.hot.accept(context.id, () => location.reload());
}

export const parameters = {
  backgrounds: { disable: true },
};
