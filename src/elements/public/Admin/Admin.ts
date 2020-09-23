import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { ScopedElementsHost } from '@open-wc/scoped-elements/src/types';
import { Router } from '@vaadin/router';
import { css, CSSResultArray, html, TemplateResult } from 'lit-element';
import { interpret } from 'xstate';
import { RequestEvent, UnhandledRequestError } from '../../../events/request';
import { Translatable } from '../../../mixins/translatable';
import { ErrorScreen, FriendlyError } from '../../private/ErrorScreen/ErrorScreen';
import { LoadingScreen } from '../../private/LoadingScreen/LoadingScreen';
import { AdminLoadSuccessEvent, machine } from './machine';
import { navigation } from './navigation';
import { AdminDashboard } from './private/AdminDashboard/AdminDashboard';
import { AdminNavigation, Navigation } from './private/AdminNavigation/AdminNavigation';
import { AdminSignIn } from './private/AdminSignIn';
import { AdminSignOut } from './private/AdminSignOut';
import { routes } from './routes';
import { FxBookmark, FxStore } from './types';

type StoreCurie = keyof Omit<FxStore['_links'], 'curies'>;

interface RelElement extends Element {
  href: string;
  rel: string;
}

function isRelElement(node: Node): node is RelElement {
  return node.nodeType === Node.ELEMENT_NODE && 'rel' in node;
}

export class Admin extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-admin-navigation': AdminNavigation,
      'x-admin-dashboard': AdminDashboard,
      'x-loading-screen': LoadingScreen,
      'x-admin-sign-out': AdminSignOut,
      'x-admin-sign-in': AdminSignIn,
      'x-error-screen': ErrorScreen,
    };
  }

  public static get styles(): CSSResultArray {
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

  private __outletObserver = new MutationObserver(mutations => {
    for (const { type, addedNodes } of mutations) {
      if (type !== 'childList') continue;

      for (let i = 0; i < addedNodes.length; ++i) {
        const node = addedNodes[i];
        if (!isRelElement(node)) continue;

        const curie = `fx:${node.rel}`;
        const links = this.__service.state.context.store?._links;

        if (links && curie in links) node.href = links[curie as StoreCurie].href;
      }
    }
  });

  private __machine = machine.withConfig({
    services: { load: () => this.__load() },
  });

  private __navigation = navigation;

  private __service = interpret(this.__machine);

  private __router = new Router();

  private __routes = routes;

  public constructor() {
    super('admin');
    this.__linkInternalPages();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    addEventListener('vaadin-router-location-changed', this.__routerListener);
    if (!this.__service.initialized) this.__initService();
  }

  public disconnectedCallback(): void {
    super.connectedCallback();
    removeEventListener('vaadin-router-location-changed', this.__routerListener);
  }

  public render(): TemplateResult {
    const { state } = this.__service;
    const { error } = state.context;

    const addHref = <T extends { name: string }>(route: T) => {
      try {
        return { ...route, href: this.__router.urlForName(route.name) };
      } catch {
        return { ...route, href: '' };
      }
    };

    const navigation: Navigation = this.__navigation.map(topRoute => {
      if ('name' in topRoute) return addHref(topRoute);
      return Object.assign({}, topRoute, {
        children: topRoute.children.map(childRoute => {
          if ('name' in childRoute) return addHref(childRoute);
          return { ...childRoute, children: childRoute.children.map(addHref) };
        }),
      });
    });

    const showsNavigation = !this.__router.location.route?.name?.includes('sign-');

    return html`
      <div class="bg-base w-full h-full relative overflow-hidden">
        <div
          id="outlet"
          class="absolute overflow-auto ${showsNavigation ? 'inset-nav' : 'inset-0'} scroll-touch"
          @request=${this.__handleRequest}
        ></div>

        ${showsNavigation
          ? html`
              <x-admin-navigation
                .navigation=${navigation}
                class="relative h-full pointer-events-none"
                route=${this.__router.location.route?.name ?? ''}
                lang=${this.lang}
                ns=${this.ns}
              >
              </x-admin-navigation>
            `
          : ''}
        ${state.matches('loading')
          ? html`<x-loading-screen></x-loading-screen>`
          : state.matches('error')
          ? html`<x-error-screen lang=${this.lang} type=${error!}></x-error-screen>`
          : ''}
      </div>
    `;
  }

  public firstUpdated(): void {
    this.__initRouter();
  }

  /** Processes all API requests from the admin pages. */
  private __handleRequest(evt: RequestEvent) {
    evt.detail.handle(async (...init) => {
      const url = init[0] ?? '/';
      const ctx = this.__service.state.context;
      const method = init[1]?.method?.toUpperCase() ?? 'GET';
      const isBookmark = (ctx.bookmark && url === '/') || url === ctx.bookmark?._links.self.href;
      const isStore = url === ctx.store?._links.self.href;
      const isUser = url === ctx.user?._links.self.href;

      // respond with cached data if possible
      if (method === 'GET') {
        if (isBookmark) return new Response(JSON.stringify(ctx.bookmark), { status: 200 });
        if (isStore) return new Response(JSON.stringify(ctx.store), { status: 200 });
        if (isUser) return new Response(JSON.stringify(ctx.user), { status: 200 });
      }

      // pass this request along otherwise
      const response = await RequestEvent.emit({ source: this, init });

      // react to special requests
      if (response.status === 200) {
        if (url === 'foxy://sign-out') this.__service.send('SIGN_OUT');
        if (url === 'foxy://sign-in') this.__service.send('SIGN_IN');
      }

      // sign out on 401 Unauthorized
      if (response.status === 401) this.__service.send('SIGN_OUT');

      // update cached data if possible
      if (['PATCH', 'POST', 'PUT'].includes(method) && response.ok) {
        const data = await response.json();

        if (isBookmark) this.__service.state.context.bookmark = data;
        if (isStore) this.__service.state.context.store = data;
        if (isUser) this.__service.state.context.user = data;

        this.requestUpdate();
      }

      return response;
    });
  }

  /** Redirects users from the page they're on to the sign-in page. */
  private __handleUnauthorizedState() {
    if (this.__router.location.route?.name !== 'sign-in') {
      this.__router.render(this.__router.urlForName('sign-in'), true);
    }
  }

  /** Redirects users from the auth pages on successful sign-in. */
  private __handleIdleState() {
    if (this.__router.location.route?.name?.includes('sign-')) {
      const redirect = new URLSearchParams(location.search).get('redirect');
      this.__router.render(redirect ?? this.__router.urlForName('dashboard'), true);
    }
  }

  /** Injects scoped internal page names into the routes config. */
  private __linkInternalPages() {
    const host = this.constructor as typeof ScopedElementsHost;
    const signInRoute = this.__routes.find(v => v.name === 'sign-in');
    const signOutRoute = this.__routes.find(v => v.name === 'sign-out');
    const dashboardRoute = this.__routes.find(v => v.name === 'dashboard');

    if (signInRoute) signInRoute.component = host.getScopedTagName('x-admin-sign-in');
    if (signOutRoute) signOutRoute.component = host.getScopedTagName('x-admin-sign-out');
    if (dashboardRoute) dashboardRoute.component = host.getScopedTagName('x-admin-dashboard');
  }

  private __initService() {
    this.__service
      .onTransition(({ changed, value }) => {
        if (!changed) return;
        if (value === 'idle') this.__handleIdleState();
        if (value === 'unauthorized') this.__handleUnauthorizedState();
        this.requestUpdate();
      })
      .onChange(() => this.requestUpdate())
      .start();
  }

  private __initRouter() {
    const outlet = this.shadowRoot!.getElementById('outlet')!;

    this.__router.setOutlet(outlet);
    this.__router.setRoutes(this.__routes);
    this.__outletObserver.observe(outlet, { childList: true });
  }

  /** Fetches initial state from the API. */
  private async __load(): Promise<AdminLoadSuccessEvent['data']> {
    try {
      const bookmarkResponse = await RequestEvent.emit({
        source: this,
        init: ['/'],
      });

      if (!bookmarkResponse.ok) {
        const type = bookmarkResponse.status === 401 ? 'unauthorized' : 'unknown';
        throw new FriendlyError(type);
      }

      const bookmark = (await bookmarkResponse.json()) as FxBookmark;
      const contentResponses = await Promise.all([
        RequestEvent.emit({ source: this, init: [bookmark._links['fx:store'].href] }),
        RequestEvent.emit({ source: this, init: [bookmark._links['fx:user'].href] }),
      ]);

      if (contentResponses.some(r => r.status === 401)) throw new FriendlyError('unauthorized');
      if (contentResponses.some(r => !r.ok)) throw new FriendlyError('unknown');

      return {
        bookmark,
        store: await contentResponses[0].json(),
        user: await contentResponses[1].json(),
      };
    } catch (err) {
      if (err instanceof FriendlyError) throw err;
      if (err instanceof UnhandledRequestError) throw new FriendlyError('setup_needed');
      throw new FriendlyError('unknown');
    }
  }
}
