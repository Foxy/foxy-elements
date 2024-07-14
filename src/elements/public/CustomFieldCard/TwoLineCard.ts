import type { HALJSONResource } from '../NucleonElement/types';
import type { TemplateResult } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

export type TemplateFn<TData extends HALJSONResource> = (data: TData) => TemplateResult;

export type RenderOptions<TData extends HALJSONResource> = {
  title: TemplateFn<TData>;
  subtitle: TemplateFn<TData>;
};

const Base = ResponsiveMixin(ConfigurableMixin(InternalCard));

export class TwoLineCard<TData extends HALJSONResource> extends Base<TData> {
  private readonly __renderTitle = (content?: TemplateFn<TData>) => {
    return html`
      <div data-testid="title">
        ${this.renderTemplateOrSlot('title:before')}

        <div class="font-medium truncate">
          ${this.data ? content?.(this.data) : ''}&ZeroWidthSpace;
        </div>

        ${this.renderTemplateOrSlot('title:after')}
      </div>
    `;
  };

  private readonly __renderSubtitle = (content?: TemplateFn<TData>) => {
    return html`
      <div data-testid="subtitle">
        ${this.renderTemplateOrSlot('subtitle:before')}

        <div class="text-secondary truncate text-s sm-text-m">
          ${this.data ? content?.(this.data) : ''}&ZeroWidthSpace;
        </div>

        ${this.renderTemplateOrSlot('subtitle:after')}
      </div>
    `;
  };

  renderBody(options?: RenderOptions<TData>): TemplateResult {
    const hiddenSelector = this.hiddenSelector;

    return html`
      <div
        class="h-s flex flex-col justify-center relative text-body text-m font-lumo leading-xs sm-h-xs sm-flex-row sm-items-center sm-justify-between"
      >
        ${hiddenSelector.matches('title', true) ? '' : this.__renderTitle(options?.title)}
        ${hiddenSelector.matches('subtitle', true) ? '' : this.__renderSubtitle(options?.subtitle)}
      </div>
    `;
  }
}
