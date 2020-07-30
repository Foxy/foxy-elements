import { Router } from '@vaadin/router';
import { css, html, property } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { navigation } from './navigation';
import { AdminNavigation } from './private/AdminNavigation/AdminNavigation';
import { routes } from './routes';

export class Admin extends Translatable {
  public static get scopedElements() {
    return {
      'x-admin-navigation': AdminNavigation,
    };
  }

  public static get styles() {
    return [
      super.styles,
      css`
        :host {
          --md-nav-width: 260px;
        }

        .scroll-touch {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        .inset-nav {
          --nav-padding: calc(var(--lumo-space-xs) * 4);
          --nav-divider: 1px;
          --nav-icon: var(--lumo-size-xxs, 1.5rem);
          --nav-text: calc(var(--lumo-line-height-s) * var(--lumo-font-size-xxxs, 0.5625rem));

          top: 0;
          right: 0;
          bottom: calc(var(--nav-padding) + var(--nav-icon) + var(--nav-text) + var(--nav-divider));
          left: 0;
        }

        @media all and (min-width: 768px) {
          .inset-nav {
            left: var(--md-nav-width);
            bottom: 0;
          }
        }
      `,
    ];
  }

  private __routerListener = () => this.requestUpdate();

  @property({ type: Array })
  public navigation = navigation;

  @property({ type: Object })
  public router = new Router();

  @property({ type: Array })
  public routes = routes;

  public constructor() {
    super('admin');
  }

  public connectedCallback() {
    super.connectedCallback();
    addEventListener('vaadin-router-location-changed', this.__routerListener);
  }

  public disconnectedCallback() {
    super.connectedCallback();
    removeEventListener('vaadin-router-location-changed', this.__routerListener);
  }

  public render() {
    const addHref = (route: { name: string }) => {
      try {
        return { ...route, href: this.router.urlForName(route.name) };
      } catch {
        return { ...route, href: '' };
      }
    };

    const navigation = this.navigation.map(topRoute => {
      if ('name' in topRoute) return addHref(topRoute);
      return Object.assign({}, topRoute, {
        children: topRoute.children.map(childRoute => {
          if ('name' in childRoute) return addHref(childRoute);
          return { ...childRoute, children: childRoute.children.map(addHref) };
        }),
      });
    });

    return html`
      <div class="bg-base w-full h-full relative overflow-hidden">
        <div id="outlet" class="absolute overflow-auto inset-nav scroll-touch"></div>
        <x-admin-navigation
          .navigation=${navigation}
          class="absolute inset-0 pointer-events-none"
          route=${this.router.location.route?.name ?? ''}
          lang=${this.lang}
          ns=${this.ns}
        >
        </x-admin-navigation>
      </div>
    `;
  }

  public firstUpdated() {
    this.router.setOutlet(this.shadowRoot!.getElementById('outlet'));
  }

  public updated(changedProperties: Map<keyof Admin, unknown>) {
    if (changedProperties.has('routes')) this.router.setRoutes(this.routes);
  }
}
