import type { CSSResult, PropertyDeclarations, TemplateResult } from 'lit-element';
import { LitElement, css, html } from 'lit-element';

/**
 * A utility element for adding swipe actions to cards or list items. Usage:
 *
 * ```html
 * <foxy-swipe-actions>
 *   <foxy-customer-card></foxy-customer-card>
 *   <button slot="action">Edit</button>
 *   <button slot="action">Delete</button>
 * </foxy-swipe-actions>
 * ```
 *
 * @element foxy-swipe-actions
 * @since 1.17.0
 */
export class SwipeActions extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      __state: { attribute: false },
    };
  }

  static get styles(): CSSResult {
    return css`
      #root {
        display: block;
        overflow: hidden;
      }

      #scroll {
        margin-bottom: calc(0px - var(--scrollbar-height, 24px));
        overflow: scroll hidden;
        white-space: nowrap;
        scroll-snap-type: x mandatory;
        display: flex;
      }

      #content {
        scroll-snap-align: start;
        width: 100%;
        flex-shrink: 0;
      }

      #content-transform-target {
        transition: transform 0.15s ease;
      }

      .idle-preview #content-transform-target {
        transform: translateX(calc(0px - var(--lumo-space-s)));
      }

      #action {
        scroll-snap-align: end;
        flex-shrink: 0;
      }
    `;
  }

  private __state: 'idle' | 'idle-preview' | 'scroll-started' | 'scrolled' = 'idle';

  private __scrollTimeout: NodeJS.Timeout | null = null;

  render(): TemplateResult {
    return html`
      <div
        class=${this.__state}
        id="root"
        @mouseleave=${() => this.__closeActions('smooth')}
        @mousemove=${this.__handleMouseMove}
        @focusout=${() => this.__closeActions('auto')}
      >
        <div id="scroll" @scroll=${this.__handleScroll}>
          <div id="content">
            <div id="content-transform-target">
              <slot></slot>
            </div>
          </div>
          <div id="action">
            <slot name="action"></slot>
          </div>
        </div>
      </div>
    `;
  }

  firstUpdated(changes: Map<keyof this, unknown>): void {
    super.firstUpdated(changes);
    const scroll = this.__scroll;
    const root = this.renderRoot.querySelector('#root') as HTMLElement;
    root.style.setProperty('--scrollbar-height', `${scroll.offsetHeight - scroll.clientHeight}px`);
  }

  private get __scroll() {
    return this.renderRoot.querySelector('#scroll') as HTMLElement;
  }

  private get __content() {
    return this.renderRoot.querySelector('#content') as HTMLElement;
  }

  private __closeActions(behavior?: 'auto' | 'smooth'): void {
    if (this.__scrollTimeout !== null) clearTimeout(this.__scrollTimeout);

    this.__scroll.scroll({
      top: 0,
      left: 0,
      behavior,
    });

    this.__state = 'idle';
  }

  private __handleScroll() {
    const { scrollLeft, scrollWidth, clientWidth } = this.__scroll;

    if (scrollLeft <= 0) {
      this.__state = 'idle';
    } else if (scrollWidth - scrollLeft - clientWidth <= 0) {
      this.__state = 'scrolled';
    }
  }

  private __handleMouseMove(evt: MouseEvent) {
    if (!this.__state.startsWith('idle')) return;

    if (this.__scrollTimeout !== null) clearTimeout(this.__scrollTimeout);
    const ratio = evt.offsetX / this.__scroll.clientWidth;

    if (ratio >= 0.9) {
      this.__state = 'idle-preview';
      this.__scrollTimeout = setTimeout(() => {
        this.__state = 'scroll-started';
        this.__scroll.scroll({
          top: 0,
          left: this.__content.clientWidth,
          behavior: 'smooth',
        });
      }, 75);
    }
  }
}
