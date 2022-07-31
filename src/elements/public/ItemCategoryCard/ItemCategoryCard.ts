import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

export class ItemCategoryCard extends TwoLineCard<Data> {
  render(): TemplateResult {
    return super.render({
      title: data => html`${data.name}`,
      subtitle: data => html`${data.code}`,
    });
  }
}
