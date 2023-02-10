import '@vaadin/vaadin-radio-button/vaadin-radio-button';
import '@vaadin/vaadin-radio-button/vaadin-radio-group';

import '../../../../internal/InternalEditableListControl/index';
import '../../../../internal/InternalEditableControl/index';

import '../../../I18n/index';

import { InternalSubscriptionSettingsFormReattemptBypass as Control } from './InternalSubscriptionSettingsFormReattemptBypass';
import { vaadinRadioButtonStyles, vaadinRadioGroupStyles } from './globalStyles';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';

customElements.define('foxy-internal-subscription-settings-form-reattempt-bypass', Control);

registerStyles('vaadin-radio-group', vaadinRadioGroupStyles);
registerStyles('vaadin-radio-button', vaadinRadioButtonStyles);

export { Control as InternalSubscriptionSettingsFormReattemptBypass };
