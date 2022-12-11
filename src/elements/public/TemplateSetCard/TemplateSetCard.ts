import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'template-set-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Card element representing a template set (`fx:template_set`).
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-template-set-card
 * @since 1.21.0
 */
export class TemplateSetCard extends Base<Data> {
  render(): TemplateResult {
    return super.render({
      title: data => html`${data.description}`,
      subtitle: data => html`${data.code}`,
    });
  }
}
