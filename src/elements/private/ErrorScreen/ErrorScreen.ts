import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { css, CSSResultArray, property } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { Translatable } from '../../../mixins/translatable';
import { I18N } from '../I18N/I18N';

export type ErrorType = 'unknown' | 'setup_needed' | 'unauthorized';

export class FriendlyError extends Error {
  constructor(public type: ErrorType = 'unknown') {
    super();
  }
}

export class ErrorScreen extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }

        .container-narrow {
          max-width: 400px;
        }
      `,
    ];
  }

  @property({ type: String })
  public type: ErrorType = 'unknown';

  public render(): TemplateResult {
    return html`
      <article
        class="bg-base font-lumo text-center leading-m p-m h-full flex flex-col items-center justify-center"
      >
        <iron-icon icon="lumo:error" class="text-error w-l h-l mb-m"></iron-icon>

        <header class="text-xl text-header container-narrow font-medium">
          <x-i18n ns=${this.ns} lang=${this.lang} key="errors.${this.type}.title"></x-i18n>
        </header>

        <p class="text-m text-secondary container-narrow mb-l">
          <x-i18n ns=${this.ns} lang=${this.lang} key="errors.${this.type}.message"></x-i18n>
        </p>

        <a
          rel="nofollow noreferrer noopener"
          href=${this._i18n.t(`errors.${this.type}.href`).toString()}
          target="_blank"
          class="px-m py-xs text-primary font-medium tracking-wide border border-contrast-10 rounded transition-colors duration-200 hover:bg-primary-10 hover:border-primary-10 focus:outline-none focus:shadow-outline"
          router-ignore
        >
          <x-i18n ns=${this.ns} lang=${this.lang} key="errors.${this.type}.action"></x-i18n>
        </a>
      </article>
    `;
  }
}
