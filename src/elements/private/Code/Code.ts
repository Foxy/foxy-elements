import { css, CSSResultArray, html, internalProperty, query, TemplateResult } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';
import { CodeReadyEvent } from './CodeReadyEvent';

type ExtendedWindow = Window & {
  hljs: { highlightBlock: (element: Element) => void };
};

export class Code extends Themeable {
  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        code,
        code.hljs {
          display: block;
          border: 1px solid var(--lumo-contrast-10pct);
          border-radius: var(--lumo-border-radius-l, 0.75em);
          padding: var(--lumo-space-m, 1rem);
          line-height: var(--lumo-line-height-s, 1.375rem);
          font-size: var(--lumo-font-size-s, 0.875rem);
          overflow: auto;
        }
      `,
    ];
  }

  @internalProperty()
  private __code = '';

  @query('code')
  private __container!: HTMLElement;

  private __ready = false;

  get ready(): boolean {
    return this.__ready;
  }

  async firstUpdated(): Promise<void> {
    const slot = this.shadowRoot!.querySelector('slot');
    const window = this.ownerDocument!.defaultView as null | ExtendedWindow;
    const template = slot!.assignedElements()[0] as HTMLTemplateElement;
    const fragment = this.ownerDocument!.importNode(template.content, true);

    this.__code = Array.from(fragment.children)
      .map(child => child.outerHTML)
      .join('\n');

    await this.requestUpdate();

    if (window === null || !('hljs' in window)) {
      await this.__loadScript(
        'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.0.0/build/highlight.min.js',
        'highlight.js bundle loaded by fx-code component, part of foxy-elements'
      );
    }

    window?.hljs.highlightBlock(this.__container);
    this.dispatchEvent(new CodeReadyEvent());
    this.__ready = true;
  }

  private async __loadScript(src: string, comment: string) {
    await new Promise((resolve, reject) => {
      const script = this.ownerDocument!.createElement('script');

      script.onload = resolve;
      script.onerror = reject;
      script.src = src;

      this.ownerDocument!.head.append(this.ownerDocument!.createComment(comment), script);
    });
  }

  render(): TemplateResult {
    return html`
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.0.0/build/styles/atom-one-dark.min.css"
      />

      <pre><code>${this.__code}</code></pre>
      <slot></slot>
    `;
  }
}
