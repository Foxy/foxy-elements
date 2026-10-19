import type { ScopeCollection } from '../../../utils/user-scope';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from './TwoLineCard';
import { getItemScopeCollection } from '../../../utils/item-scope-collection';

/**
 * Basic card displaying a custom field.
 *
 * @element foxy-custom-field-card
 * @since 1.11.0
 */
export class CustomFieldCard extends TranslatableMixin(TwoLineCard, 'custom-field-card')<Data> {
  get scopeCollection(): ScopeCollection | null {
    return getItemScopeCollection(this.data);
  }

  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.name}`,
      subtitle: data => html`${data.value}`,
    });
  }
}
