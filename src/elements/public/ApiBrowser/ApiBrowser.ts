import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { InternalApiBrowserResourceForm } from './internal/InternalApiBrowserResourceForm/InternalApiBrowserResourceForm';
import type { ItemRendererContext } from '../CollectionPage/types';
import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { html } from 'lit-element';

const NS = 'api-browser';
const Base = ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Interactive hAPI explorer.
 *
 * @element foxy-api-explorer
 * @since 1.17.0
 */
export class ApiBrowser extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __newCurrentUrl: { attribute: false },
      __history: { attribute: false },
      home: { type: String },
    };
  }

  /** Bookmark URL of your API. */
  home: string | null = null;

  private __newCurrentUrl: string | null = null;

  private __history: { href: string; parent: string }[] = [];

  private __renderItem = ({ href, html }: ItemRendererContext<Data>) => {
    if (!href) return html``;
    return html`
      <foxy-internal-api-browser-resource-form infer="" href=${href}>
      </foxy-internal-api-browser-resource-form>
    `;
  };

  private __handleExistingResourceFetch = (evt: FetchEvent) => {
    if (evt.request.method === 'DELETE') {
      evt.preventDefault();
      evt.respondWith(
        new ApiBrowser.API(this).fetch(evt.request).then(response => {
          if (response.ok) {
            if (this.__canGoBack) {
              this.__goBack();
            } else if (this.__canGoHome) {
              this.__goHome();
            } else {
              this.parent = '';
              this.href = '';
            }
          }

          return response;
        })
      );
    }
  };

  render(): TemplateResult {
    return html`
      <div class="space-y-m">
        <div class="flex items-center gap-s flex-wrap-reverse">
          <vaadin-button
            title=${this.t('go_back')}
            theme="icon contrast"
            class="p-0"
            ?disabled=${this.disabled || !this.__canGoBack}
            @click=${() => this.__goBack()}
          >
            <iron-icon class="icon-inline text-m" icon="icons:arrow-back"></iron-icon>
          </vaadin-button>

          <vaadin-button
            title=${this.t('go_home')}
            theme="icon contrast"
            class="p-0"
            ?disabled=${this.disabled || !this.__canGoHome}
            @click=${() => this.__goHome()}
          >
            <iron-icon class="icon-inline text-m" icon="icons:home"></iron-icon>
          </vaadin-button>

          <vaadin-text-field
            placeholder="https://api.foxy.io/stores/0"
            aria-label=${this.t('current_url')}
            class="flex-1"
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            .value=${this.__newCurrentUrl || this.href || this.parent}
            @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.__go()}
            @input=${(evt: CustomEvent) => {
              const field = evt.currentTarget as TextFieldElement;
              this.__newCurrentUrl = field.value;
            }}
          >
          </vaadin-text-field>

          ${this.__newCurrentUrl
            ? html`
                <vaadin-button
                  title=${this.t('navigate')}
                  theme="icon primary"
                  class="p-0"
                  ?disabled=${this.disabled || this.in('busy')}
                  @click=${this.__go}
                >
                  <iron-icon class="icon-inline text-m" icon="icons:arrow-forward"></iron-icon>
                </vaadin-button>
              `
            : html`
                <vaadin-button
                  title=${this.t('refresh')}
                  theme="icon contrast"
                  class="p-0"
                  ?disabled=${this.disabled || this.in('busy')}
                  @click=${() => this.refresh()}
                >
                  <iron-icon class="icon-inline text-m" icon="icons:refresh"></iron-icon>
                </vaadin-button>
              `}

          <div class="grid grid-cols-2">
            <vaadin-button
              title=${this.t('get_mode')}
              theme=${this.href ? 'contrast primary' : 'contrast'}
              class="rounded-r-none p-0"
              ?disabled=${this.disabled || this.__mode === 'get'}
              @click=${() => (this.__mode = 'get')}
            >
              GET
            </vaadin-button>

            <vaadin-button
              title=${this.t('post_mode')}
              theme=${this.href ? 'contrast' : 'contrast primary'}
              class="rounded-l-none p-0"
              ?disabled=${this.disabled || this.__mode === 'post'}
              @click=${() => (this.__mode = 'post')}
            >
              POST
            </vaadin-button>
          </div>
        </div>

        <div
          @navigate:get=${(evt: CustomEvent<string>) => {
            evt.stopPropagation();
            this.__history.push({ href: this.href, parent: this.parent });
            this.__newCurrentUrl = null;
            this.parent = '';
            this.href = evt.detail;
          }}
          @navigate:post=${(evt: CustomEvent<string>) => {
            evt.stopPropagation();
            this.__history.push({ href: this.href, parent: this.parent });
            this.__newCurrentUrl = null;
            this.parent = evt.detail;
            this.href = '';
          }}
        >
          ${this.href
            ? html`
                ${this.data?._links.first
                  ? html`
                      <foxy-pagination first=${this.href} infer="">
                        <foxy-collection-page
                          class="block space-y-m mb-m"
                          infer=""
                          .item=${this.__renderItem as any}
                        >
                        </foxy-collection-page>
                      </foxy-pagination>
                    `
                  : html`
                      <foxy-internal-api-browser-resource-form
                        infer=""
                        href=${this.href}
                        open
                        @fetch=${this.__handleExistingResourceFetch}
                      >
                      </foxy-internal-api-browser-resource-form>
                    `}
              `
            : html`
                <foxy-internal-api-browser-resource-form
                  infer=""
                  parent=${this.parent}
                  open
                  @update=${(evt: CustomEvent) => {
                    const form = evt.currentTarget as InternalApiBrowserResourceForm;
                    if (form.in({ idle: 'snapshot' })) {
                      this.href = form.data._links.self.href;
                      this.parent = '';
                    }
                  }}
                >
                </foxy-internal-api-browser-resource-form>
              `}
        </div>
      </div>
    `;
  }

  private get __canGoBack() {
    return this.__history.length > 0;
  }

  private get __canGoHome() {
    return this.href !== this.home;
  }

  private get __mode() {
    return this.href ? 'get' : 'post';
  }

  private set __mode(newValue: 'get' | 'post') {
    if (newValue === 'get') {
      this.href = this.parent;
      this.parent = '';
    } else {
      this.parent = this.href;
      this.href = '';
    }
  }

  private __goBack() {
    const index = this.__history.length - 1;
    const entry = this.__history[index];

    this.parent = entry?.parent ?? '';
    this.href = entry?.href ?? '';
    this.__history = this.__history.slice(0, index);
  }

  private __goHome() {
    this.__history = [];
    this.parent = '';
    this.href = this.home ?? '';
  }

  private __go() {
    if (typeof this.__newCurrentUrl === 'string') {
      this.__history.push({ href: this.href, parent: this.parent });
      const property = this.href ? 'href' : 'parent';
      this[property] = this.__newCurrentUrl;
      this.__newCurrentUrl = null;
    }
  }
}
