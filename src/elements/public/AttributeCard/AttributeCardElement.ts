import { CSSResultArray, css } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { FormDialogElement } from '../FormDialog/index';
import { NucleonElement } from '../NucleonElement/index';
import { Skeleton } from '../../private/index';
import { Themeable } from '../../../mixins/themeable';

export class AttributeCardElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  static get styles(): CSSResultArray {
    return [
      Themeable.styles,
      css`
        :host(:focus-within) {
          box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
        }
      `,
    ];
  }

  render(): TemplateResult {
    const variant = this.in('busy') ? 'busy' : 'error';

    return html`
      <foxy-form-dialog
        header="edit"
        parent=${this.parent}
        form="foxy-attribute-form"
        href=${this.href}
        lang=${this.lang}
        id="form-dialog"
      >
      </foxy-form-dialog>

      <figure
        role="button"
        tabindex="0"
        class="text-body text-l font-lumo leading-m focus:outline-none"
        aria-live="polite"
        aria-busy=${this.in('busy')}
        @click=${this.__handleClick}
        @keydown=${this.__handleKeyDown}
      >
        <figcaption
          class="flex items-center space-x-xs uppercase text-xxs font-medium text-tertiary tracking-wider"
        >
          ${this.in({ idle: 'snapshot' })
            ? html`
                <span class="block truncate" title=${this.data.name} data-testid="name">
                  ${this.data.name}
                </span>

                ${this.data.visibility !== 'public'
                  ? html`
                      <iron-icon
                        icon="icons:lock"
                        style="--iron-icon-width: 1em; --iron-icon-height: 1em"
                      >
                      </iron-icon>
                    `
                  : ''}
              `
            : html`<x-skeleton variant=${variant} class="w-full"></x-skeleton>`}
        </figcaption>

        ${this.in({ idle: 'snapshot' })
          ? html`
              <span class="block truncate" title=${this.data.value} data-testid="value">
                ${this.data.value}
              </span>
            `
          : html`<x-skeleton variant=${variant} class="w-full"></x-skeleton>`}
      </figure>
    `;
  }

  private __handleClick(evt: Event) {
    const dialog = this.renderRoot.querySelector('#form-dialog') as FormDialogElement;
    dialog.show(evt.currentTarget as HTMLElement);
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.__handleClick(evt);
  }
}
