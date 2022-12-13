import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'payments-api-fraud-protection-card';
const Base = TranslatableMixin(TwoLineCard, NS);

export class PaymentsApiFraudProtectionCard extends Base<Data> {
  static get defaultImageSrc(): string {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 44 44'%3E%3Cpath fill='%23fff' d='M0 20.73v-9.9L10.83 0h9.9L0 20.73ZM0 0h9.41L0 9.41V0Zm0 22.14L22.14 0h9.9l-9.43 9.44-.61-.27-10.5 4.66v7-.29L0 32.04v-9.9Zm11.54-.23L0 33.46v9.9l14.14-14.14a15 15 0 0 1-2.6-7.3Zm3.2 8.12L.77 44h9.9l9.7-9.7a13.75 13.75 0 0 1-5.63-4.27Zm6.67 4.64L12.08 44h9.9L44 21.98v-9.9L32.16 23.92C31.01 29.15 27.05 33.6 22 34.83l-.59-.16Zm11.02-12.43L44 10.67V.77L31.42 13.35l1.08.48v7a13 13 0 0 1-.07 1.4Zm-1.99-9.32L43.35 0h-9.9l-9.87 9.87 6.86 3.05ZM23.4 44 44 23.4v9.9L33.3 44h-9.9Zm11.31 0L44 34.71V44h-9.29Z'/%3E%3Cpath fill='%23fff' d='M30.17 21.99H22V11.72l-8.17 3.63V22H22v10.42c4.34-1.34 7.55-5.63 8.17-10.43Z'/%3E%3C/svg%3E";
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getImageSrc: { attribute: false },
    };
  }

  getImageSrc: ((type: string) => string) | null = null;

  render(): TemplateResult {
    const defaultLayout = super.render({
      title: data => html`${data.helper.name}`,
      subtitle: data => html`${data.description}`,
    });

    if (!this.in({ idle: 'snapshot' })) return defaultLayout;

    const defaultSrc = PaymentsApiFraudProtectionCard.defaultImageSrc;
    const data = this.data;

    return html`
      <figure class="flex items-center gap-m">
        <img
          class="relative h-s w-s object-cover rounded-full bg-contrast-20 flex-shrink-0 shadow-xs"
          src=${(data ? this.getImageSrc?.(data.type) : null) ?? defaultSrc}
          alt=${this.t('image_alt')}
          @error=${(evt: Event) => ((evt.currentTarget as HTMLImageElement).src = defaultSrc)}
        />

        <figcaption class="min-w-0 flex-1">${defaultLayout}</figcaption>
      </figure>
    `;
  }
}
