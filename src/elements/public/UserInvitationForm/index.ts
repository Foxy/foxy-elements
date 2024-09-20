import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalUserInvitationFormAsyncAction/index';
import './internal/InternalUserInvitationFormSyncAction/index';

import { UserInvitationForm } from './UserInvitationForm';

customElements.define('foxy-user-invitation-form', UserInvitationForm);

export { UserInvitationForm };
