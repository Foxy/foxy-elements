import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

/**
 * Basic card displaying a tax.
 *
 * @element foxy-tax-card
 * @since 1.13.0
 */
export class TaxCard extends TranslatableMixin(TwoLineCard, 'tax-card')<Data> {
  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.name}`,
      subtitle: data => html`${this.getTypeLabel(data)} &bull; ${this.getRateLabel(data)}`,
    });
  }

  private getTypeLabel({ type, country, region, city }: Data) {
    if (type === 'global') return this.t('tax_global');
    if (type === 'union') return this.t('tax_union');
    if (type === 'country') return country;
    if (type === 'region') return `${country}, ${region}`;
    if (type === 'local') return `${country}, ${region}, ${city}`;
  }

  private getRateLabel({ is_live, rate }: Data) {
    if (!is_live) return this.t('percent', { fraction: rate / 100 });

    const provider = this.data?.service_provider as string | undefined;
    if (provider === 'onesource') return 'Thomson Reuters ONESOURCE';
    if (provider === 'avalara') return 'Avalara AvaTax 15';
    if (provider === 'taxjar') return 'TaxJar';

    return this.t('tax_rate_provider_default');
  }
}
