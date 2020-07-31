import { Router, RouterLocation } from '@vaadin/router';

declare global {
  type VaadinRouterLocationChangedEvent = CustomEvent<{ router: Router; location: RouterLocation }>;

  interface WindowEventMap {
    'vaadin-router-location-changed': VaadinRouterLocationChangedEvent;
  }
}
