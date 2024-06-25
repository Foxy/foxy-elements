import type { PropertyDeclarations } from 'lit-element';
import type { HALJSONResource } from '../../public/NucleonElement/types';
import type { TemplateResult } from 'lit-html';
import type { Status } from './types';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { getResourceId } from '@foxy.io/sdk/core';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const Base = ConfigurableMixin(ThemeableMixin(NucleonElement));

/**
 * An internal base class for any nucleon-powered form. Renders create/delete
 * buttons and timestamps by default, displays a spinner in non-idle states.
 *
 * @element foxy-internal-form
 * @since 1.17.0
 */
export class InternalForm<TData extends HALJSONResource> extends Base<TData> {
  /** Validation errors with this prefix will show up at the top of the form. */
  static generalErrorPrefix = 'error:';

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      status: { type: Object },
    };
  }

  /** Status message to render at the top of the form. If `null`, the message is hidden. */
  status: null | Status = null;

  /**
   * Renders header actions when the optional header is rendered.
   * Empty by default.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderHeaderActions(data: TData): TemplateResult | null {
    return null;
  }

  /**
   * Renders optional form header with ID, last update timestamp and actions list (snapshot-only).
   * Customize which actions are rendered with `.renderHeaderActions()` method.
   */
  renderHeader(): TemplateResult {
    const data = this.data;
    const actions = data ? this.renderHeaderActions(data) : null;
    const id = data ? getResourceId(data._links.self.href) : '';

    return html`
      <h2>
        <span class="flex items-center gap-s leading-xs text-xxl font-medium break-all">
          <foxy-i18n infer="header" key=${data ? 'title_existing' : 'title_new'} .options=${{ id }}>
          </foxy-i18n>
          ${data
            ? html`
                <foxy-copy-to-clipboard infer="header" class="text-m" text=${id}>
                </foxy-copy-to-clipboard>
              `
            : ''}
        </span>
        ${data
          ? html`
              <foxy-i18n
                infer="header"
                class="text-l text-secondary"
                key="subtitle"
                .options=${data}
              >
              </foxy-i18n>
              ${actions ? html`<div class="mt-xs flex gap-m">${actions}</div>` : ''}
            `
          : ''}
      </h2>
    `;
  }

  /**
   * Renders form body. This is the method you should implement in your forms
   * instead of `.render()`. If you'd like to keep the submit button and the timestamps,
   * don't forget to add `super.renderBody()` to your template.
   */
  renderBody(): TemplateResult {
    return this.data
      ? html`
          <foxy-internal-timestamps-control infer="timestamps"></foxy-internal-timestamps-control>
          <foxy-internal-delete-control infer="delete"></foxy-internal-delete-control>
        `
      : html`<foxy-internal-create-control infer="create"></foxy-internal-create-control>`;
  }

  /**
   * Renders the entire form. You should probably implement `.renderBody()`
   * instead of this method in your form to keep the spinner and the common layout features.
   */
  render(): TemplateResult {
    const isSpinnerVisible = !this.in('idle') && (!this.in({ busy: 'fetching' }) || !this.data);

    return html`
      <div aria-busy=${this.in('busy')} aria-live="polite" class="relative">
        <div
          class=${classMap({
            'space-y-m': true,
            'transition-opacity': true,
            'opacity-0 pointer-events-none': isSpinnerVisible,
          })}
        >
          ${this.__generalErrors.map(err => this.__renderGeneralError(err))}
          ${this.status ? this.__renderStatus(this.status) : ''} ${this.renderBody()}
        </div>

        <div
          data-testid="spinner"
          class=${classMap({
            'flex flex-col items-center justify-center gap-m': true,
            'transition-opacity absolute inset-0': true,
            'opacity-0 pointer-events-none': !isSpinnerVisible,
          })}
        >
          <foxy-spinner
            layout=${this.in('fail') ? 'vertical' : 'no-label'}
            state=${this.in('fail') ? 'error' : 'busy'}
            infer="spinner"
          >
          </foxy-spinner>
          ${this.href && this.in('fail')
            ? html`
                <vaadin-button theme="small contrast" @click=${() => this.refresh()}>
                  <foxy-i18n infer="spinner" key="refresh"></foxy-i18n>
                </vaadin-button>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private get __generalErrors() {
    const prefix = (this.constructor as typeof InternalForm).generalErrorPrefix;
    return this.errors.filter(v => v.startsWith(prefix));
  }

  private __renderGeneralError(err: string) {
    return html`
      <foxy-i18n
        class="leading-xs text-body rounded bg-error-10 block"
        style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
        infer="error"
        key=${err.replace('error:', '')}
      >
      </foxy-i18n>
    `;
  }

  private __renderStatus({ key, options }: Status) {
    if (this.hiddenSelector.matches('status', true)) return;
    return html`
      <p
        data-testid="status"
        class="leading-xs text-body rounded bg-success-10 flex items-start gap-m"
        style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
      >
        <foxy-i18n class="flex-1" infer="status" key=${key} .options=${options}></foxy-i18n>
        <vaadin-button
          class="flex-shrink-0"
          theme="success tertiary-inline"
          @click=${() => (this.status = null)}
        >
          <foxy-i18n class="flex-1" infer="status" key="close"></foxy-i18n>
        </vaadin-button>
      </p>
    `;
  }
}
