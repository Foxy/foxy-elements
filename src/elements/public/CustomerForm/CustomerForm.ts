import { Data, Templates, TextFieldParams } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/index';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyTable } from '../../private/index';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { validate as isEmail } from 'email-validator';
import memoize from 'lodash-es/memoize';

const NS = 'customer-form';
const Base = ResponsiveMixin(
  ConfigurableMixin(ThemeableMixin(ScopedElementsMixin(TranslatableMixin(NucleonElement, NS))))
);

/**
 * Form element for creating or editing customers.
 *
 * @slot first-name:before - **new in v1.4.0**
 * @slot first-name:after - **new in v1.4.0**
 *
 * @slot last-name:before - **new in v1.4.0**
 * @slot last-name:after - **new in v1.4.0**
 *
 * @slot email:before - **new in v1.4.0**
 * @slot email:after - **new in v1.4.0**
 *
 * @slot tax-id:before - **new in v1.4.0**
 * @slot tax-id:after - **new in v1.4.0**
 *
 * @slot timestamps:before - **new in v1.4.0**
 * @slot timestamps:after - **new in v1.4.0**
 *
 * @slot create:before - **new in v1.4.0**
 * @slot create:after - **new in v1.4.0**
 *
 * @slot delete:before - **new in v1.4.0**
 * @slot delete:after - **new in v1.4.0**
 *
 * @element foxy-customer-form
 * @since 1.2.0
 */
export class CustomerForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'x-property-table': PropertyTable,
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ first_name: v }) => !v || v.length <= 50 || 'first_name_too_long',
      ({ last_name: v }) => !v || v.length <= 50 || 'last_name_too_long',
      ({ tax_id: v }) => !v || v.length <= 50 || 'tax_id_too_long',
      ({ email: v }) => (v && v.length > 0) || 'email_required',
      ({ email: v }) => (v && v.length <= 100) || 'email_too_long',
      ({ email: v }) => (v && isEmail(v)) || 'email_invalid_email',
    ];
  }

  templates: Templates = {};

  private __getValidator = memoize((prefix: string) => () => {
    return !this.errors.some(err => err.startsWith(prefix));
  });

  private __maybeRenderTextField = ({ field }: TextFieldParams) => {
    const bsid = field.replace(/_/, '-');
    const error = this.errors.find(err => err.startsWith(field));

    if (this.hiddenSelector.matches(bsid, true)) return '';

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${bsid}:before`)}

        <vaadin-text-field
          class="w-full"
          label=${this.t(field).toString()}
          value=${ifDefined(this.form?.[field]?.toString())}
          error-message=${error ? this.t(error.replace(field, 'v8n')).toString() : ''}
          data-testid=${bsid}
          .checkValidity=${this.__getValidator(field)}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches(bsid, true)}
          ?readonly=${this.readonlySelector.matches(bsid, true)}
          @input=${(evt: Event) => this.edit({ [field]: (evt.target as HTMLInputElement).value })}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot(`${bsid}:after`)}
      </div>
    `;
  };

  private __renderTimestamps = () => {
    return html`
      <div>
        ${this.renderTemplateOrSlot('timestamps:before')}

        <x-property-table
          data-testid="timestamps"
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: this.t(field),
            value: this.data ? this.t('date', { value: new Date(this.data[field]) }) : '',
          }))}
        >
        </x-property-table>

        ${this.renderTemplateOrSlot('timestamps:after')}
      </div>
    `;
  };

  private __renderAction = (action: string) => {
    const { disabledSelector, href, lang, ns } = this;

    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isDisabled = !this.in('idle') || disabledSelector.matches(action, true);
    const isValid = isTemplateValid || isSnapshotValid;

    const handleClick = (evt: Event) => {
      if (action === 'delete') {
        const confirm = this.renderRoot.querySelector('#confirm');
        (confirm as InternalConfirmDialog).show(evt.currentTarget as HTMLElement);
      } else {
        this.submit();
      }
    };

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${action}:before`)}

        <vaadin-button
          class="w-full"
          theme=${this.in('idle') ? `primary ${href ? 'error' : 'success'}` : ''}
          data-testid=${action}
          ?disabled=${(this.in({ idle: 'template' }) && !isValid) || isDisabled}
          @click=${handleClick}
        >
          <foxy-i18n ns=${ns} key=${action} lang=${lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot(`${action}:after`)}
      </div>
    `;
  };

  render(): TemplateResult {
    const { hiddenSelector, href, lang, ns } = this;
    const action = href ? 'delete' : 'create';
    const isBusy = this.in('busy');
    const isFail = this.in('fail');

    return html`
      <foxy-internal-confirm-dialog
        message="delete_prompt"
        confirm="delete"
        cancel="cancel"
        header="delete"
        theme="primary error"
        lang=${lang}
        ns=${ns}
        id="confirm"
        data-testid="confirm"
        @hide=${(evt: DialogHideEvent) => {
          if (!evt.detail.cancelled) this.delete();
        }}
      >
      </foxy-internal-confirm-dialog>

      <div data-testid="wrapper" aria-busy=${isBusy} aria-live="polite" class="space-y-l relative">
        <div class="grid grid-cols-1 sm-grid-cols-2 gap-m">
          ${this.__maybeRenderTextField({ field: 'first_name' })}
          ${this.__maybeRenderTextField({ field: 'last_name' })}
          ${this.__maybeRenderTextField({ field: 'email' })}
          ${this.__maybeRenderTextField({ field: 'tax_id' })}
        </div>

        ${hiddenSelector.matches('timestamps', true) || !href ? '' : this.__renderTimestamps()}
        ${hiddenSelector.matches(action) ? '' : this.__renderAction(action)}

        <div
          data-testid="spinner"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !isBusy && !isFail,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${isFail ? 'error' : isBusy ? 'busy' : 'empty'}
            lang=${lang}
            ns=${ns}
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__getValidator.cache.clear?.();
  }
}
