import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';

/**
 * Basic card displaying an applied tax.
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-tax-card
 * @since 1.13.0
 */
export class TaxCard extends TranslatableMixin(TwoLineCard, 'tax-card')<Data> {
  render(): TemplateResult {
    return super.render({
      title: ({ name }) => html`${name}`,
      subtitle: () => html`${this.__typeLabel} &bull; ${this.__rateLabel}`,
    });
  }

  private get __typeLabel() {
    const { type, country, region, city } = this.data ?? {};

    if (type === 'global') return this.t('tax_global');
    if (type === 'union') return this.t('tax_union');
    if (type === 'country') return country;
    if (type === 'region') return `${country}, ${region}`;
    if (type === 'local') return `${country}, ${region}, ${city}`;
  }

  private get __rateLabel() {
    if (this.data?.is_live === false) {
      return this.t('percent', { fraction: this.data.rate / 100 });
    }

    const provider = this.data?.service_provider as string | undefined;

    if (provider === 'onesource') return 'Thomson Reuters ONESOURCE';
    if (provider === 'avalara') return 'Avalara AvaTax 15';
    if (provider === 'taxjar') return 'TaxJar';

    return this.t('tax_rate_provider_default');
  }
}
