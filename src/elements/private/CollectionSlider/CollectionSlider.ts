import '@polymer/iron-icons';
import '@polymer/iron-icon';

import { CSSResultArray, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Collection } from '../HypermediaCollection/machine';
import { HypermediaCollection } from '../../private/HypermediaCollection/HypermediaCollection';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { classMap } from '../../../utils/class-map';

export abstract class CollectionSlider<T extends Collection> extends HypermediaCollection<T> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .snap-x-mandatory {
          scroll-snap-type: x mandatory;
        }

        .snap-start {
          scroll-snap-align: start;
        }

        .snap-p-s {
          scroll-padding: var(--lumo-space-s);
        }

        .shadow-base-s {
          box-shadow: 0 0 var(--lumo-space-s) var(--lumo-space-s) var(--lumo-base-color);
        }
      `,
    ];
  }

  render(renderResource?: (resource: T) => TemplateResult): TemplateResult {
    const arrowWrapperClass = classMap({
      'shadow-base-s bg-base z-10 hidden absolute inset-y-0 items-center': true,
      'md:flex': true,
    });

    const arrowClass = classMap({
      'w-xs h-xs rounded-full bg-contrast-5 text-secondary flex items-center justify-center': true,
      'hover:bg-contrast hover:text-base focus:outline-none focus:shadow-outline': true,
    });

    return html`
      <div class="relative">
        <div class="${arrowWrapperClass} left-0 -ml-xl">
          <button aria-label="Previous" class=${arrowClass} @click=${this.__scrollLeft}>
            <iron-icon icon="icons:chevron-left"></iron-icon>
          </button>
        </div>

        <div class="z-0 overflow-auto flex p-s -m-m snap-x-mandatory snap-p-s" id="root">
          ${this.pages.map(page => {
            return Object.values(page._embedded as Record<string, unknown[]>).map(embed => {
              return embed.map(resource => {
                return html`<div class="flex-shrink-0 snap-start p-s" data-item>
                  ${renderResource?.(resource as T)}
                </div>`;
              });
            });
          })}

          <div id="trigger"></div>
        </div>

        <div class="${arrowWrapperClass} right-0 -mr-xl">
          <button aria-label="Next" class=${arrowClass} @click=${this.__scrollRight}>
            <iron-icon icon="icons:chevron-right"></iron-icon>
          </button>
        </div>
      </div>
    `;
  }

  protected get _trigger(): HTMLElement | null {
    return this.shadowRoot?.getElementById('trigger') ?? null;
  }

  private get __root(): HTMLElement | null {
    return this.shadowRoot?.getElementById('root') ?? null;
  }

  private get __items(): HTMLElement[] {
    return Array.from(this.shadowRoot!.querySelectorAll('[data-item]'));
  }

  private __scrollLeft() {
    const boundary = this.__root?.getBoundingClientRect()?.left ?? -Infinity;
    const next = this.__items.reverse().find(v => v.getBoundingClientRect().left < boundary);

    next?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  private __scrollRight() {
    const boundary = this.__root?.getBoundingClientRect()?.right ?? +Infinity;
    const next = this.__items.find(v => v.getBoundingClientRect().right > boundary);

    next?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
