import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@polymer/iron-icons/maps-icons';
import '../AddressForm/index';
import '../FormDialog/index';
import '../I18n/index';

import { AddressCard } from './AddressCard';

customElements.define('foxy-address-card', AddressCard);

export { AddressCard };
