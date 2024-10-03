import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { TemplateResult } from 'lit-html';
import type { ItemRenderer } from '../../public/CollectionPage/types';
import type { Collection } from './types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';
import { css } from 'lit-element';

import memoize from 'lodash-es/memoize';

export class InternalAsyncResourceLinkListControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      foreignKeyForUri: { attribute: 'foreign-key-for-uri' },
      foreignKeyForId: { attribute: 'foreign-key-for-id' },
      ownKeyForUri: { attribute: 'own-key-for-uri' },
      optionsHref: { attribute: 'options-href' },
      linksHref: { attribute: 'links-href' },
      embedKey: { attribute: 'embed-key' },
      ownUri: { attribute: 'own-uri' },
      limit: { type: Number },
      item: {},
      __isFetching: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        vaadin-checkbox::part(label) {
          margin: 0 0 0 calc(0.625em + (var(--lumo-border-radius) / 4) - 1px);
          align-self: center;
        }
      `,
    ];
  }

  foreignKeyForUri: string | null = null;

  foreignKeyForId: string | null = null;

  ownKeyForUri: string | null = null;

  optionsHref: string | null = null;

  linksHref: string | null = null;

  embedKey: string | null = null;

  ownUri: string | null = null;

  limit = 20;

  item: string | null = null;

  private readonly __getItemRenderer = memoize(
    (item: string | null, hasData: boolean) => {
      return new Function(
        'ctx',
        `return ctx.html\`
        <${item ?? 'foxy-null'}
          related=\${JSON.stringify(ctx.related)}
          parent=\${ctx.parent}
          infer=""
          ${hasData ? '.data=${ctx.data}' : 'href=${ctx.href}'}
          ...=\${ctx.spread(ctx.props)}
        >
        </${item ?? 'foxy-null'}>\``
      ) as ItemRenderer;
    },
    (...args) => args.join()
  );

  private readonly __renderItem: ItemRenderer = ctx => {
    const render = this.__getItemRenderer(this.item, !!ctx.data);
    const wrap = (content: TemplateResult) => html`
      <div style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)">${content}</div>
    `;

    if (!ctx.href || ctx.href.startsWith('foxy://')) return wrap(render(ctx));
    if (this.readonly) return wrap(render(ctx));

    const foreignKeyForUri = this.foreignKeyForUri;
    const linkResource = foreignKeyForUri
      ? this.__allLinks?.find(link => link[foreignKeyForUri] === ctx.href)
      : undefined;

    const isDisabled = this.disabled || !this.__allLinks || this.__isFetching;

    return wrap(html`
      <vaadin-checkbox
        class="block"
        ?disabled=${isDisabled}
        ?checked=${!!linkResource}
        @change=${(evt: CustomEvent) => {
          const target = evt.currentTarget as CheckboxElement;
          if (target.checked) {
            this.__insertLink(ctx.data?._links.self.href ?? '');
          } else {
            this.__deleteLink(linkResource?._links.self.href ?? '');
          }
        }}
      >
        <div class="transition-opacity ${isDisabled ? 'opacity-50' : 'opacity-100'}">
          ${render(ctx)}
        </div>
      </vaadin-checkbox>
    `);
  };

  private __isFetching = false;

  renderControl(): TemplateResult {
    let firstHref: string | undefined;

    try {
      const url = new URL(this.optionsHref ?? '');
      url.searchParams.set('limit', this.limit.toString());
      firstHref = url.toString();
    } catch {
      firstHref = undefined;
    }

    const isStatusVisible = this.__isFetching || !this.__allLinks;

    return html`
      <div class="group">
        <div class="mb-s" ?hidden=${!this.label && !this.helperText}>
          <div class="flex justify-between font-medium text-l" ?hidden=${!this.label}>
            <span>${this.label}</span>
            <foxy-i18n
              class="transition-opacity ${isStatusVisible ? 'opacity-100' : 'opacity-0'}"
              infer=""
              key=${this.__isFetching ? 'status_saving' : 'status_loading'}
            >
            </foxy-i18n>
          </div>
          <div class="text-secondary text-s" ?hidden=${!this.helperText}>${this.helperText}</div>
        </div>

        <foxy-pagination first=${ifDefined(firstHref)} infer="pagination">
          <foxy-collection-page
            infer="card"
            class=${classMap({
              'block transition-colors divide-y rounded overflow-hidden': true,
              'bg-contrast-5 divide-contrast-10': true,
            })}
            .item=${this.__renderItem}
          >
          </foxy-collection-page>
        </foxy-pagination>

        <div
          class="mt-s text-s leading-xs text-error"
          ?hidden=${!this._errorMessage || this.disabled || this.readonly}
        >
          ${this._errorMessage}
        </div>

        ${this.__renderLinkResourceLoaders()}
      </div>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (changes.has('item')) this.__getItemRenderer.cache.clear?.();
  }

  private async __insertLink(foreignUri: string) {
    this.__isFetching = true;

    const api = new NucleonElement.API(this);
    const response = await api.fetch(this.linksHref ?? '', {
      method: 'POST',
      body: JSON.stringify({
        [this.foreignKeyForUri ?? '']: foreignUri,
        [this.ownKeyForUri ?? '']: this.ownUri,
      }),
    });

    if (response.ok) {
      const json = await response.json();
      const dataResponse = await api.fetch(json._links.self.href);

      if (dataResponse.ok) {
        const rumour = NucleonElement.Rumour(this.nucleon?.group ?? '');
        const data = await dataResponse.json();

        rumour.share({
          related: [this.linksHref ?? ''],
          source: json._links.self.href,
          data,
        });
      }
    }

    this.__isFetching = false;
  }

  private async __deleteLink(linkUri: string) {
    this.__isFetching = true;

    const api = new NucleonElement.API(this);
    const response = await api.fetch(linkUri, { method: 'DELETE' });

    if (response.ok) {
      const rumour = NucleonElement.Rumour(this.nucleon?.group ?? '');
      rumour.share({ related: [this.linksHref ?? ''], source: linkUri, data: null });
    }

    this.__isFetching = false;
  }

  private __renderLinkResourceLoaders() {
    const maxApiLimit = 200;
    const firstPage = this.renderRoot.querySelector<NucleonElement<Collection>>('[data-link-page]');
    const totalItems = Number(firstPage?.data?.total_items ?? maxApiLimit); // sometimes total_items is a string in hAPI
    const links: string[] = [];

    try {
      for (let i = 0; i < Math.max(1, Math.ceil(totalItems / maxApiLimit)); i++) {
        const url = new URL(this.linksHref ?? '');
        url.searchParams.set('offset', String(i * maxApiLimit));
        url.searchParams.set('limit', String(maxApiLimit));
        links.push(url.toString());
      }
    } catch {
      // Do nothing.
    }

    return links.map(
      href => html`
        <foxy-nucleon
          class="hidden"
          data-link-page
          infer=""
          href=${href}
          @update=${() => this.requestUpdate()}
        >
        </foxy-nucleon>
      `
    );
  }

  private get __allLinks() {
    const embedKey = this.embedKey;
    if (!embedKey) return null;

    type Loader = NucleonElement<Collection>;
    const loaders = this.renderRoot.querySelectorAll<Loader>('[data-link-page]');
    const allLinks: any[] = [];

    for (const loader of loaders) {
      const embedded = loader.data?._embedded?.[embedKey];
      if (!embedded) return null;
      allLinks.push(...embedded);
    }

    return allLinks;
  }
}
