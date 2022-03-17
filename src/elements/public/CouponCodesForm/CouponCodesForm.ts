import { Data, Templates } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { EditableList } from '../../private/EditableList/EditableList';
import { Group } from '../../private/Group/Group';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const NS = 'coupon-codes-form';
const Base = ConfigurableMixin(
  ThemeableMixin(ScopedElementsMixin(TranslatableMixin(NucleonElement, NS)))
);

/**
 * Form element for importing coupon codes (`fx:coupon_codes`).
 *
 * @slot codes:before
 * @slot codes:after
 *
 * @slot import:before
 * @slot import:after
 *
 * @element foxy-coupon-codes-form
 * @since 1.15.0
 */
export class CouponCodesForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-button': customElements.get('vaadin-button'),
      'iron-icon': customElements.get('iron-icon'),

      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),

      'x-editable-list': EditableList,
      'x-group': Group,
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [({ coupon_codes: v }) => (v && v.length > 0) || 'coupon_codes_required'];
  }

  templates: Templates = {};

  render(): TemplateResult {
    const { hiddenSelector, lang, ns } = this;

    const isBusy = this.in('busy');
    const isFail = this.in('fail');
    const isSnapshot = this.in({ idle: 'snapshot' });
    const isTemplate = this.in({ idle: 'template' });

    const transition = 'transition-opacity duration-500';
    const hidden = 'opacity-0 pointer-events-none';

    return html`
      <div class="relative">
        <div
          class=${classMap({
            'relative space-y-m': true,
            [transition]: true,
            [hidden]: isSnapshot,
          })}
        >
          ${hiddenSelector.matches('codes', true) ? '' : this.__renderCodes()}
          ${hiddenSelector.matches('import', true) ? '' : this.__renderImport()}
        </div>

        <div
          class=${classMap({
            'absolute inset-0 flex flex-col items-center justify-center': true,
            'text-center text-m text-secondary leading-m': true,
            [transition]: true,
            [hidden]: !isSnapshot,
          })}
        >
          <div class="mx-auto flex mb-m w-l h-l rounded-t-l rounded-b-l bg-success">
            <iron-icon icon="icons:done-all" class="m-auto text-success-contrast"></iron-icon>
          </div>

          <foxy-i18n class="block" lang=${lang} key="import_codes_done" ns=${ns}></foxy-i18n>
        </div>

        <div
          data-testid="spinner"
          class=${classMap({
            'absolute inset-0 flex': true,
            [transition]: true,
            [hidden]: !isBusy && !isFail,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${isFail ? 'error' : isTemplate ? 'empty' : 'busy'}
            lang=${lang}
            ns="${ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  private __renderCodes() {
    const maxVisible = 16;
    const codes = this.form.coupon_codes ?? [];

    const visibleCodes = codes.length > maxVisible ? codes.slice(-maxVisible) : codes;
    const hiddenCodes = codes.length > maxVisible ? codes.slice(0, -maxVisible) : [];

    const items = visibleCodes.map(code => {
      let href: string;

      try {
        const url = new URL(this.parent);
        url.searchParams.set('code', code);
        href = url.toString();
      } catch {
        href = this.parent;
      }

      return {
        value: code,
        label: html`
          <foxy-internal-coupon-codes-form-list-item
            group=${this.group}
            href=${href}
            lang=${this.lang}
            ns=${this.ns}
          >
          </foxy-internal-coupon-codes-form-list-item>
        `,
      };
    });

    return html`
      <div data-testid="codes">
        ${this.renderTemplateOrSlot('codes:before')}

        <x-group class="mb-xs" frame>
          <foxy-i18n slot="header" lang=${this.lang} key="code_plural" ns=${this.ns}></foxy-i18n>

          <x-editable-list
            data-testid="codes:list"
            lang=${this.lang}
            ns=${this.ns}
            ?disabled=${!this.in('idle') || this.disabledSelector.matches('codes', true)}
            ?readonly=${this.readonlySelector.matches('codes', true)}
            .items=${items}
            @change=${(evt: CustomEvent) => {
              const list = evt.currentTarget as EditableList;
              const newCodes = new Set([...hiddenCodes, ...list.items.map(item => item.value)]);
              this.edit({ coupon_codes: [...newCodes] });
            }}
            @paste=${(evt: ClipboardEvent) => {
              evt.preventDefault();

              const text = evt.clipboardData?.getData('text') ?? '';
              const pastedCodes = text
                .split(/\s/)
                .map(code => code.trim())
                .filter(code => code.length > 0);

              this.edit({ coupon_codes: Array.from(new Set([...codes, ...pastedCodes])) });
            }}
          >
            <div
              class="ml-m py-s border-b border-contrast-10 font-lumo"
              ?hidden=${hiddenCodes.length === 0}
            >
              <foxy-i18n
                options=${JSON.stringify({ count: hiddenCodes.length })}
                class="block text-body text-m mb-xs"
                lang=${this.lang}
                key="hidden_codes_header"
                ns=${this.ns}
              >
              </foxy-i18n>

              <foxy-i18n
                class="block text-xs text-tertiary"
                lang=${this.lang}
                key="hidden_codes_explainer"
                ns=${this.ns}
              >
              </foxy-i18n>
            </div>
          </x-editable-list>
        </x-group>

        <foxy-i18n
          class="block text-xs text-tertiary leading-s"
          lang=${this.lang}
          key="code_import_hint"
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('codes:after')}
      </div>
    `;
  }

  private __renderImport() {
    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isValid = isTemplateValid || isSnapshotValid;

    return html`
      <div>
        ${this.renderTemplateOrSlot('import:before')}

        <vaadin-button
          data-testid="import"
          class="w-full mb-xs"
          theme="primary success"
          ?disabled=${!isValid || !this.in('idle') || this.disabledSelector.matches('import', true)}
          @click=${() => this.submit()}
        >
          <foxy-i18n ns=${this.ns} key="import" lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('import:after')}
      </div>
    `;
  }
}
