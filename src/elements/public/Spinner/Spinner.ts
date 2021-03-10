import {
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { Themeable } from '../../../mixins/themeable';

export type SpinnerLayout = 'vertical' | 'horizontal';
export type SpinnerState = 'end' | 'busy' | 'error' | 'empty' | 'paused';

export class Spinner extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      layout: { type: String },
      state: { type: String },
      ns: { type: String },
    };
  }

  static get styles(): CSSResultArray {
    return [
      Themeable.styles,
      css`
        paper-spinner-lite {
          --paper-spinner-stroke-width: 2px;
          --paper-spinner-color: currentColor;
          height: 19px;
          width: 19px;
          margin: 2.5px;
        }
      `,
    ];
  }

  layout: SpinnerLayout = 'horizontal';

  state: SpinnerState = 'busy';

  ns = 'shared';

  render(): TemplateResult {
    let layout: string;
    let icon: TemplateResult;
    let text: string;
    let tint: string;

    if (this.state === 'end') {
      icon = html`<iron-icon data-testid="icon" icon="icons:done-all"></iron-icon>`;
      text = 'loading_end';
      tint = 'text-tertiary';
    } else if (this.state === 'error') {
      icon = html`<iron-icon data-testid="icon" icon="icons:error-outline"></iron-icon>`;
      text = 'loading_error';
      tint = 'text-error';
    } else if (this.state === 'paused') {
      icon = html`<iron-icon data-testid="icon" icon="icons:more-horiz"></iron-icon>`;
      text = 'loading_paused';
      tint = 'text-tertiary';
    } else if (this.state === 'empty') {
      icon = html`<iron-icon data-testid="icon" icon="icons:info-outline"></iron-icon>`;
      text = 'loading_empty';
      tint = 'text-tertiary';
    } else {
      icon = html`<paper-spinner-lite data-testid="icon" active></paper-spinner-lite>`;
      text = 'loading_busy';
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
        <foxy-i18n data-testid="text" ns="${this.ns} spinner" key=${text} lang=${this.lang}>
        </foxy-i18n>
      </div>
    `;
  }
}
