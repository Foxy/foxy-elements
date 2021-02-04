import { CSSResultArray, css } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { FormDialogElement } from '../FormDialog';
import { NucleonElement } from '../NucleonElement';
import { Skeleton } from '../../private';
import { Themeable } from '../../../mixins/themeable';

export class AttributeCardElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'x-skeleton': Skeleton,
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
    const state = this.state;
    const variant = state.matches('busy') ? 'busy' : 'error';

    return html`
      <foxy-form-dialog
        header="edit"
        form="foxy-attribute-form"
        href=${this.href}
        lang=${this.lang}
        id="form-dialog"
      >
      </foxy-form-dialog>

      <figure
        role="button"
        tabindex="0"
        class="text-body text-l font-lumo leading-s focus:outline-none"
        aria-live="polite"
        aria-busy=${state.matches('busy')}
        @click=${this.__handleClick}
      >
        <figcaption class="uppercase text-xxs font-medium text-tertiary tracking-wider">
          ${state.matches({ idle: 'snapshot' })
            ? html`<span class="truncate">${state.context.data.name}</span>`
            : html`<x-skeleton variant=${variant} class="w-full"></x-skeleton>`}
        </figcaption>

        ${state.matches({ idle: 'snapshot' })
          ? html`<span class="truncate">${state.context.data.value}</span>`
          : html`<x-skeleton variant=${variant} class="w-full"></x-skeleton>`}
      </figure>
    `;
  }

  private __handleClick() {
    if (this.state.matches({ idle: 'snapshot' })) {
      const dialog = this.renderRoot.querySelector('#form-dialog') as FormDialogElement;
      dialog.show();
    }
  }
}
