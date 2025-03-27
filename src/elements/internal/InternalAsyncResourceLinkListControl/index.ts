import '@vaadin/vaadin-checkbox';

import '../../public/CollectionPage/index';
import '../../public/NucleonElement/index';
import '../../public/Pagination/index';
import '../../public/I18n/index';

import '../InternalEditableControl/index';

import { InternalAsyncResourceLinkListControl } from './InternalAsyncResourceLinkListControl';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';
import { css } from 'lit-element';

customElements.define(
  'foxy-internal-async-resource-link-list-control',
  InternalAsyncResourceLinkListControl
);

try {
  registerStyles(
    'vaadin-checkbox',
    css`
      :host(.foxy-internal-checkbox-style-0) label {
        display: flex;
      }
    `
  );
} catch {
  // ignore
}

export { InternalAsyncResourceLinkListControl };
