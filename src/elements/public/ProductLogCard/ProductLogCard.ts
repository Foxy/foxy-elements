import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'product-log-card';
const Base = ConfigurableMixin(TranslatableMixin(InternalCard, NS));

const TYPES = ['created', 'updated', 'deleted', 'stock_adjustment', 'stock_reset'];
const SOURCES = ['mit_admin', 'mit_api', 'mit_system', 'cit_customer_portal'];
const MAX_VALUE_LENGTH = 120;

/** A value as short text: lists and objects as JSON, cut off when long. */
function show(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text;
}

/**
 * Card element for an entry in a product's log (`fx:product_log`): what
 * happened and when, who or what did it, each field's value before and after,
 * and any details the entry carries.
 *
 * @element foxy-product-log-card
 * @since 1.62.0
 */
export class ProductLogCard extends Base<Data> {
  renderBody(): TemplateResult {
    const data = this.data;
    if (!data) return html``;

    const changes = Object.entries(data.changes ?? {});
    const details = Object.entries(data.details ?? {});
    const typeKey = TYPES.includes(data.type) ? `type_${data.type}` : 'type_other';
    const sourceKey = SOURCES.includes(data.source ?? '')
      ? `source_${data.source}`
      : 'source_other';

    return html`
      <div class="grid gap-xs text-body text-m font-lumo leading-s">
        <div class="flex justify-between items-center" style="gap: 0.75rem">
          <span class="font-medium truncate" data-testid="type">
            <foxy-i18n infer="" key=${typeKey} .options=${{ type: data.type }}></foxy-i18n>
          </span>
          <span class="text-s text-tertiary flex-shrink-0" data-testid="date">
            <foxy-i18n infer="" key="date" .options=${{ value: data.date_created }}></foxy-i18n>
          </span>
        </div>

        <div class="text-s text-secondary" data-testid="source">
          ${data.source
            ? html`
                <foxy-i18n infer="" key=${sourceKey} .options=${{ source: data.source }}>
                </foxy-i18n>
              `
            : ''}
          ${data.transaction_id
            ? html`
                ${data.source ? html`<span class="text-tertiary">&bull;</span>` : ''}
                <foxy-i18n infer="" key="transaction" .options=${{ id: data.transaction_id }}>
                </foxy-i18n>
              `
            : ''}
        </div>

        ${changes.length
          ? html`
              <ul class="text-s" data-testid="changes">
                ${changes.map(
                  ([field, change]) => html`
                    <li style="overflow-wrap: anywhere">
                      <span class="font-medium">${field}</span>:
                      <span class="text-secondary">${show(change?.before)}</span>
                      <span aria-hidden="true">→</span>
                      <foxy-i18n class="sr-only" infer="" key="becomes"></foxy-i18n>
                      ${show(change?.after)}
                    </li>
                  `
                )}
              </ul>
            `
          : ''}
        ${details.length
          ? html`
              <ul class="text-s text-secondary" data-testid="details">
                ${details.map(
                  ([name, value]) => html`
                    <li style="overflow-wrap: anywhere">
                      <span class="font-medium">${name}</span>: ${show(value)}
                    </li>
                  `
                )}
              </ul>
            `
          : ''}
        ${data.error_message
          ? html`<p class="text-s text-error" data-testid="error">${data.error_message}</p>`
          : ''}
      </div>
    `;
  }
}
