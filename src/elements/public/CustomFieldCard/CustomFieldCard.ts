import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from './TwoLineCard';

/**
 * Basic card displaying a custom field.
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-custom-field-card
 * @since 1.11.0
 */
export class CustomFieldCard extends TranslatableMixin(TwoLineCard, 'custom-field-card')<Data> {
  render(): TemplateResult {
    return super.render({
      title: data => html`${data.name}`,
      subtitle: data => html`${data.value}`,
    });
  }
}
