import { html, internalProperty, property, css } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';
import { NavigationTopLink } from '../navigation';
import { Router } from '@vaadin/router';
import { I18N } from '../../../private/index';

export class AdminNavigationTopGroupLink extends Translatable {
  public static get scopedElements() {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  public static get styles() {
    return [
      super.styles,
      css`
        :host:first-child::before {
          content: ' ';
          display: block;
          border-top: 1px solid var(--lumo-contrast-10pct);
          margin-left: var(--lumo-space-s);
        }

        @media all and (min-width: 768px) {
          :host:first-child::before {
            display: none;
          }
        }
      `,
    ];
  }

  private __routerListener = this.__handleLocationChange.bind(this);

  @internalProperty()
  private __active = false;

  @property({ type: Object })
  public link: NavigationTopLink = { label: '', name: '', icon: '' };

  @property({ type: Object })
  public router?: Router;

  public get href() {
    try {
      return this.router?.urlForName(this.link.name) ?? '';
    } catch {
      return '';
    }
  }

  public connectedCallback() {
    super.connectedCallback();
    window.addEventListener('vaadin-router-location-changed', this.__routerListener);
    this.__updateActive();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('vaadin-router-location-changed', this.__routerListener);
  }

  public render() {
    const textClass = [
      'transition-colors duration-200 relative text-primary',
      'md:text-s md:font-medium md:group-hover:text-primary',
      this.__active ? 'md:text-primary' : 'md:text-secondary',
    ].join(' ');

    return html`
      <a
        class="group px-m py-s flex justify-between items-center focus:outline-none md:focus:shadow-outline md:rounded-s md:m-xs md:leading-m md:px-xs md:py-0"
        href=${this.href}
      >
        <x-i18n class=${textClass} .ns=${this.ns} .lang=${this.lang} .key=${this.link.label}>
        </x-i18n>

        <iron-icon class="text-tertiary md:hidden" icon="lumo:angle-right"></iron-icon>
      </a>

      <div class="ml-m border-contrast-10 border-t md:hidden"></div>
    `;
  }

  private __handleLocationChange(evt: VaadinRouterLocationChangedEvent) {
    if (evt.detail.router !== this.router) return;
    this.__updateActive();
  }

  private __updateActive() {
    this.__active = this.router?.location.route?.name === this.link.name;
  }
}
