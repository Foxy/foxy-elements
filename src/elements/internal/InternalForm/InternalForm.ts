import type { HALJSONResource } from '../../public/NucleonElement/types';
import type { TemplateResult } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
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
            'grid grid-cols-1 gap-m': true,
            'transition-opacity': true,
            'opacity-0 pointer-events-none': isSpinnerVisible,
          })}
        >
          ${this.renderBody()}
        </div>

        <div
          data-testid="spinner"
          class=${classMap({
            'transition-opacity absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !isSpinnerVisible,
          })}
        >
          <foxy-spinner
            layout=${this.in('fail') ? 'vertical' : 'no-label'}
            class="m-auto"
            state=${this.in('fail') ? 'error' : 'busy'}
            infer="spinner"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
