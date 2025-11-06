import '../../internal/InternalPostActionControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalDeleteControl/index';
import '../../internal/InternalTextControl/index';
import '../../internal/InternalForm/index';

import './internal/InternalUserInvitationFormAsyncAction/index';

import { UserInvitationForm } from './UserInvitationForm';

customElements.define('foxy-user-invitation-form', UserInvitationForm);

export { UserInvitationForm };
