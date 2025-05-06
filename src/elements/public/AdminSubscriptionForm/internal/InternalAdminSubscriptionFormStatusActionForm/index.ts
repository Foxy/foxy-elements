import '@vaadin/vaadin-button';

import '../../../../internal/InternalSummaryControl/index';
import '../../../../internal/InternalSelectControl/index';
import '../../../../internal/InternalDateControl/index';
import '../../../../internal/InternalForm/index';

import '../../../I18n/index';

import { InternalAdminSubscriptionFormStatusActionForm } from './InternalAdminSubscriptionFormStatusActionForm';

customElements.define(
  'foxy-internal-admin-subscription-form-status-action-form',
  InternalAdminSubscriptionFormStatusActionForm
);

export { InternalAdminSubscriptionFormStatusActionForm };
