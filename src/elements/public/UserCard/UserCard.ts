import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'user-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Card element representing a `fx:user` resource.
 *
 * @element foxy-user-card
 * @since 1.22.0
 */
export class UserCard extends Base<Data> {
  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => {
        const name = [data.first_name.trim(), data.last_name.trim()];
        return html`${name.filter(v => !!v).join(' ') || this.t('no_name')}`;
      },
      subtitle: data => html`${data.email}`,
    });
  }
}
