import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'store-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Card element representing a `fx:store` resource.
 *
 * @element foxy-store-card
 * @since 1.22.0
 */
export class StoreCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaultDomain: { attribute: 'default-domain' },
    };
  }

  /** Default host domain for stores that don't use a custom domain name, e.g. `foxycart.com`. */
  defaultDomain: string | null = null;

  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.store_name}`,
      subtitle: data => {
        const defaultD = this.defaultDomain;
        const domain = data?.store_domain;
        return html`${domain?.includes('.') || !defaultD ? domain : `${domain}.${defaultD}`}`;
      },
    });
  }
}
