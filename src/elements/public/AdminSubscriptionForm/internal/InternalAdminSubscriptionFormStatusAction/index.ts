import '@vaadin/vaadin-button';

import '../../../../internal/InternalConfirmDialog/index';
import '../../../../internal/InternalControl/index';

import '../../../FormDialog/index';
import '../../../I18n/index';

import '../InternalAdminSubscriptionFormStatusActionForm/index';

import { InternalAdminSubscriptionFormStatusAction } from './InternalAdminSubscriptionFormStatusAction';

customElements.define(
  'foxy-internal-admin-subscription-form-status-action',
  InternalAdminSubscriptionFormStatusAction
);

export { InternalAdminSubscriptionFormStatusAction };
