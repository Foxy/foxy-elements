import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'payments-api-payment-method-card';
const Base = TranslatableMixin(TwoLineCard, NS);

export class PaymentsApiPaymentMethodCard extends Base<Data> {
  static get defaultImageSrc(): string {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 44 44'%3E%3Cpath fill='%23fff' d='m29.3 14 14-14H32.1l-14 14h11.2Zm2.7 9.9 12-12V.7L30.62 14.1A2 2 0 0 1 32 16v7.9ZM13.31 44h11.18L44 24.5V13.3l-12 12V28a2 2 0 0 1-2 2h-2.69l-14 14Zm-1.41 0H.7l14-14h11.2l-14 14Zm14 0h11.2l6.9-6.9V25.9L25.9 44Zm12.6 0H44v-5.5L38.5 44Z'/%3E%3Cpath fill='%23fff' d='M30 28H14v-6h16v6Zm0-10v-2H14v2h16ZM0 43.3l13.4-13.4A2 2 0 0 1 12 28v-7.9L0 32.12V43.3Z'/%3E%3Cpath fill='%23fff' d='M16.7 14H14c-1.11 0-1.99.89-1.99 2v2.7L0 30.7V19.52L19.52 0H30.7l-14 14Zm1.4-14H6.92L0 6.92V18.1L18.1 0ZM5.5 0H0v5.5L5.5 0Z'/%3E%3C/svg%3E";
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

    const defaultSrc = PaymentsApiPaymentMethodCard.defaultImageSrc;
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
