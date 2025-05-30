import type { HALJSONResource as Data } from '../../public/NucleonElement/types';
import type { TemplateResult } from 'lit-html';

import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

/**
 * Internal base element for cards.
 *
 * @since 1.17.0
 * @element foxy-internal-card
 */
export class InternalCard<TData extends Data> extends ThemeableMixin(NucleonElement)<TData> {
  /**
   * Invoked together with `.render()` to obtain a template for card contents.
   * When extending `InternalCard`, prefer overriding this method to `.render()`.
   */
  renderBody(): TemplateResult {
    return html``;
  }

  render(): TemplateResult {
    const spinnerState = this.in('fail')
      ? 'error'
      : this.in({ idle: 'template' })
      ? 'empty'
      : 'busy';

    return html`
      <div
        aria-busy=${this.in('busy')}
        aria-live="polite"
        class="relative leading-s text-body text-m font-lumo"
      >
        <div
          class=${classMap({
            'transition duration-500 ease-in-out': true,
            'opacity-0 pointer-events-none': !this.isBodyReady,
          })}
        >
          ${this.renderBody()}
        </div>

        <div
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'items-center justify-center': true,
            'opacity-0 pointer-events-none': this.isBodyReady,
          })}
        >
          <foxy-spinner
            layout=${spinnerState === 'busy' ? 'no-label' : 'horizontal'}
            state=${spinnerState}
            infer="spinner"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  get isBodyReady(): boolean {
    return !!this.data;
  }
}
