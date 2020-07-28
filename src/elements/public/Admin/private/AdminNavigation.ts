import { Router } from '@vaadin/router';
import { css, html, internalProperty, property } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';
import { Navigation } from '../navigation';
import { AdminNavigationTopGroup } from './AdminNavigationTopGroup';
import { AdminNavigationTopLink } from './AdminNavigationTopLink';

export class AdminNavigation extends Translatable {
  public static get scopedElements() {
    return {
      'x-admin-navigation-top-group': AdminNavigationTopGroup,
      'x-admin-navigation-top-link': AdminNavigationTopLink,
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  public static get styles() {
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

  private __routerListener = () => this.__resetGroups();
  private __resizeListener = () => (this.__resetGroups(), this.requestUpdate());

  private get __mobile() {
    return window.innerWidth < 768;
  }

  private get __group() {
    const query = new URLSearchParams(location.search);
    const group = parseInt(query.get(this.activeGroupIndexKey) ?? '', 10);
    return isNaN(group) ? undefined : group;
  }
  private set __group(value: number | undefined) {
    const url = new URL(location.toString());

    if (value === undefined) {
      url.searchParams.delete(this.activeGroupIndexKey);
      if (this.__group) this.__closeGroup(this.__group);
    } else {
      url.searchParams.set(this.activeGroupIndexKey, value.toString(10));
    }

    history.replaceState(history.state, document.title, url.toString());
  }

  @internalProperty()
  private __openGroups: number[] = [];

  @property({ type: Object })
  public router?: Router;

  @property({ type: Array })
  public navigation: Navigation = [];

  @property({ type: String })
  public activeGroupIndexKey = 'group';

  public connectedCallback() {
    super.connectedCallback();
    addEventListener('vaadin-router-location-changed', this.__routerListener);
    addEventListener('resize', this.__resizeListener);
  }

  public render() {
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

  public updated(changedPropeties: Map<keyof AdminNavigation, unknown>) {
    if (changedPropeties.has('router')) this.__resetGroups();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener('vaadin-router-location-changed', this.__routerListener);
    removeEventListener('resize', this.__resizeListener);
  }

  private __resetGroups() {
    this.__openGroups = [];

    if (this.__group !== undefined) return this.__openGroup(this.__group);

    const route = this.router?.location.route;
    const index = this.navigation.findIndex(topEntry => {
      if ('children' in topEntry) {
        return topEntry.children.some(subEntry => {
          if ('name' in subEntry) return subEntry.name === route?.name;
          return subEntry.children.some(({ name }) => name === route?.name);
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
          class=${className}
          .inactive=${this.__mobile && this.__openGroups.length > 0}
          .router=${this.router}
          .link=${item}
          .lang=${this.lang}
          .ns=${this.ns}
        >
        </x-admin-navigation-top-link>
      `;
    } else {
      return html`
        <x-admin-navigation-top-group
          class=${className}
          .inactive=${this.__mobile && !open && this.__group !== undefined}
          .router=${this.router}
          .group=${item}
          .open=${open}
          .lang=${this.lang}
          .ns=${this.ns}
          @open=${() => this.__openGroup(index)}
          @close=${() => this.__closeGroup(index)}
        >
        </x-admin-navigation-top-group>
      `;
    }
  }
}
