import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@polymer/paper-spinner/paper-spinner-lite.js';

import { CSSResultArray, PropertyDeclarations, TemplateResult, css, html } from 'lit-element';

import { I18N } from '../../private/index';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../mixins/translatable';

export type SpinnerElementLayout = 'vertical' | 'horizontal';
export type SpinnerElementState = 'end' | 'busy' | 'error' | 'empty' | 'paused';

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
      layout: { type: String },
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

  layout: SpinnerElementLayout = 'horizontal';

  state: SpinnerElementState = 'busy';

  constructor() {
    super('spinner');
  }

  render(): TemplateResult {
    let layout: string;
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
    } else if (this.state === 'empty') {
      icon = html`<iron-icon icon="icons:info-outline"></iron-icon>`;
      text = 'empty';
      tint = 'text-tertiary';
    } else {
      icon = html`<paper-spinner-lite active></paper-spinner-lite>`;
      text = 'busy';
      tint = 'text-primary';
    }

    if (this.layout === 'horizontal') {
      layout = 'flex items-center space-x-s h-xxs';
    } else {
      layout = 'flex flex-col items-center space-y-s';
    }

    return html`
      <div class="font-lumo leading-none text-s ${layout} ${tint}">
        <div class="w-xxs h-xss flex items-center justify-center">${icon}</div>
        <x-i18n ns=${this.ns} key=${text} lang=${this.lang}></x-i18n>
      </div>
    `;
  }
}
