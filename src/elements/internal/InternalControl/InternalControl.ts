import { html, LitElement, PropertyDeclarations, TemplateResult } from 'lit-element';
import { render } from 'lit-html';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { InferrableMixin } from '../../../mixins/inferrable';

export class InternalControl extends ConfigurableMixin(
  TranslatableMixin(ThemeableMixin(InferrableMixin(LitElement)))
) {
  static get inferredProperties(): string[] {
    return [...super.inferredProperties, 'nucleon'];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      nucleon: { attribute: false },
    };
  }

  nucleon: NucleonElement<any> | null = null;

  inferFromElement(key: string, element: HTMLElement): unknown | undefined {
    if (key === 'nucleon' && element instanceof NucleonElement) return element;
    return super.inferFromElement(key, element);
  }

  applyInferredProperties(context: Map<string, unknown>): void {
    super.applyInferredProperties(context);
    this.nucleon = (context.get('nucleon') as NucleonElement<any> | undefined) ?? null;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);

    if (typeof this.infer === 'string') {
      const lightDomTemplate = html`
        <slot name="${this.infer}:before" slot="before"></slot>
        <slot name="${this.infer}:after" slot="after"></slot>
      `;

      render(lightDomTemplate, this);
    }
  }

  renderControl(): TemplateResult {
    return html``;
  }

  render(): TemplateResult {
    if (this.hidden) return html``;

    return html`
      ${this.renderTemplateOrSlot('before', this.nucleon)} ${this.renderControl()}
      ${this.renderTemplateOrSlot('after', this.nucleon)}
    `;
  }
}
