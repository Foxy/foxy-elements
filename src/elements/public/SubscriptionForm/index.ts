import '@vaadin-component-factory/vcf-tooltip';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';
import '@polymer/iron-icons';
import '@polymer/iron-icon';

import '../../internal/InternalTimestampsControl/index';
import '../../internal/InternalAsyncListControl/index';
import '../../internal/InternalNumberControl/index';
import '../../internal/InternalCalendar/index';
import '../../internal/InternalSandbox/index';
import '../../internal/InternalForm/index';

import '../CancellationForm/index';
import '../TransactionCard/index';
import '../NucleonElement/index';
import '../AttributeCard/index';
import '../AttributeForm/index';
import '../CustomerCard/index';
import '../FormDialog/index';
import '../ItemCard/index';
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
