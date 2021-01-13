import '@polymer/paper-spinner/paper-spinner-lite.js';
import '@polymer/iron-icons';
import '@polymer/iron-icon';

import { CSSResultArray, PropertyDeclarations, TemplateResult, css, html } from 'lit-element';

import { I18N } from '../../private';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { Translatable } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

export type SpinnerElementState = 'end' | 'busy' | 'error' | 'paused';

export class SpinnerElement extends Translatable {
  static readonly defaultNodeName = 'foxy-spinner';

  static get scopedElements(): ScopedElementsMap {
    return {
      'paper-spinner-lite': customElements.get('paper-spinner-lite'),
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      state: { type: String },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        paper-spinner-lite {
          --paper-spinner-stroke-width: 2px;
          --paper-spinner-color: currentColor;
          height: 18px;
          width: 18px;
        }
      `,
    ];
  }

  state: SpinnerElementState = 'busy';

  constructor() {
    super('spinner');
  }

  render(): TemplateResult {
    let icon: TemplateResult;
    let text: string;
    let tint: string;

    if (this.state === 'end') {
      icon = html`<iron-icon icon="icons:done-all"></iron-icon>`;
      text = 'end';
      tint = 'text-tertiary';
    } else if (this.state === 'error') {
      icon = html`<iron-icon icon="icons:error-outline"></iron-icon>`;
      text = 'error';
      tint = 'text-error';
    } else if (this.state === 'paused') {
      icon = html`<iron-icon icon="icons:more-horiz"></iron-icon>`;
      text = 'paused';
      tint = 'text-tertiary';
    } else {
      icon = html`<paper-spinner-lite active></paper-spinner-lite>`;
      text = 'busy';
      tint = 'text-primary';
    }

    return html`
      <div class="flex items-center space-x-s font-lumo text-s h-xxs ${tint}">
        <div class="w-xxs h-xss flex items-center justify-center">${icon}</div>
        <x-i18n ns=${this.ns} key=${text} lang=${this.lang}></x-i18n>
      </div>
    `;
  }
}
