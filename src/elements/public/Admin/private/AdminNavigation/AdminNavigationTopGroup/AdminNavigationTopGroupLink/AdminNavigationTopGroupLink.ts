import { html, property, css } from 'lit-element';
import { Translatable } from '../../../../../../../mixins/translatable';
import { I18N } from '../../../../../../private/index';

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

  @property({ type: Boolean })
  public active = false;

  @property({ type: String })
  public label = '';

  @property({ type: String })
  public href = '';

  public render() {
    const textClass = [
      'transition-colors duration-200 relative text-primary',
      'md:text-s md:font-medium md:group-hover:text-primary',
      this.active ? 'md:text-primary' : 'md:text-secondary',
    ].join(' ');

    return html`
      <a
        class="group px-m py-s flex justify-between items-center focus:outline-none md:focus:shadow-outline md:rounded-s md:m-xs md:leading-m md:px-xs md:py-0"
        href=${this.href}
      >
        <x-i18n
          data-testid="i18n"
          class=${textClass}
          lang=${this.lang}
          key=${this.label}
          ns=${this.ns}
        >
        </x-i18n>

        <iron-icon class="text-tertiary md:hidden" icon="lumo:angle-right"></iron-icon>
      </a>

      <div class="ml-m border-contrast-10 border-t md:hidden"></div>
    `;
  }
}
