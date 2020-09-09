import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { css, CSSResultArray, html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../../mixins/translatable';
import { I18N } from '../../../../../private/index';
import { AdminNavigationTopGroupLink } from './AdminNavigationTopGroupLink/AdminNavigationTopGroupLink';

interface NavigationItem {
  label: string;
}

export interface NavigationLink extends NavigationItem {
  name: string;
  href: string;
}

export interface NavigationGroup<TChildren = NavigationLink> extends NavigationItem {
  children: TChildren[];
}

export class AdminNavigationTopGroup extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-admin-navigation-top-group-link': AdminNavigationTopGroupLink,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  public static get styles(): CSSResultArray {
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

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      active: { type: Boolean },
      route: { type: String },
      items: { type: Array },
      label: { type: String },
      icon: { type: String },
      open: { type: Boolean },
    };
  }

  public active = false;

  public route = '';

  public items: (NavigationLink | NavigationGroup)[] = [];

  public label = '';

  public icon = '';

  public open = false;

  public render(): TemplateResult {
    const detailsClass = [
      'font-lumo transition-colors duration-100',
      'md:border md:border-transparent md:rounded-t-l md:rounded-b-l',
      this.active || this.open
        ? 'md:bg-base md:border-contrast-10'
        : 'md:hover:bg-base md:hover:border-contrast-10',
    ].join(' ');

    const summaryClass = [
      'focus:outline-none md:rounded-t-l md:focus:shadow-outline',
      this.open ? 'md:rounded-b-none' : 'md:rounded-b-l',
    ].join(' ');

    const summaryContentClass = [
      this.active || this.open ? 'text-primary' : 'text-body',
      'text-center group p-xs cursor-pointer transition-colors duration-200',
      'md:flex md:items-center md:p-s md:hover:text-primary',
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
            <iron-icon class="block mx-auto h-xxs w-xxs md:ml-0 md:mr-m" icon=${this.icon}>
            </iron-icon>

            <x-i18n
              class="block leading-m text-xxxs md:font-medium md:text-left md:text-m"
              data-testid="i18n"
              lang=${this.lang}
              key=${this.label}
              ns=${this.ns}
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
            <x-i18n ns=${this.ns} lang=${this.lang} key=${this.label}></x-i18n>
          </div>

          <div class="mb-xl md:my-s">
            ${this.items.map((child, i) =>
              'name' in child
                ? html`
                    <x-admin-navigation-top-group-link
                      data-testclass="item"
                      ?active=${this.route === child.name}
                      label=${child.label}
                      href=${child.href}
                      lang=${this.lang}
                      ns=${this.ns}
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
                              data-testclass="item"
                              ?active=${this.route === nestedChild.name}
                              label=${nestedChild.label}
                              href=${nestedChild.href}
                              lang=${this.lang}
                              ns=${this.ns}
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

  /* istanbul ignore next: very specific <details> behavior */
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
