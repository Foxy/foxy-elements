import '../AddressCard/index';
import '../ItemForm/index';
import '../ItemCard/index';
import '../I18n/index';

import '../../internal/InternalCollectionCard/index';

import { ShipmentCard } from './ShipmentCard';

customElements.define('foxy-shipment-card', ShipmentCard);

export { ShipmentCard };