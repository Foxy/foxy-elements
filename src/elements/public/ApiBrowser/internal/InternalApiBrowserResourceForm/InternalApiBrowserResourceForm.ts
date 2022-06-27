import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../../../NucleonElement/types';
import type { Data } from '../../types';

import { TranslatableMixin } from '../../../../../mixins/translatable';
import { InternalForm } from '../../../../internal/InternalForm/InternalForm';
import { classMap } from '../../../../../utils/class-map';
import { html } from 'lit-html';
import { css } from 'lit-element';

const InvalidValueSymbol = Symbol() as symbol;
const ValidValueSymbol = Symbol() as symbol;

/**
 * Internal raw resource JSON editor for use with ApiBrowser.
 *
 * @element foxy-internal-api-browser-resource-form
 * @since 1.17.0
 */
export class InternalApiBrowserResourceForm extends TranslatableMixin(InternalForm)<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      open: { type: Boolean },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        .monospace {
          font-family: monospace;
        }

        .resize-none {
          resize: none;
        }

        .resource {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(calc(18.75 * var(--lumo-space-m)), 1fr));
          grid-gap: 1px;
        }

        .resource > :first-child {
          grid-column-start: 1;
          grid-column-end: -2;
        }

        textarea::selection {
          background: var(--lumo-contrast-10pct);
        }
      `,
    ];
  }

  static get v8n(): NucleonV8N<any> {
    return [
      ...super.v8n,
      v => (typeof (v as any)[InvalidValueSymbol] === 'string' ? 'invalid_json' : true),
    ];
  }

  /** Same as the "open" attribute/property of the details element. */
  open = false;

  renderBody(): TemplateResult {
    return html`
      <details
        class="select-none rounded-t-l rounded-b-l overflow-hidden border border-contrast-10"
        ?open=${this.open}
        @toggle=${(evt: Event) => {
          const details = evt.currentTarget as HTMLDetailsElement;
          this.open = details.open;
        }}
      >
        <summary
          class=${classMap({
            'ring-inset ring-primary-50 rounded-t-l': true,
            'focus-outline-none focus-ring-2': true,
            'rounded-b-l': !this.open,
          })}
        >
          <div
            class="flex items-center space-x-s p-s pr-m transition-colors cursor-pointer bg-contrast-5 hover-bg-contrast-10"
          >
            <foxy-copy-to-clipboard infer="copy-to-clipboard" text=${this.href || this.parent}>
            </foxy-copy-to-clipboard>

            <span class="font-semibold truncate">${this.__renderTitle()}</span>
            <span class="flex-1"></span>

            ${this.in({ idle: { snapshot: 'dirty' } }) || this.in({ idle: 'template' })
              ? html`
                  <foxy-internal-create-control infer="create" theme="tertiary-inline success">
                  </foxy-internal-create-control>
                `
              : ''}
            ${this.in({ idle: { snapshot: 'dirty' } }) || this.in({ idle: { template: 'dirty' } })
              ? html`
                  <vaadin-button
                    theme="tertiary-inline contrast"
                    class="px-xs"
                    @click=${() => this.undo()}
                  >
                    <foxy-i18n infer="" key="undo"></foxy-i18n>
                  </vaadin-button>
                `
              : ''}
            ${this.in({ idle: 'snapshot' })
              ? html`
                  <foxy-internal-delete-control infer="delete" theme="tertiary-inline error">
                  </foxy-internal-delete-control>
                `
              : ''}
          </div>
        </summary>

        ${this.open ? this.__renderForm() : ''}
      </details>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    this.__setTextAreaHeight();
  }

  protected async _fetch<TResult = any>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    try {
      const request = args[0] instanceof Request ? args[0] : new Request(...args);
      if (request.method !== 'POST') return await super._fetch(...args);

      const body = (this.form as any)[ValidValueSymbol];
      return await super._fetch(request.url, { method: 'POST', body });
    } catch (err) {
      throw ['invalid_json'];
    }
  }

  private __setTextAreaHeight() {
    const textarea = this.renderRoot.querySelector<HTMLTextAreaElement>('textarea');

    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.style.overflowY = 'hidden';
    }
  }

  private __renderTitle() {
    if (!this.href) {
      return html`
        <span class="text-tertiary">POST</span>
        <span>${this.parent}</span>
      `;
    }

    let pathname = '';
    let identifier = '';
    let search = '';

    try {
      const url = new URL(this.href);

      pathname = url.pathname;
      if (pathname.startsWith('/')) pathname = pathname.substring(1);

      const splitPathname = pathname.split('/');
      pathname = splitPathname.slice(0, splitPathname.length - 1).join('/');

      if (splitPathname.length > 1) {
        pathname = `${pathname}/`;
        identifier = splitPathname[splitPathname.length - 1];
      }

      search = url.search;
    } catch {
      pathname = this.href;
    }

    return html`
      ${[
        html`<span>${pathname}</span>`,
        html`<span class="text-primary">${identifier}</span>`,
        html`<span class="text-tertiary">${search}</span>`,
      ]}
    `;
  }

  private __renderForm() {
    return html`
      <div class="bg-base">
        <div class="${this.data ? 'resource' : ''} border-t border-contrast-5 bg-contrast-10">
          <div class="flex-1 flex bg-base">
            <div class="monospace bg-contrast-5 leading-s text-s p-m text-tertiary text-right">
              ${this.__formAsString.split('\n').map((_, index) => html`<div>${index + 1}</div>`)}
            </div>

            <textarea
              class=${classMap({
                'whitespace-pre leading-s text-s focus-outline-none': true,
                'monospace resize-none p-m block w-full select-text': true,
                'bg-error-10': this.errors.length > 0,
                'bg-base': this.errors.length === 0,
              })}
              .value=${this.__formAsString}
              @input=${(evt: InputEvent) => {
                const textarea = evt.currentTarget as HTMLTextAreaElement;
                this.__formAsString = textarea.value;
              }}
            >
            </textarea>
          </div>

          ${this.data
            ? html`
                <div class="bg-base">
                  <ul class="bg-contrast-5 p-xs h-full">
                    ${this.__links.map(([curie, link]) =>
                      this.__renderLink(curie, link.href, link.title)
                    )}
                  </ul>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private get __links() {
    const linksAsEntries = Object.entries(this.data?._links ?? {});
    const relevantLinks = linksAsEntries.filter(
      ([curie, link]) => curie !== 'self' && !Array.isArray(link) && !(link as any).templated
    );

    try {
      relevantLinks.sort(([curie1], [curie2]) => curie1.localeCompare(curie2, this.lang));
    } catch {
      relevantLinks.sort(([curie1], [curie2]) => curie1.localeCompare(curie2));
    }

    return relevantLinks;
  }

  private get __formAsString() {
    const form = this.form as any;
    const validValue = form[ValidValueSymbol];
    const invalidValue = form[InvalidValueSymbol];

    if (typeof invalidValue === 'string') return invalidValue;
    if (typeof validValue === 'string') return validValue;

    return JSON.stringify(form, (key, value) => (key.startsWith('_') ? undefined : value), 2);
  }

  private set __formAsString(newValue: string) {
    this.undo();

    try {
      const parsedNewValue = JSON.parse(newValue);
      if (typeof parsedNewValue === 'object') this.edit(parsedNewValue);
      this.edit({ [ValidValueSymbol]: newValue });
    } catch {
      this.edit({ [InvalidValueSymbol]: newValue });
    }
  }

  private __renderLink(curie: string, href: string, title?: string) {
    return html`
      <li class="m-xs rounded overflow-hidden transition-colors hover-bg-contrast-5">
        <foxy-swipe-actions>
          <button
            class=${classMap({
              'rounded leading-none space-y-xs block text-left w-full py-s': true,
              'ring-inset ring-primary-50': true,
              'focus-outline-none focus-ring-2 ': true,
            })}
            @click=${() => {
              const evt = new CustomEvent('navigate:get', { bubbles: true, detail: href });
              this.dispatchEvent(evt);
            }}
          >
            <div class="flex items-center">
              <div class="flex-1 space-y-xs px-s min-w-0 text-s">
                <div class="truncate font-semibold">${title || href}</div>
                <div class="opacity-75 truncate">${curie}</div>
              </div>

              <iron-icon
                class="icon-inline text-xl text-tertiary mr-s flex-shrink-0"
                icon="icons:chevron-right"
              >
              </iron-icon>
            </div>
          </button>

          <div slot="action" class="h-full flex">
            <vaadin-button
              theme="secondary success"
              class="h-full rounded-none"
              @click=${() => {
                const evt = new CustomEvent('navigate:post', { bubbles: true, detail: href });
                this.dispatchEvent(evt);
              }}
            >
              POST
            </vaadin-button>
          </div>
        </foxy-swipe-actions>
      </li>
    `;
  }
}
