import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../../../mixins/translatable';
import { parseDuration } from '../../../../../utils/parse-duration';
import { InternalCard } from '../../../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const Base = TranslatableMixin(InternalCard);

export class InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleCard extends Base<Data> {
  renderBody(): TemplateResult {
    const { min, max, allowedDays, jsonataQuery, disallowedDates } = this.data ?? {};

    const minD = min ? parseDuration(min) : undefined;
    const maxD = max ? parseDuration(max) : undefined;

    const line1Key = jsonataQuery === '*' ? 'line_1_all' : 'line_1_matching';
    const line1Options = { query: jsonataQuery };

    const line2Options = {
      from: minD ? this.t(`unit_${minD.units}`, { count: minD.count }) : this.t('any'),
      to: maxD ? this.t(`unit_${maxD.units}`, { count: maxD.count }) : this.t('any'),
    };

    const line3Key = `line_3_${allowedDays ? allowedDays.type : 'any'}`;
    const line3Options = {
      list:
        allowedDays?.type === 'month'
          ? allowedDays?.days.join(', ')
          : allowedDays?.days.map(day => this.t(`day_${day}`)).join(', '),
    };

    const line4Key = disallowedDates ? 'line_4_some' : 'line_4_none';
    const line4Options = {
      list: disallowedDates
        ?.map(date => {
          const [from, to] = date.split('..');
          return from && to
            ? this.t('date_range', { from, to })
            : this.t('single_date', { value: date });
        })
        .join(', '),
    };

    return html`
      <section class="leading-xs" style="margin: -0.25ch 0">
        <p class="text-m font-medium truncate">
          <foxy-i18n infer="" key=${line1Key} .options=${line1Options}></foxy-i18n>
        </p>
        <p class="text-s text-secondary">
          <foxy-i18n infer="" class="block truncate" key="line_2" .options=${line2Options}>
          </foxy-i18n>
          <foxy-i18n infer="" class="block truncate" key=${line3Key} .options=${line3Options}>
          </foxy-i18n>
          <foxy-i18n infer="" class="block truncate" key=${line4Key} .options=${line4Options}>
          </foxy-i18n>
        </p>
      </section>
    `;
  }
}
