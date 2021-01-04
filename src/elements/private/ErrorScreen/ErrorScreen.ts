import { CSSResultArray, PropertyDeclarations, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { I18N } from '../I18N/I18N';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

export type ErrorType = 'unknown' | 'not_found' | 'setup_needed' | 'unauthorized';

export class FriendlyError {
  public type: ErrorType;

  constructor(type: ErrorType = 'unknown') {
    this.type = type;
  }
}

export class ErrorScreenReloadEvent extends CustomEvent<void> {
  constructor() {
    super('reload');
  }
}

export class ErrorScreen extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-button': ButtonElement,
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

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      elevated: { type: Boolean, reflect: true },
      reload: { type: Boolean, reflect: true },
      type: { type: String },
    };
  }

  public type: ErrorType = 'unknown';

  public reload = false;

  public elevated = false;

  public render(): TemplateResult {
    const actionKey = `errors.${this.type}.href`;
    const actionHref = this._i18n.t(`errors.${this.type}.href`).toString();

    return html`
      <div class="font-lumo leading-m h-full flex items-center justify-center">
        <article
          class=${classMap({
            'text-center': true,
            'bg-base rounded-t-l rounded-b-l p-xl m-m shadow-s': this.elevated,
          })}
        >
          <iron-icon icon="lumo:error" class="text-error w-l h-l mx-auto mb-m"></iron-icon>

          <header class="text-xl text-header container-narrow font-medium">
            <x-i18n ns=${this.ns} lang=${this.lang} key="errors.${this.type}.title"></x-i18n>
          </header>

          <p class="text-m text-secondary container-narrow mb-l">
            <x-i18n ns=${this.ns} lang=${this.lang} key="errors.${this.type}.message"></x-i18n>
          </p>

          <div class="flex justify-center space-x-s">
            ${actionKey !== actionHref
              ? html`
                  <a
                    rel="nofollow noreferrer noopener"
                    href=${actionHref}
                    target="_blank"
                    class="px-m py-xs text-primary font-medium tracking-wide border border-contrast-10 rounded transition-colors duration-200 hover:bg-primary-10 hover:border-primary-10 focus:outline-none focus:shadow-outline"
                    router-ignore
                  >
                    <x-i18n ns=${this.ns} lang=${this.lang} key="errors.${this.type}.action">
                    </x-i18n>
                  </a>
                `
              : ''}
            ${this.reload
              ? html`
                  <vaadin-button
                    data-testid="reload"
                    theme="primary"
                    @click=${() => this.dispatchEvent(new ErrorScreenReloadEvent())}
                  >
                    <x-i18n ns=${this.ns} lang=${this.lang} key="reload"></x-i18n>
                    <iron-icon icon="icons:refresh" slot="suffix"></iron-icon>
                  </vaadin-button>
                `
              : ''}
          </div>
        </article>
      </div>
    `;
  }
}
