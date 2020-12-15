import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

export type InfiniteScrollCallback = (load: () => Promise<boolean>) => Promise<void>;
export class InfiniteScrollNextEvent extends CustomEvent<InfiniteScrollCallback> {
  constructor(detail: InfiniteScrollCallback) {
    super('next', { detail });
  }
}

/**
 * This element fires `next` event whenever it appears on screen, signaling the
 * parent element that the next chunk of data needs to be loaded.
 *
 * @slot default - Displayed when there's nothing to load.
 * @slot loading - Displayed while loading new data.
 * @slot error - Displayed if host element fails to load data.
 *
 * @fires InfiniteScroll#next
 */
export class InfiniteScroll extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __state: {},
    };
  }

  private __state: 'idle' | 'complete' | 'loading' | 'error' = 'idle';

  private __request = Symbol();

  private __observer = new IntersectionObserver(this.__handleIntersection.bind(this), {
    rootMargin: '100%',
  });

  constructor() {
    super();
    this.__observer.observe(this);
  }

  public render(): TemplateResult {
    if (this.__state === 'error') return html`<slot name="error"></slot>`;
    if (this.__state === 'loading') return html`<slot name="loading"></slot>`;

    return html`<slot></slot>`;
  }

  public reset(): void {
    this.__state = 'idle';
    this.__observer.unobserve(this);
    this.__observer.observe(this);
  }

  private async __handleIntersection(entries: IntersectionObserverEntry[]) {
    const isIntersecting = entries.some(entry => entry.isIntersecting);
    if (!isIntersecting || this.__state !== 'idle') return;

    const request = Symbol();
    this.__request = request;

    try {
      this.__state = 'loading';
      this.__observer.unobserve(this);

      const isComplete = await new Promise<boolean>((resolve, reject) => {
        const event = new InfiniteScrollNextEvent(load => load().then(resolve).catch(reject));
        this.dispatchEvent(event);
      });

      if (request === this.__request) this.__state = isComplete ? 'complete' : 'idle';
    } catch {
      if (request === this.__request) this.__state = 'error';
    } finally {
      if (request === this.__request) this.__observer.observe(this);
    }
  }
}
