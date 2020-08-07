import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { css, CSSResultArray, html, internalProperty, property, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';

import {
  AdminNavigationTopGroup,
  NavigationGroup,
  NavigationLink,
} from './AdminNavigationTopGroup/AdminNavigationTopGroup';

import { AdminNavigationTopLink } from './AdminNavigationTopGroup/AdminNavigationTopLink/AdminNavigationTopLink';

export interface NavigationTopItem {
  icon: string;
  slot?: 'top' | 'bottom';
  hide?: 'mobile';
}

export interface NavigationTopLink extends NavigationLink, NavigationTopItem {}

export interface NavigationTopGroup
  extends NavigationGroup<NavigationLink | NavigationGroup>,
    NavigationTopItem {}

export type Navigation = Array<NavigationTopGroup | NavigationTopLink>;

export class AdminNavigation extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-admin-navigation-top-group': AdminNavigationTopGroup,
      'x-admin-navigation-top-link': AdminNavigationTopLink,
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        @media all and (min-width: 768px) {
          nav {
            width: var(--md-nav-width);
          }
        }
      `,
    ];
  }

  private __resizeQL = window.matchMedia('(max-width: 768px)');
  private __resizeListener = () => (this.__resetGroups(), this.requestUpdate());
  private __activeGroupIndexKey = 'group';

  private get __mobile() {
    return window.innerWidth < 768;
  }

  private get __group() {
    const query = new URLSearchParams(location.search);
    const group = parseInt(query.get(this.__activeGroupIndexKey) ?? '', 10);
    return isNaN(group) ? undefined : group;
  }
  private set __group(value: number | undefined) {
    const url = new URL(location.toString());

    if (value === undefined) {
      url.searchParams.delete(this.__activeGroupIndexKey);
      if (this.__group) this.__closeGroup(this.__group);
    } else {
      url.searchParams.set(this.__activeGroupIndexKey, value.toString(10));
    }

    history.replaceState(history.state, document.title, url.toString());
  }

  @internalProperty()
  private __openGroups: number[] = [];

  @property({ type: String })
  public route = '';

  @property({ type: Array })
  public navigation: Navigation = [];

  public connectedCallback(): void {
    super.connectedCallback();
    this.__resizeQL.addListener(this.__resizeListener);
  }

  public render(): TemplateResult {
    const navClass = [
      'pointer-events-auto p-xs group bg-base border-t border-contrast-10 flex',
      'md:bg-contrast-5 md:p-s md:border-t-0 md:border-r md:space-y-s md:flex-col md:h-full md:overflow-auto',
    ].join(' ');

    return html`
      <div class="absolute inset-0 flex flex-col justify-end md:flex-row md:justify-start">
        <nav class=${navClass}>
          <iron-icon
            class="hidden text-primary m-s mb-m w-xs h-xs md:inline-block"
            icon="foxy:logo"
          >
          </iron-icon>

          ${this.navigation.map((item, index) => {
            if (!('slot' in item) || item.slot === 'top') return this.__renderItem(item, index);
          })}

          <div class="hidden md:block flex-1"></div>

          ${this.navigation.map((item, index) => {
            if ('slot' in item && item.slot === 'bottom') return this.__renderItem(item, index);
          })}
        </nav>
      </div>
    `;
  }

  public updated(changedPropeties: Map<keyof AdminNavigation, unknown>): void {
    if (changedPropeties.has('route')) this.__resetGroups();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__resizeQL.removeListener(this.__resizeListener);
  }

  private __resetGroups() {
    this.__openGroups = [];

    if (this.__group !== undefined) return this.__openGroup(this.__group);

    const index = this.navigation.findIndex(topEntry => {
      if ('children' in topEntry) {
        return topEntry.children.some(subEntry => {
          if ('name' in subEntry) return subEntry.name === this.route;
          return subEntry.children.some(({ name }) => name === this.route);
        });
      }
    });

    if (index !== -1) {
      if ((this.__mobile && this.__group === index) || !this.__mobile) {
        this.__openGroup(index);
      }
    }
  }

  private __openGroup(index: number) {
    this.__openGroups = this.__mobile ? [index] : [...this.__openGroups, index];
    this.__group = this.__mobile ? index : undefined;
  }

  private __closeGroup(index: number) {
    this.__openGroups = this.__mobile ? [] : this.__openGroups.filter(v => v !== index);
  }

  private __renderItem(item: Navigation[number], index: number) {
    const open = this.__openGroups.includes(index);
    const mdAndUp = 'hide' in item && item.hide === 'mobile';
    const className = mdAndUp ? 'hidden md:block' : 'flex-1 md:flex-none';

    if ('name' in item) {
      return html`
        <x-admin-navigation-top-link
          data-testclass="item"
          class=${className}
          ?active=${this.route === item.name && (!this.__mobile || this.__openGroups.length === 0)}
          label=${item.label}
          href=${item.href}
          icon=${item.icon}
          lang=${this.lang}
          ns=${this.ns}
        >
        </x-admin-navigation-top-link>
      `;
    } else {
      const active = item.children.some(child => {
        if ('name' in child) return child.name === this.route;
        return child.children.some(({ name }) => name === this.route);
      });

      return html`
        <x-admin-navigation-top-group
          data-testclass="item"
          .items=${item.children}
          ?open=${open}
          ?active=${active && !(this.__mobile && !open && this.__group !== undefined)}
          route=${this.route}
          class=${className}
          label=${item.label}
          icon=${item.icon}
          lang=${this.lang}
          ns=${this.ns}
          @open=${() => this.__openGroup(index)}
          @close=${() => this.__closeGroup(index)}
        >
        </x-admin-navigation-top-group>
      `;
    }
  }
}
