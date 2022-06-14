import type { PropertyDeclarations, TemplateResult } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { html, LitElement } from 'lit-element';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { render } from 'lit-html';

/**
 * An internal base class for any control in a Nucleon form. That control can be as simple as a text field bound
 * to a property or as complex as a query builder, and it infers property values from the
 * parent Nucleon/Configurable/Translatable element, saving the need to manually calculate
 * and bind properties in Lit templates. Each control renders before and after slots in the regular DOM + its
 * own layout in the shadow DOM. When hidden via `hiddencontrols` in the parent,
 * uses `display: none` to hide itself.
 *
 * @element foxy-internal-control
 * @since 1.17.0
 */
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

  /** NucleonElement instance this control is bound to. */
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

  /**
   * Renders the control itself. In most cases, you will need to implement
   * this method instead of `.render()` in your class to keep the before and after templates/slots.
   */
  renderControl(): TemplateResult {
    return html``;
  }

  /**
   * Renders the control (if visible) and the before/after templates/slots.
   * You should probably implement `.renderControl()` method instead of this one in your class.
   */
  render(): TemplateResult {
    if (this.hidden) return html``;

    return html`
      ${this.renderTemplateOrSlot('before', this.nucleon)} ${this.renderControl()}
      ${this.renderTemplateOrSlot('after', this.nucleon)}
    `;
  }
}
