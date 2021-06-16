import {
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';

export type SpinnerLayout = 'vertical' | 'horizontal' | 'no-label';
export type SpinnerState = 'end' | 'busy' | 'error' | 'empty' | 'paused';

export class Spinner extends TranslatableMixin(ThemeableMixin(LitElement), 'spinner') {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      layout: { type: String },
      state: { type: String },
    };
  }

  /** @readonly */
  static get styles(): CSSResultArray {
    return [
      super.styles,
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

  /**
   * Optional spinner layout: horizontal (default) or vertical. First puts icon next
   * to the label, second puts it above the text.
   */
  layout: SpinnerLayout = 'horizontal';

  /**
   * Optional spinner state:
   *
   * - `busy` (default) for loading data;
   * - `error` for failures;
   * - `empty` for when there's no data;
   * - `paused` for a pause or a timeout before fetching the next chunk of data;
   * - `end` for when there's no more data;
   */
  state: SpinnerState = 'busy';

  /** @readonly */
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
        <foxy-i18n
          data-testid="text"
          class=${this.layout === 'no-label' ? 'sr-only' : ''}
          lang=${this.lang}
          key=${text}
          ns=${this.ns}
        >
        </foxy-i18n>
      </div>
    `;
  }
}
