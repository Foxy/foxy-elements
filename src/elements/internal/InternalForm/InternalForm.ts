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

  /** Getter that returns a i18n key for the optional form header title. */
  get headerTitleKey(): string {
    return 'title';
  }

  /** I18next options to pass to the header title translation function. */
  get headerTitleOptions(): Record<string, unknown> {
    return {
      ...this.data,
      context: this.data ? 'existing' : 'new',
      id: this.data ? getResourceId(this.data._links.self.href) : null,
    };
  }

  /** Getter that returns a i18n key for the optional form header subtitle. Note that subtitle is shown only when data is avaiable. */
  get headerSubtitleKey(): string {
    return 'subtitle';
  }

  /** I18next options to pass to the header subtitle translation function. Note that subtitle is shown only when data is avaiable. */
  get headerSubtitleOptions(): Record<string, unknown> {
    return this.data ?? {};
  }

  /** ID that will be written to clipboard when Copy ID button in header is clicked. */
  get headerCopyIdValue(): string | number {
    return this.data ? getResourceId(this.data._links.self.href) ?? '' : '';
  }

  /**
   * Renders optional form header.
   * - Customize which actions are rendered with `.renderHeaderActions()` method.
   * - Customize the header title and subtitle with `.headerTitleKey` and `.headerSubtitleKey` getters.
   * - Customize the header title and subtitle options with `.headerTitleOptions` and `.headerSubtitleOptions` getters.
   * - To hide the header completely, add `header` to `hidden-controls` attribute.
   */
  renderHeader(): TemplateResult {
    if (this.hiddenSelector.matches('header', true)) return html``;

    const data = this.data;
    const actions = data ? this.renderHeaderActions(data) : null;

    return html`
      <div>
        ${this.renderTemplateOrSlot('header:before')}
        <h2>
          <span class="flex items-center gap-s leading-xs text-xl font-medium break-all">
            <foxy-i18n
              options=${JSON.stringify(this.headerTitleOptions)}
              infer="header"
              key=${this.headerTitleKey}
            >
            </foxy-i18n>
            ${data
              ? html`
                  ${this.hiddenSelector.matches('header:copy-id', true)
                    ? ''
                    : html`
                        <foxy-copy-to-clipboard
                          infer="header copy-id"
                          class="text-m"
                          text=${this.headerCopyIdValue}
                        >
                        </foxy-copy-to-clipboard>
                      `}
                  ${this.hiddenSelector.matches('header:copy-json', true)
                    ? ''
                    : html`
                        <foxy-copy-to-clipboard
                          infer="header copy-json"
                          class="text-m"
                          icon="icons:code"
                          text=${JSON.stringify(data, null, 2)}
                        >
                        </foxy-copy-to-clipboard>
                      `}
                `
              : ''}
          </span>
          ${data
            ? html`
                <foxy-i18n
                  infer="header"
                  class="text-m text-secondary"
                  key=${this.headerSubtitleKey}
                  .options=${this.headerSubtitleOptions}
                >
                </foxy-i18n>
                ${actions ? html`<div class="mt-xs flex gap-m">${actions}</div>` : ''}
              `
            : ''}
        </h2>
        ${this.renderTemplateOrSlot('header:after')}
      </div>
    `;
  }

  /**
   * Renders form body. This is the method you should implement in your forms
   * instead of `.render()`. If you'd like to keep the submit button and the timestamps,
   * don't forget to add `super.renderBody()` to your template.
   */
  renderBody(): TemplateResult {
    if (this.data) {
      const isSnapshotDirty = this.in({ idle: { snapshot: 'dirty' } });
      const isDeleteHidden = this.hiddenSelector.matches('delete', true);
      const isClean = this.in({ idle: { snapshot: 'clean' } });
      const isUndoHidden = isClean || this.hiddenSelector.matches('undo', true);
      const isSubmitHidden = this.hiddenSelector.matches('submit', true);
      const actionClass = classMap({ 'transition-opacity': true, 'opacity-0': !isSnapshotDirty });
      const actionsHidden =
        ((isDeleteHidden && isUndoHidden && isSubmitHidden) ||
          (isDeleteHidden && !isSnapshotDirty)) &&
        !isSnapshotDirty;

      return html`
        <foxy-internal-timestamps-control infer="timestamps"></foxy-internal-timestamps-control>
        <div class=${classMap({ 'flex gap-m': !actionsHidden, 'hidden': actionsHidden })}>
          <foxy-internal-delete-control infer="delete"></foxy-internal-delete-control>
          <div class="w-full"></div>
          <foxy-internal-undo-control class=${actionClass} infer="undo">
          </foxy-internal-undo-control>
          <foxy-internal-submit-control class=${actionClass} infer="submit">
          </foxy-internal-submit-control>
        </div>
      `;
    } else if (!this.hiddenSelector.matches('create', true)) {
      return html`
        <div class="flex">
          <foxy-internal-submit-control infer="create" theme="primary success" class="ml-auto">
          </foxy-internal-submit-control>
        </div>
      `;
    } else {
      return html``;
    }
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
