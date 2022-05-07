import { html, LitElement, PropertyDeclarations, svg, TemplateResult } from 'lit-element';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';

export type SpinnerLayout = 'vertical' | 'horizontal' | 'no-label';
export type SpinnerState = 'end' | 'busy' | 'error' | 'empty' | 'paused';

const Base = TranslatableMixin(ThemeableMixin(InferrableMixin(LitElement)), 'spinner');

export class Spinner extends Base {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      layout: { type: String },
      state: { type: String },
    };
  }

  /**
   * Optional spinner layout: horizonal (default) or vertical. First puts icon next
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
      icon = svg`
        <svg data-testid="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 22 22" preserveAspectRatio="xMidYMid" class="animate-spin h-full w-full">
          <circle cx="11" cy="11" fill="none" stroke="#e15b64" stroke-width="2" r="8" stroke-dasharray="24 12" class="stroke-current"></circle>
        </svg>
      `;

      text = 'loading_busy';
      tint = 'text-tertiary';
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
