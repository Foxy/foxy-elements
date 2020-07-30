import { html, property } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { I18N } from '../../../../private/index';

export class AdminNavigationTopLink extends Translatable {
  public static get scopedElements() {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  @property({ type: Boolean })
  public active = false;

  @property({ type: String })
  public label = '';

  @property({ type: String })
  public href = '';

  @property({ type: String })
  public icon = '';

  public render() {
    const wrapperClass = [
      'text-center block cursor-pointer transition-colors duration-200 rounded focus:outline-none',
      'md:border md:border-transparent md:rounded-t-l md:rounded-b-l md:hover:text-primary md:focus:shadow-outline',
      this.active
        ? 'text-primary md:bg-base md:border-contrast-10'
        : 'text-body md:hover:bg-base md:hover:border-contrast-10',
    ].join(' ');

    return html`
      <a class=${wrapperClass} href=${this.href}>
        <div class="p-xs md:flex md:items-center md:p-s">
          <iron-icon class="block mx-auto h-xxs w-xxs md:ml-0 md:mr-m" icon=${this.icon}>
          </iron-icon>

          <x-i18n
            class="block leading-m font-lumo text-xxxs md:font-medium md:text-left md:text-m"
            data-testid="i18n"
            .lang=${this.lang}
            .key=${this.label}
            .ns=${this.ns}
          >
          </x-i18n>
        </div>
      </a>
    `;
  }
}
