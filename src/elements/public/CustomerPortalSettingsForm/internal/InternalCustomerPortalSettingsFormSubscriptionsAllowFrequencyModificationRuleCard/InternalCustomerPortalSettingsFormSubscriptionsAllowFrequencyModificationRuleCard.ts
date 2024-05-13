import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../../../mixins/translatable';
import { parseFrequency } from '../../../../../utils/parse-frequency';
import { InternalCard } from '../../../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const Base = TranslatableMixin(InternalCard);

export class InternalCustomerPortalSettingsFormSubscriptionsAllowFrequencyModificationRuleCard extends Base<Data> {
  renderBody(): TemplateResult {
    const { jsonataQuery, values } = this.data ?? {};

    const list = values?.map(value => {
      if (value === '.5m') return this.t('twice_a_week');
      const { units, count } = parseFrequency(value);
      return this.t(units, { count });
    });

    return html`
      <section class="h-s flex flex-col justify-center leading-xs">
        <p class="text-m font-medium min-w-0">
          <foxy-i18n
            infer=""
            class="block truncate"
            key=${jsonataQuery === '*' ? 'title_all' : 'title_matching'}
            .options=${{ query: jsonataQuery }}
          >
          </foxy-i18n>
        </p>
        <p class="text-s text-secondary min-w-0">
          <foxy-i18n
            infer=""
            class="block truncate"
            key=${values?.length ? 'subtitle_list' : 'subtitle_empty'}
            .options=${{ list: list?.join(', ') }}
          >
          </foxy-i18n>
        </p>
      </section>
    `;
  }
}
