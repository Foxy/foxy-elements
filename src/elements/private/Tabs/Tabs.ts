import { CSSResult, CSSResultArray, LitElement, PropertyDeclarations } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';

export class Tabs extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      size: { type: Number },
      value: { type: Number },
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  value = 0;

  size = 0;

  render(): TemplateResult {
    const tabs: TemplateResult[] = [];
    const panels: TemplateResult[] = [];

    for (let index = 0; index < this.size; ++index) {
      tabs.push(html`
        <button
          id="tab-${index}"
          role="tab"
          class=${classMap({
            'text-m font-semibold px-s rounded focus-outline-none focus-shadow-outline': true,
            'text-tertiary hover-text-body focus-text-body': this.value !== index,
          })}
          aria-controls="panel-${index}"
          aria-selected=${this.value === index}
          @click=${() => (this.value = index)}
          @keydown=${this.__handleKeyDown}
        >
          <slot name="tab-${index}"></slot>
        </button>
      `);

      panels.push(html`
        <slot
          id="panel-${index}"
          role="tabpanel"
          name="panel-${index}"
          class=${classMap({ hidden: this.value !== index })}
          aria-hidden=${this.value !== index}
          aria-labelledby="tab-${index}"
        >
        </slot>
      `);
    }

    return html`
      <div role="tablist" aria-orientation="horizontal" class="-mx-s mb-s">${tabs}</div>
      ${panels}
    `;
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key.startsWith('Arrow')) {
      evt.preventDefault();

      const target = evt.target as HTMLButtonElement;
      let next: HTMLButtonElement | null = null;

      if (evt.key === 'ArrowRight' || evt.key === 'ArrowDown') {
        next = target.nextElementSibling as HTMLButtonElement | null;
      } else if (evt.key === 'ArrowLeft' || evt.key === 'ArrowUp') {
        next = target.previousElementSibling as HTMLButtonElement | null;
      }

      next?.click();
      next?.focus();
    }
  }
}
