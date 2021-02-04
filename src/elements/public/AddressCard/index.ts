import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@polymer/iron-icons/maps-icons';
import '../AddressForm';
import '../FormDialog';
import '../I18N';

import { AddressCardElement } from './AddressCardElement';

customElements.define('foxy-address-card', AddressCardElement);

export { AddressCardElement };
