import '@polymer/iron-icons/maps-icons';
import '@polymer/iron-icon';

import '../ItemForm/index';
import '../ItemCard/index';
import '../I18n/index';

import '../../internal/InternalAsyncDetailsControl/index';
import '../../internal/InternalCard/index';

import { ShipmentCard } from './ShipmentCard';

customElements.define('foxy-shipment-card', ShipmentCard);

export { ShipmentCard };
