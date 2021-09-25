import {
  AdminEmailTemplateItem,
  CartIncludeTemplateItem,
  CartTemplateItem,
  CheckoutTemplateItem,
  CustomerEmailTemplateItem,
  EmailTemplateItem,
} from './types';
import { CSSResultArray, PropertyDeclarations, TemplateResult, css, html } from 'lit-element';
import { Checkbox, Choice, Group, PropertyTable } from '../../private/index';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { Tabs } from '../../private/Tabs/Tabs';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { ifDefined } from 'lit-html/directives/if-defined';
import memoize from 'lodash-es/memoize';

const NS = 'template-form';

const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)))
);

type Item = AdminEmailTemplateItem &
  CartIncludeTemplateItem &
  CartTemplateItem &
  CheckoutTemplateItem &
  CustomerEmailTemplateItem &
  EmailTemplateItem;

export class TemplateForm extends Base<Item> {
  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        #cached-content::part(input-field) {
          max-height: 15em;
        }
      `,
    ];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __cacheSuccess: { attribute: false, type: Boolean },
      __customizeTemplate: { attribute: false, type: String },
    };
  }

  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-i18n': customElements.get('foxy-i18n'),
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'vaadin-button': customElements.get('vaadin-button'),
      'vaadin-radio-button': customElements.get('vaadin-radio-button'),
      'vaadin-radio-group': customElements.get('vaadin-radio-group'),
      'vaadin-text-area': customElements.get('vaadin-text-area'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'x-checkbox': Checkbox,
      'x-choice': Choice,
      'x-group': Group,
      'x-property-table': PropertyTable,
      'x-tabs': Tabs,
    };
  }

  static get v8n(): NucleonV8N<Item> {
    const url_fields = {
      content_html_url: 300,
      content_text_url: 300,
      content_url: 300,
    };
    type UrlField = keyof typeof url_fields;
    const rules = [
      // url fields must not exceed 300
      ...Object.keys(url_fields).map(
        (field: string) => (item: Partial<EmailTemplateItem & CartTemplateItem>) => {
          const v = item[field as unknown as UrlField];
          return !v || v.length <= url_fields[field as UrlField] || `${field}_too_long`;
        }
      ),
      // url fields must be URLs
      ...Object.keys(url_fields).map(
        (field: string) => (item: Partial<EmailTemplateItem & CartTemplateItem>) => {
          const v = item[field as unknown as UrlField];
          return !v || TemplateForm.__isValidUrl(v) || `${field}_invalid`;
        }
      ),
    ];
    return rules;
  }

  private __isEmail = false;

  private __cacheErrors = [];

  private __cacheSuccess = false;

  private __getValidator = memoize((prefix: string) => () => {
    return !this.errors.some(err => err.startsWith(prefix));
  });

  private __bindField = memoize((key: keyof Item) => {
    const edit = { [key]: '' };
    return (evt: CustomEvent) => {
      const target = evt.target as HTMLInputElement;
      edit[key] = target.value;
      this.edit(edit);
    };
  });

  private __customizeTemplate: 'default' | 'url' | 'clipboard' = 'default';

  get href(): string {
    return super.href;
  }

  set href(value: string) {
    super.href = value;
    if (value.includes('/email_templates/')) {
      this.__isEmail = true;
    } else {
      this.__isEmail = false;
    }
  }

  render(): TemplateResult {
    return html`${this.__isEmail
      ? html`
          <x-tabs size="2" data-testid="tabs">
            ${['html', 'text'].map(
              (tab, index) => html`
                <foxy-i18n
                  data-testclass="i18n"
                  slot="tab-${index}"
                  lang="${this.lang}"
                  key="email.${tab}-version"
                  ns="${this.ns}"
                ></foxy-i18n>
                <div class="pt-s" slot="panel-${index}">
                  ${this.__renderForm(tab as 'html' | 'text')}
                </div>
              `
            )}
          </x-tabs>
        `
      : this.__renderForm()}`;
  }

  __renderForm(contentType: 'html' | 'text' = 'text'): TemplateResult {
    let contentField: 'content' | 'content_html' | 'content_text';
    let urlField: 'content_url' | 'content_html_url' | 'content_text_url';
    if (this.__isEmail) {
      if (contentType == 'html') {
        contentField = 'content_html';
        urlField = 'content_html_url';
      } else {
        contentField = 'content_text';
        urlField = 'content_text_url';
      }
    } else {
      contentField = 'content';
      urlField = 'content_url';
    }

    return html`
      <foxy-internal-confirm-dialog
        data-testid="confirm-cache"
        message="cache_prompt"
        confirm="cache"
        cancel="cancel"
        header="cache"
        theme="primary error"
        lang=${this.lang}
        ns=${this.ns}
        id="confirm-cache"
        @hide=${this.__handleConfirmCache}
      >
      </foxy-internal-confirm-dialog>
      ${ifDefined(this.form.description)
        ? html`
            <vaadin-text-field
              class="w-full mb-s"
              label="${this.t('description.label')}"
              value=${this.form?.description}
              readonly
            >
            </vaadin-text-field>
          `
        : ''}
      ${this.__isEmail
        ? html`
            <vaadin-text-field
              class="w-full mb-s"
              data-testid="subject"
              value=${ifDefined((this.form as any)['subject'])}
              @input=${this.__bindField('subject')}
              label="${this.t('email.subject')}"
            >
            </vaadin-text-field>
          `
        : ``}
      ${this.__renderChoices(contentType, urlField, contentField)}
      <x-property-table
        class="mb-xl"
        .items=${(['date_modified', 'date_created'] as const).map(field => ({
          name: this.t(field),
          value: this.data
            ? html`
                <foxy-i18n key="date" options='{"value": "${this.data![field]}"}'></foxy-i18n>
                <foxy-i18n key="time" options='{"value": "${this.data![field]}"}'></foxy-i18n>
              `
            : '',
        }))}
      ></x-property-table>
      <vaadin-button
        data-testid="action"
        theme=${this.in('idle') ? `primary ${this.href ? 'error' : 'success'}` : ''}
        class="w-full"
        ?disabled=${!this.errors.length}
        @click=${this.__handleActionSubmit}
      >
        <foxy-i18n lang=${this.lang} key="update" ns=${this.ns}> </foxy-i18n>
      </vaadin-button>
    `;
  }

  private __renderChoices(
    contentType: 'html' | 'text',
    urlField: string,
    contentField: string
  ): TemplateResult {
    return html`
      <x-choice
        data-testid="template-type${this.__isEmail ? '-' + contentType : ''}"
        class="w-full py-m"
        ?readonly=${this.readonly}
        vertical-align="top"
        .items=${['default', 'url', 'clipboard']}
        @change=${(ev: CustomEvent) => this._setCustomizeState(ev)}
        error-message=${this.__getErrorMessage(urlField)}
        .getText=${this.__optionTextFormatted.bind(this)}
        >
        <foxy-i18n key="customize-template" lang=${this.lang} ns=${this.ns}></foxy-i18n>
        <div slot="url-conditional">
          <div class="flex items-center mt-0 mb-m">
            <vaadin-text-field
              class="mr-s flex-grow"
              value=${ifDefined((this.form as any)[urlField])}
              data-testid="${urlField}"
              @input=${this.__bindField(urlField as any)}
              >
            </vaadin-text-field>
            <vaadin-button 
              @click=${this.__handleActionCache}
              ?disabled=${!(
                this.form &&
                (this.form as any)[urlField] &&
                ((this.form as any)[urlField] as string).length > 0 &&
                this.__getErrorMessage(urlField).length == 0
              )}
              >
              <foxy-i18n 
                lang=${this.lang}
                key="cache"
                ns=${this.ns}>
            </vaadin-button>
          </div>
          ${
            this.__cacheSuccess
              ? html`<foxy-i18n key="cache-success" lang=${this.lang} ns=${this.ns}></foxy-i18n>`
              : ''
          }
          ${
            this.__cacheErrors.length
              ? html`<foxy-i18n
                  class="color-error"
                  key="cache-error"
                  lang=${this.lang}
                  ns=${this.ns}
                ></foxy-i18n>`
              : ''
          }
        </div>
        <div slot="clipboard-conditional">
          <vaadin-text-area
            id="cached-content"
            data-testid="${contentField}"
            class="w-full"
            label="${this.t('content')}"
            value=${ifDefined((this.form as any)[contentField])}
            >
          </vaadin-text-area>
        </div>
      </x-choice>
    `;
  }

  private __optionTextFormatted(text: string): TemplateResult {
    return html`
      <div class="flex flex-col justify-start my-s">
        <div class="w-full">${this.t(`template-type.label-${text}`)}</div>
        <div class="w-full text-s">${this.t(`template-type.description-${text}`)}</div>
      </div>
    `;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')) : '';
  }

  private static __isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  private _setCustomizeState(ev: CustomEvent): void {
    this.__customizeTemplate = ev.detail;
  }

  private static _all_images_over_https(text: string) {
    return !!text.match(/src="http:\/\//);
  }

  private __handleActionCache(ev: CustomEvent) {
    const confirm = this.renderRoot.querySelector('#confirm-cache');
    if (confirm) {
      (confirm as InternalConfirmDialog).show(ev.currentTarget as HTMLElement);
    }
  }

  private __handleActionSubmit() {
    this.submit();
  }

  private __handleConfirmCache(evt: CustomEvent) {
    if (!evt.detail.cancelled) this.__handleCache();
  }

  private async __handleCache() {
    if (!(this.data && this.data._links && this.data._links['fx:cache'])) {
      return;
    }
    const result = await this._fetch(this.data._links['fx:cache'].href, {
      body: '',
      method: 'POST',
    });
    if (result) {
      const errorResult = result as any;
      if (errorResult['_embedded'] && errorResult['embedded']['fx:errors']) {
        this.__cacheErrors = errorResult['fx:errors'].map((i: { message: string }) => i.message);
      } else {
        this.__cacheSuccess = true;
        this.__cacheErrors = [];
        setTimeout(() => (this.__cacheSuccess = false), 3000);
      }
    }
  }
}
