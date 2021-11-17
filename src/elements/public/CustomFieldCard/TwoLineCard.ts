import { ConfigurableMixin, Renderer } from '../../../mixins/configurable';
import { TemplateResult, html } from 'lit-html';

import { HALJSONResource } from '../NucleonElement/types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { ThemeableMixin } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';

export type TemplateFn<TData extends HALJSONResource> = (data: TData) => TemplateResult;

export type Templates<TData extends HALJSONResource> = {
  'title:before'?: Renderer<TData>;
  'title:after'?: Renderer<TData>;
  'subtitle:before'?: Renderer<TData>;
  'subtitle:after'?: Renderer<TData>;
};

export type RenderOptions<TData extends HALJSONResource> = {
  title: TemplateFn<TData>;
  subtitle: TemplateFn<TData>;
};

const Base = ConfigurableMixin(ThemeableMixin(NucleonElement));

export class TwoLineCard<TData extends HALJSONResource> extends Base<TData> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      lang: { type: String },
      ns: { type: String },
    };
  }

  templates: Templates<TData> = {};

  lang = '';

  ns = '';

  private readonly __renderTitle = (content?: TemplateFn<TData>) => {
    return html`
      <div data-testid="title">
        ${this.renderTemplateOrSlot('title:before')}
        <div class="text-secondary">${this.data ? content?.(this.data) : ''}&ZeroWidthSpace;</div>
        ${this.renderTemplateOrSlot('title:after')}
      </div>
    `;
  };

  private readonly __renderSubtitle = (content?: TemplateFn<TData>) => {
    return html`
      <div data-testid="subtitle">
        ${this.renderTemplateOrSlot('subtitle:before')}
        <div class="font-semibold">${this.data ? content?.(this.data) : ''}&ZeroWidthSpace;</div>
        ${this.renderTemplateOrSlot('subtitle:after')}
      </div>
    `;
  };

  render(options?: RenderOptions<TData>): TemplateResult {
    const hiddenSelector = this.hiddenSelector;

    return html`
      <div
        aria-live="polite"
        aria-busy=${!this.data && this.in('busy')}
        class="relative text-body text-m font-lumo leading-m"
      >
        ${hiddenSelector.matches('title', true) ? '' : this.__renderTitle(options?.title)}
        ${hiddenSelector.matches('subtitle', true) ? '' : this.__renderSubtitle(options?.subtitle)}

        <div
          class=${classMap({
            'transition duration-250 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !!this.data,
          })}
        >
          <foxy-spinner
            data-testid="spinner"
            class="m-auto"
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
