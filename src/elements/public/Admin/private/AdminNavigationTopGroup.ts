import { Router } from '@vaadin/router';
import { html, property, css } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';
import { I18N } from '../../../private/index';
import { NavigationTopGroup } from '../navigation';
import { AdminNavigationTopGroupLink } from './AdminNavigationTopGroupLink';

export class AdminNavigationTopGroup extends Translatable {
  public static get scopedElements() {
    return {
      'x-admin-navigation-top-group-link': AdminNavigationTopGroupLink,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  public static get styles() {
    return [
      super.styles,
      css`
        .bottom-nav {
          --nav-padding: calc(var(--lumo-space-xs) * 4);
          --nav-divider: 1px;
          --nav-icon: var(--lumo-size-xxs, 1.5rem);
          --nav-text: calc(var(--lumo-line-height-m) * var(--lumo-font-size-xxxs, 0.5625rem));
          bottom: calc(var(--nav-padding) + var(--nav-icon) + var(--nav-text) + var(--nav-divider));
        }
      `,
    ];
  }

  private get __active() {
    return this.group.children.some(child => {
      if ('name' in child) return child.name === this.router?.location.route?.name;
      return child.children.some(({ name }) => name === this.router?.location.route?.name);
    });
  }

  private __routerListener = () => this.requestUpdate();

  @property()
  public inactive = false;

  @property({ type: Object })
  public router?: Router;

  @property({ type: Object })
  public group: NavigationTopGroup = { label: '', icon: '', children: [] };

  @property({ type: Boolean })
  public open = false;

  public connectedCallback() {
    super.connectedCallback();
    window.addEventListener('vaadin-router-location-changed', this.__routerListener);
  }

  public render() {
    const highlighted = !this.inactive && (this.open || this.__active);

    const detailsClass = [
      'font-lumo',
      'md:border md:border-transparent md:rounded-t-l md:rounded-b-l',
      highlighted
        ? 'md:bg-base md:border-contrast-10'
        : 'md:hover:bg-base md:hover:border-contrast-10',
    ].join(' ');

    const summaryClass = [
      'focus:outline-none md:rounded-t-l md:focus:shadow-outline',
      this.open ? 'md:rounded-b-none' : 'md:rounded-b-l',
    ].join(' ');

    const summaryContentClass = [
      highlighted ? 'text-primary' : 'text-body',
      'text-center group p-xs cursor-pointer transition-colors duration-200 rounded md:rounded-t-l',
      'md:flex md:items-center md:p-s md:hover:text-primary',
      this.open ? 'md:rounded-b-none' : 'md:rounded-b-l',
    ].join(' ');

    const contentClass = [
      'absolute top-0 bottom-nav inset-x-0 text-l bg-base overflow-auto',
      'md:pl-xl md:rounded-b-l md:relative md:bottom-auto md:overflow-hidden md:bg-transparent md:border-t md:border-contrast-10',
    ].join(' ');

    const divider = html`<div class="hidden ml-s border-t border-contrast-10 md:block"></div>`;

    return html`
      <details ?open=${this.open} class=${detailsClass} @toggle=${this.__handleToggle}>
        <summary class=${summaryClass}>
          <div class=${summaryContentClass}>
            <iron-icon class="block mx-auto h-xxs w-xxs md:ml-0 md:mr-m" icon=${this.group.icon}>
            </iron-icon>

            <x-i18n
              class="block leading-m text-xxxs md:font-medium md:text-left md:text-m"
              .lang=${this.lang}
              .key=${this.group.label}
              .ns=${this.ns}
            >
            </x-i18n>

            <iron-icon
              class="hidden ml-auto md:group-hover:text-primary md:block"
              icon=${`lumo:angle-${this.open ? 'up' : 'down'}`}
            >
            </iron-icon>
          </div>
        </summary>

        <div class=${contentClass}>
          <iron-icon class="text-primary m-m w-xs h-xs md:hidden" icon="foxy:logo"></iron-icon>

          <div class="px-m pb-s pt-m text-xxl font-bold text-header md:hidden">
            <x-i18n .ns=${this.ns} .lang=${this.lang} .key=${this.group.label}></x-i18n>
          </div>

          <div class="mb-xl md:my-s">
            ${this.group.children.map((child, i) =>
              'name' in child
                ? html`
                    <x-admin-navigation-top-group-link
                      .router=${this.router}
                      .link=${child}
                      .lang=${this.lang}
                      .ns=${this.ns}
                    >
                    </x-admin-navigation-top-group-link>
                  `
                : html`
                    ${i > 0 ? divider : ''}
                    <div class="my-m md:my-s">
                      <div class="text-l leading-m font-bold text-header px-m mb-s md:hidden">
                        <x-i18n .ns=${this.ns} .lang=${this.lang} .key=${child.label}></x-i18n>
                      </div>

                      ${child.children.map(
                        nestedChild =>
                          html`
                            <x-admin-navigation-top-group-link
                              .router=${this.router}
                              .link=${nestedChild}
                              .lang=${this.lang}
                              .ns=${this.ns}
                            >
                            </x-admin-navigation-top-group-link>
                          `
                      )}
                    </div>
                  `
            )}
          </div>
        </div>
      </details>
    `;
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('vaadin-router-location-changed', this.__routerListener);
  }

  private __handleToggle(evt: Event) {
    const target = evt.currentTarget as HTMLDetailsElement;
    if (target.open) {
      this.dispatchEvent(new CustomEvent('open'));
    } else if (this.open) {
      if (window.innerWidth < 768) {
        target.open = true;
      } else {
        this.dispatchEvent(new CustomEvent('close'));
      }
    }
  }
}
