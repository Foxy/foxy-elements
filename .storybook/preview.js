/* global window */

import { configure, setCustomElements } from '@storybook/web-components';
import customElements from '../custom-elements.json';

const context = require.context('../src/elements/public', true, /\.stories\.(js|mdx)$/);

setCustomElements(customElements);
configure(context, module);

if (module.hot) {
  module.hot.accept(context.id, () => {
    const currentLocationHref = window.location.href;
    window.history.pushState(null, null, currentLocationHref);
    window.location.reload();
  });
}
