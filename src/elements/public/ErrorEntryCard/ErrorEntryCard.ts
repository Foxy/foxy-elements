import { PropertyDeclarations, TemplateResult } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';

import { Data } from './types';
import { DataList } from './DataList';
import { Group } from '../../private/Group/Group';
import { NucleonElement } from '../NucleonElement/index';
import { ResourceViewer } from './ResourceViewer';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';
import { decode } from 'html-entities';

const NS = 'error-entry-card';
const Base = TranslatableMixin(ThemeableMixin(ScopedElementsMixin(NucleonElement)), NS);

/**
 * Displays an ErrorEntry from the Log of FoxyAPI.
 *
 * @element foxy-error-entry-card
 */
export class ErrorEntryCard extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'x-resource-viewer': ResourceViewer,
      'foxy-spinner': customElements.get('foxy-spinner'),
      'x-data-list': DataList,
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-group': Group,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      open: { type: Boolean, reflect: true },
    };
  }

  /**
   * If true, displays the error details.
   * Additionally, sets `form.hide_error` to `true` and submits changes on first view.
   */
  open = false;

  render(): TemplateResult {
    const data = this.data;
    const isBusy = this.in('busy');

    if (data) {
      const { hide_error } = data;
      const { open } = this;

      return html`
        <details
          aria-busy=${isBusy}
          aria-live="polite"
          class="text-body w-full"
          ?open=${open}
          @toggle=${this.__handleToggle}
        >
          <summary
            class="rounded-s ring-offset-4 ring-offset-base ring-primary-50 focus-outline-none focus-ring-2"
          >
            <div
              style="padding-left: calc(var(--lumo-space-xs) + var(--lumo-space-s) - 1px)"
              class=${classMap({
                'border-l-2 leading-s relative cursor-pointer': true,
                'border-contrast': hide_error && !open,
                'border-primary': !hide_error,
                'border-error': hide_error && open,
                'h-l': !open,
              })}
            >
              ${this.__renderSummary(data)}
            </div>
          </summary>

          ${open ? this.__renderDetails(data) : ''}
        </details>
      `;
    } else {
      return html`
        <div
          aria-busy=${isBusy}
          aria-live="polite"
          style="padding-left: calc(var(--lumo-space-xs) + var(--lumo-space-s) - 1px)"
          class="flex items-center justify-center border-l-2 leading-s relative border-contrast-10 h-l"
        >
          <foxy-spinner
            data-testid="spinner"
            layout="horizontal"
            state=${isBusy ? 'busy' : this.in('fail') ? 'error' : 'empty'}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      `;
    }
  }

  private __renderGetOrPostValues(getValues: string, postValues: string) {
    const values = getValues || postValues;
    const params = new URLSearchParams(decode(values));
    const method = getValues ? 'GET' : 'POST';

    return html`
      <div class="relative leading-xs pt-s">
        <div class="absolute font-medium right-0 text-tertiary text-xs top-0 mt-s">${method}</div>
        <x-data-list data=${JSON.stringify(Array.from(params.entries()))}></x-data-list>
      </div>
    `;
  }

  private __renderReferrer(referrer: string) {
    return html`
      <span class="text-secondary">Navigated from</span>
      <a
        target="_blank"
        class="font-medium text-primary hover-underline"
        href=${referrer}
        rel="nofollow noopener noreferrer"
      >
        ${referrer}
      </a>
    `;
  }

  private __renderSummary(data: Data) {
    return html`
      <div class="text-s absolute right-0 top-0 text-tertiary">
        <iron-icon icon="icons:expand-${this.open ? 'less' : 'more'}"></iron-icon>
      </div>

      <div class="text-s mb-xs ${data.hide_error ? 'text-error' : 'text-primary'}">
        <foxy-i18n
          options=${JSON.stringify({ value: data.date_created })}
          lang=${this.lang}
          key="date"
          ns=${this.ns}
        >
        </foxy-i18n>

        <foxy-i18n
          options=${JSON.stringify({ value: data.date_created })}
          lang=${this.lang}
          key="time"
          ns=${this.ns}
        >
        </foxy-i18n>
      </div>

      <p class="${this.open ? '' : 'truncate'} overflow-hidden font-medium">
        ${data.error_message}
      </p>
    `;
  }

  private __renderDetails(data: Data) {
    return html`
      <div class="space-y-m pt-m">
        ${data.referrer || data.get_values || data.post_values
          ? html`
              <x-group frame>
                <foxy-i18n slot="header" lang=${this.lang} key="request" ns=${this.ns}></foxy-i18n>

                <div class="mx-xs p-s text-s divide-y divide-contrast-10 space-y-s">
                  <p>
                    <span class="block font-medium">${data.url}</span>
                    ${data.referrer ? this.__renderReferrer(data.referrer) : ''}
                  </p>

                  ${data.get_values || data.post_values
                    ? this.__renderGetOrPostValues(data.get_values, data.post_values)
                    : ''}
                </div>
              </x-group>
            `
          : ''}
        ${data.ip_address || data.ip_country || data.user_agent
          ? html`
              <x-group frame>
                <foxy-i18n slot="header" lang=${this.lang} key="client" ns=${this.ns}></foxy-i18n>

                <div class="text-s flex flex-col mx-xs p-s">
                  <span class="font-medium">
                    ${data.ip_address}
                    ${data.ip_country
                      ? html`<span class="text-tertiary"> • </span>${data.ip_country}`
                      : ''}
                  </span>

                  ${data.user_agent
                    ? html`<span class="text-secondary">${data.user_agent}</span>`
                    : ''}
                </div>
              </x-group>
            `
          : ''}
        ${Object.entries(data._links).map(([curie, link]) => {
          if (['self', 'fx:store', 'curies'].includes(curie)) return '';

          return html`
            <x-group frame>
              <foxy-i18n slot="header" lang=${this.lang} key=${curie.substr(3)} ns=${this.ns}>
              </foxy-i18n>

              <x-resource-viewer
                class="p-s mx-xs"
                href=${link.href}
                lang=${this.lang}
                ns=${this.ns}
              >
              </x-resource-viewer>
            </x-group>
          `;
        })}
      </div>
    `;
  }

  private __handleToggle(event: Event) {
    const details = event.target as HTMLDetailsElement;

    if (details.open && this.data?.hide_error === false) {
      this.edit({ hide_error: true });
      this.submit();
    }

    this.open = details.open;
  }
}
