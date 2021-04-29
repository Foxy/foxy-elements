import '@vaadin-component-factory/vcf-tooltip';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '../SubscriptionCancellationForm/index';
import '../CollectionPages/index';
import '../FormDialog/index';
import '../ItemsForm/index';
import '../../internal/Calendar/index';
import '../Spinner/index';
import '../Table/index';
import '../I18n/index';

import { css, registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';

import { SubscriptionForm } from './SubscriptionForm';

/** https://github.com/vaadin-component-factory/vcf-tooltip/issues/6 */
registerStyles(
  'vcf-tooltip',
  css`
    :host([hidden]) [part='container'] {
      display: none !important;
    }
  `
);

customElements.define('foxy-subscription-form', SubscriptionForm);

export { SubscriptionForm };
