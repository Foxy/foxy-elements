import type { TemplateResult } from 'lit-html';
import type { TabsElement } from '@vaadin/vaadin-tabs';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html, css } from 'lit-element';

const NS = 'payment-method-form';
const Base = TranslatableMixin(InternalForm, NS);

export class PaymentMethodForm extends Base<Data> {
  static get properties() {
    return {
      ...super.properties,
      __selectedTab: { attribute: false },
    };
  }

  static get styles() {
    return [
      super.styles,
      css`
        vaadin-tab:first-child {
          border-top-left-radius: var(--lumo-border-radius-m);
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-bottom-left-radius: var(--lumo-border-radius-m);
        }

        vaadin-tab:last-child {
          border-top-left-radius: 0;
          border-top-right-radius: var(--lumo-border-radius-m);
          border-bottom-right-radius: var(--lumo-border-radius-m);
          border-bottom-left-radius: 0;
        }

        vaadin-tab[selected] {
          background-color: var(--lumo-primary-color-10pct);
        }

        vaadin-tab:not([selected]) {
          background-color: var(--lumo-contrast-5pct);
        }

        #root > :not([infer='cc-exp']):not([infer='cc-csc']) {
          grid-column: 1 / span 2;
        }
      `,
    ];
  }

  static get v8n(): NucleonV8N<Data> {
    return [({ token: v }) => !v || v !== 'pending' || 'token:v8n_required'];
  }

  private readonly __ccNumberGetValue = () => {
    return this.data?.cc_number_masked?.replace(/xxxx/g, '•••• ') ?? '';
  };

  private readonly __ccExpGetValue = () => {
    const parts = [this.data?.cc_exp_month ?? '', this.data?.cc_exp_year ?? ''];
    return parts.filter(v => !!v).join('/');
  };

  private readonly __ccCscGetValue = () => {
    return this.data?.save_cc ? '•••' : '';
  };

  private __selectedTab = 0;

  get readonlySelector(): BooleanSelector {
    const alwaysReadonly = ['cc-number', 'cc-exp', 'cc-csc'];
    return new BooleanSelector([...alwaysReadonly, super.readonlySelector].join(' '));
  }

  get hiddenSelector(): BooleanSelector {
    const isTokenVisible = this.href && this.__selectedTab !== 0;
    const alwaysHidden = isTokenVisible ? ['cc-number', 'cc-exp', 'cc-csc'] : ['cc-token'];
    return new BooleanSelector([...alwaysHidden, super.hiddenSelector].join(' '));
  }

  renderBody(): TemplateResult {
    if (!this.href) return html``;

    return html`
      <div id="root" class="grid grid-cols-2 gap-m">
        <vaadin-tabs
          selected=${this.__selectedTab}
          theme="minimal equal-width-tabs"
          style="margin: 0 -0.75em; --lumo-size-l: var(--lumo-size-m);"
          class=${this.href ? '' : 'hidden'}
          @selected-changed=${(evt: CustomEvent) => {
            const tabs = evt.currentTarget as TabsElement;
            this.__selectedTab = tabs.selected ?? 0;
            if (tabs.selected === 0) this.undo();
          }}
        >
          <vaadin-tab><foxy-i18n infer="" key="tab_0"></foxy-i18n></vaadin-tab>
          <vaadin-tab><foxy-i18n infer="" key="tab_1"></foxy-i18n></vaadin-tab>
        </vaadin-tabs>

        <foxy-internal-text-control infer="cc-number" .getValue=${this.__ccNumberGetValue}>
        </foxy-internal-text-control>

        <foxy-internal-text-control infer="cc-exp" .getValue=${this.__ccExpGetValue}>
        </foxy-internal-text-control>

        <foxy-internal-text-control infer="cc-csc" .getValue=${this.__ccCscGetValue}>
        </foxy-internal-text-control>

        <foxy-internal-bank-card-control infer="cc-token"></foxy-internal-bank-card-control>

        ${super.renderBody()}
      </div>
    `;
  }
}
