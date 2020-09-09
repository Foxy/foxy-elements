import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { Router } from '@vaadin/router';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';
import { I18N } from '../../../private/index';
import { NavigationTopLink } from '../navigation';

export class AdminNavigationTopLink extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      inactive: {},
      router: { type: Object },
      link: { type: Object },
    };
  }

  public inactive = false;

  public router?: Router;

  public link: NavigationTopLink = { label: '', name: '', icon: '' };

  private __routerListener = this.__handleLocationChange.bind(this);

  public get href(): string {
    try {
      return this.router?.urlForName(this.link.name) ?? '';
    } catch {
      return '';
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('vaadin-router-location-changed', this.__routerListener);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('vaadin-router-location-changed', this.__routerListener);
  }

  public render(): TemplateResult {
    const current = this.router?.location.route?.name === this.link.name;

    const wrapperClass = [
      'text-center block cursor-pointer transition-colors duration-200 rounded focus:outline-none',
      'md:border md:border-transparent md:rounded-t-l md:rounded-b-l md:hover:text-primary md:focus:shadow-outline',
      current && !this.inactive
        ? 'text-primary md:bg-base md:border-contrast-10'
        : 'text-body md:hover:bg-base md:hover:border-contrast-10',
    ].join(' ');

    return html`
      <a class=${wrapperClass} href=${this.href}>
        <div class="p-xs md:flex md:items-center md:p-s">
          <iron-icon class="block mx-auto h-xxs w-xxs md:ml-0 md:mr-m" icon=${this.link.icon}>
          </iron-icon>

          <x-i18n
            class="block leading-m font-lumo text-xxxs md:font-medium md:text-left md:text-m"
            .lang=${this.lang}
            .key=${this.link.label}
            .ns=${this.ns}
          >
          </x-i18n>
        </div>
      </a>
    `;
  }

  private __handleLocationChange(evt: VaadinRouterLocationChangedEvent) {
    if (evt.detail.router === this.router) this.requestUpdate();
  }
}
