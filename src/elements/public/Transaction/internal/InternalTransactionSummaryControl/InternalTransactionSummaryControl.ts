import { html, TemplateResult } from 'lit-html';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';

export class InternalTransactionSummaryControl extends InternalControl {
  renderControl(): TemplateResult {
    return html`
      <div class="border-t border-transparent">
        <div class="h-m flex items-center justify-between">
          <div class="text-xl font-bold">${this.__renderPrice()}</div>
          <div>${this.nucleon?.data ? this.__renderStatus() : ''}</div>
        </div>

        <div class="border-t border-contrast-10 mb-s"></div>

        ${this.__renderTotals()}
      </div>
    `;
  }

  private __renderStatus() {
    const colors = {
      authorized: 'bg-success text-success-contrast',
      completed: 'bg-success text-success-contrast',
      declined: 'bg-error text-error-contrast',
      rejected: 'bg-error text-error-contrast',
    };

    const status = this.nucleon?.data?.status || 'completed';
    const defaultColor = 'bg-contrast-5 text-contrast';
    const color = status in colors ? colors[status as keyof typeof colors] : defaultColor;

    return html`
      <foxy-i18n
        class="flex items-center h-xs px-s text-s font-semibold rounded ${color}"
        lang=${this.lang}
        key="transaction_${status}"
        ns=${this.ns}
      >
      </foxy-i18n>
    `;
  }

  private __renderPrice() {
    const data = this.nucleon?.data;
    const currency = data?.currency_code;

    if (!data) return html`--`;

    return html`
      <foxy-i18n
        options=${JSON.stringify({ amount: `${data.total_order} ${currency}` })}
        key="price"
        infer
      >
      </foxy-i18n>
    `;
  }

  private __renderTotals() {
    const data = this.nucleon?.data;
    const currency = data?.currency_code;
    const keys = ['total_item_price', 'total_shipping', 'total_tax'] as const;

    return keys.map(
      key => html`
        <div class="flex justify-between text-m text-secondary">
          <foxy-i18n key=${key} infer></foxy-i18n>
          ${data
            ? html`
                <foxy-i18n
                  options=${JSON.stringify({ amount: `${data[key]} ${currency}` })}
                  key="price"
                  infer
                >
                </foxy-i18n>
              `
            : html`<span>--</span>`}
        </div>
      `
    );
  }
}
