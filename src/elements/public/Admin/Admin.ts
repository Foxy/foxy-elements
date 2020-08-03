import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Router } from '@vaadin/router';
import { css, CSSResultArray, html, TemplateResult } from 'lit-element';
import { interpret } from 'xstate';
import { Translatable } from '../../../mixins/translatable';
import { ErrorScreen, FriendlyError } from '../../private/ErrorScreen/ErrorScreen';
import { LoadingScreen } from '../../private/LoadingScreen/LoadingScreen';
import { machine, AdminLoadSuccessEvent } from './machine';
import { navigation } from './navigation';
import { AdminNavigation, Navigation } from './private/AdminNavigation/AdminNavigation';
import { routes } from './routes';
import { FxBookmark, FxStore } from './types';
import { RequestEvent, UnhandledRequestError } from '../../../events/request';

type StoreCurie = keyof Omit<FxStore['_links'], 'curies'>;

interface RelElement extends Element {
  constructor: { rel: string };
  href: string;
}

function isRelElement(node: Node): node is RelElement {
  return node.nodeType === Node.ELEMENT_NODE && 'rel' in node.constructor;
}

export class Admin extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-admin-navigation': AdminNavigation,
      'x-loading-screen': LoadingScreen,
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

        const curie = `fx:${node.constructor.rel}`;
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
  }

  public connectedCallback(): void {
    super.connectedCallback();
    addEventListener('vaadin-router-location-changed', this.__routerListener);

    if (!this.__service.initialized) {
      this.__service
        .onChange(() => this.requestUpdate())
        .onTransition(({ changed }) => changed && this.requestUpdate())
        .start();
    }
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

    return html`
      <div class="bg-base w-full h-full relative overflow-hidden">
        <div id="outlet" class="absolute overflow-auto inset-nav scroll-touch"></div>

        <x-admin-navigation
          .navigation=${navigation}
          class="relative h-full pointer-events-none"
          route=${this.__router.location.route?.name ?? ''}
          lang=${this.lang}
          ns=${this.ns}
        >
        </x-admin-navigation>

        ${state.matches('loading')
          ? html`<x-loading-screen></x-loading-screen>`
          : state.matches('error')
          ? html`<x-error-screen lang=${this.lang} type=${error!}></x-error-screen>`
          : ''}
      </div>
    `;
  }

  public firstUpdated(): void {
    const outlet = this.shadowRoot!.getElementById('outlet')!;

    this.__router.setOutlet(outlet);
    this.__router.setRoutes(this.__routes);
    this.__outletObserver.observe(outlet, { childList: true });
  }

  private async __load(): Promise<AdminLoadSuccessEvent['data']> {
    try {
      const bookmarkResponse = await RequestEvent.emit({
        source: this,
        init: ['/'],
      });

      if (!bookmarkResponse.ok) {
        const type = bookmarkResponse.status === 403 ? 'unauthorized' : 'unknown';
        throw new FriendlyError(type);
      }

      const bookmark = (await bookmarkResponse.json()) as FxBookmark;
      const contentResponses = await Promise.all([
        RequestEvent.emit({ source: this, init: [bookmark._links['fx:store'].href] }),
        RequestEvent.emit({ source: this, init: [bookmark._links['fx:user'].href] }),
      ]);

      if (contentResponses.some(r => r.status === 403)) throw new FriendlyError('unauthorized');
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
