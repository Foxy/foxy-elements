import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import type { ScopedElementsMap } from '@open-wc/scoped-elements';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';
import type { Data, Templates } from './types';

import { Choice, Group, Metadata } from '../../private/index';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { ChoiceChangeEvent } from '../../private/events';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-element';

const NS = 'email-template-form';
const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)))
);

/**
 * Form element for creating or editing email templates (`fx:email_template`).
 *
 * @slot description:before
 * @slot description:after
 *
 * @slot template-language:before
 * @slot template-language:after
 *
 * @slot content:before
 * @slot content:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @element foxy-email-template-form
 * @since 1.14.0
 */
export class EmailTemplateForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __cacheState: { attribute: false },
      __contentChoice: { attribute: false },
    };
  }

  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-select-control': customElements.get('foxy-internal-select-control'),
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-source-control': customElements.get('foxy-internal-source-control'),
      'foxy-internal-text-control': customElements.get('foxy-internal-text-control'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-button': customElements.get('vaadin-button'),
      'x-metadata': Metadata,
      'x-choice': Choice,
      'x-group': Group,
    };
  }

  templates: Templates = {};

  private __templateLanguageOptions = [
    { label: 'Nunjucks', value: 'nunjucks' },
    { label: 'Handlebars', value: 'handlebars' },
    { label: 'Pug', value: 'pug' },
    { label: 'Twig', value: 'twig' },
    { label: 'EJS', value: 'ejs' },
  ];

  private __textContentChoice: 'default' | 'url' | 'clipboard' = 'default';

  private __htmlContentChoice: 'default' | 'url' | 'clipboard' = 'default';

  private __cacheState: 'idle' | 'busy' | 'fail' = 'idle';

  render(): TemplateResult {
    const { hiddenSelector, href, lang, ns } = this;
    const action = href ? 'delete' : 'create';
    const isBusy = this.in('busy');
    const isFail = this.in('fail');

    return html`
      <div class="space-y-m">
        ${hiddenSelector.matches('description', true) ? '' : this.__renderDescription()}

        <foxy-internal-text-control infer="subject"></foxy-internal-text-control>

        ${this.data?.description === 'Email Receipt Template'
          ? ''
          : html`
              <foxy-internal-select-control
                infer="template-language"
                .options=${this.__templateLanguageOptions}
              >
              </foxy-internal-select-control>
            `}

        <!-- -->

        ${hiddenSelector.matches('content', true) ? '' : this.__renderContent()}
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
            ns="${ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  protected async _sendPost(edits: Partial<Data>): Promise<Data> {
    const data = await super._sendPost(edits);
    if (!data.content_html_url && !data.content_text_url) return data;

    this.__cacheState = 'busy';
    const url = data._links['fx:cache'].href;
    const response = await new EmailTemplateForm.API(this).fetch(url, { method: 'POST' });
    this.__cacheState = response.ok ? 'idle' : 'fail';

    return await this._fetch(data._links.self.href);
  }

  protected async _sendPatch(edits: Partial<Data>): Promise<Data> {
    const data = await super._sendPatch(edits);
    if (!data.content_html_url && !data.content_text_url) return data;

    this.__cacheState = 'busy';
    const url = data._links['fx:cache'].href;
    const response = await new EmailTemplateForm.API(this).fetch(url, { method: 'POST' });
    this.__cacheState = response.ok ? 'idle' : 'fail';

    return await this._fetch(data._links.self.href);
  }

  private __renderDescription() {
    const scope = 'description';

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <vaadin-text-field
          data-testid=${scope}
          class="w-full mb-s"
          label=${this.t(scope)}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches(scope)}
          ?readonly=${this.readonlySelector.matches(scope)}
          .value=${this.form?.description ?? ''}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @input=${(evt: CustomEvent) => {
            this.edit({ description: (evt.currentTarget as TextFieldElement).value });
          }}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  }

  private __renderContent() {
    const variants = ['text', 'html'] as const;
    return html`
      <div data-testid="content">
        <div class="space-y-l">${variants.map(v => this.__renderContentVariant(v))}</div>
      </div>
    `;
  }

  private __renderContentVariant(variant: 'text' | 'html') {
    const urlPath = variant === 'text' ? 'content_text_url' : 'content_html_url';
    const textPath = variant === 'text' ? 'content_text' : 'content_html';
    const header = variant === 'text' ? 'text_template' : 'html_template';
    const urlValue = this.form[urlPath];
    const textValue = this.form[textPath];
    const contentChoiceKey = variant === 'text' ? '__textContentChoice' : '__htmlContentChoice';
    const contentChoice = urlValue ? 'url' : textValue ? 'clipboard' : this[contentChoiceKey];

    const isDisabled = !this.in('idle') || this.disabledSelector.matches('content', true);
    const isReadonly = this.readonlySelector.matches('content', true);
    const isSyncProhibited = isReadonly || !this.data?.[urlPath] || urlValue !== this.data[urlPath];

    return html`
      <x-group frame>
        <foxy-i18n
          class=${classMap({ 'transition-colors': true, 'text-disabled': isDisabled })}
          lang=${this.lang}
          slot="header"
          key=${header}
          ns=${this.ns}
        >
        </foxy-i18n>

        <x-choice
          data-testid="${textPath.replace('_', '-')}-type"
          .value=${contentChoice}
          .items=${['default', 'url', 'clipboard']}
          ?readonly=${isReadonly}
          ?disabled=${isDisabled}
          @change=${(evt: Event) => {
            if (evt instanceof ChoiceChangeEvent) {
              this.edit({ [textPath]: '', [urlPath]: '' });
              this[contentChoiceKey] = evt.detail as 'url' | 'clipboard' | 'default';
            }
          }}
        >
          ${['default', 'url', 'clipboard'].map(value => {
            return html`
              <div slot="${value}-label" class="py-s leading-s">
                <foxy-i18n class="block" lang=${this.lang} key="template_${value}" ns=${this.ns}>
                </foxy-i18n>
              </div>
            `;
          })}

          <div
            style="--lumo-border-radius: var(--lumo-border-radius-s)"
            class="mb-m"
            slot="url"
            ?hidden=${contentChoice !== 'url'}
          >
            <div class="flex items-end mt-0">
              <vaadin-text-field
                data-testid="${textPath.replace('_', '-')}-url"
                placeholder="https://example.com/my-template"
                label=${this.t('url')}
                class="flex-1 min-w-0"
                value=${ifDefined(this.form[urlPath])}
                ?readonly=${isReadonly}
                ?disabled=${isDisabled}
                @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
                @input=${(evt: CustomEvent) => {
                  const value = (evt.currentTarget as TextFieldElement).value;
                  this.edit({ [textPath]: '', [urlPath]: value });
                }}
              >
              </vaadin-text-field>

              <vaadin-button
                data-testid="${textPath.replace('_', '-')}-cache"
                class="relative flex-shrink-0 ml-s"
                ?disabled=${isDisabled || this.__cacheState === 'busy'}
                ?hidden=${isSyncProhibited}
                @click=${this.__cache}
              >
                <foxy-i18n
                  class=${classMap({
                    'relative transition-opacity': true,
                    'opacity-0': this.__cacheState !== 'idle',
                  })}
                  lang=${this.lang}
                  key="cache"
                  ns=${this.ns}
                >
                </foxy-i18n>

                <div
                  class=${classMap({
                    'absolute inset-0 flex transition-opacity': true,
                    'opacity-0': this.__cacheState === 'idle',
                  })}
                >
                  <foxy-spinner
                    layout="no-label"
                    class="m-auto"
                    state=${this.__cacheState === 'fail' ? 'error' : 'busy'}
                    lang=${this.lang}
                    ns=${this.ns}
                  >
                  </foxy-spinner>
                </div>
              </vaadin-button>
            </div>

            <foxy-internal-source-control
              placeholder=${this.t('url_source_placeholder')}
              helper-text=""
              property=${textPath}
              label=${this.t('url_source_label')}
              infer="content"
              class="mt-m${this.data?.[textPath] ? '' : ' hidden'}"
              style="--lumo-border-radius: var(--lumo-border-radius-s)"
            >
            </foxy-internal-source-control>
          </div>

          <foxy-internal-source-control
            placeholder=${this.t('clipboard_source_placeholder')}
            helper-text=""
            property=${textPath}
            label=${this.t('clipboard_source_label')}
            infer="content"
            class="mb-m${contentChoice === 'clipboard' ? '' : ' hidden'}"
            style="--lumo-border-radius: var(--lumo-border-radius-s)"
            slot="clipboard"
          >
          </foxy-internal-source-control>
        </x-choice>
      </x-group>
    `;
  }

  private __renderTimestamps() {
    const scope = 'timestamps';

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <x-metadata
          data-testid="timestamps"
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: this.t(field),
            value: this.data?.[field]
              ? this.t('date', { value: new Date(this.data[field] as string) })
              : '',
          }))}
        >
        </x-metadata>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  }

  private __renderAction(action: string) {
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

        <vaadin-button
          class="w-full"
          theme=${this.in('idle') ? (href ? 'error' : 'primary success') : ''}
          data-testid=${action}
          ?disabled=${(this.in({ idle: 'template' }) && !isValid) || isDisabled}
          @click=${handleClick}
        >
          <foxy-i18n ns=${ns} key=${action} lang=${lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot(`${action}:after`)}
      </div>
    `;
  }

  private async __cache(): Promise<void> {
    this.__cacheState = 'busy';

    try {
      const url = this.data?._links['fx:cache'].href ?? '';
      const response = await new EmailTemplateForm.API(this).fetch(url, { method: 'POST' });
      this.__cacheState = response.ok ? 'idle' : 'fail';
      this.refresh();
    } catch {
      this.__cacheState = 'fail';
    }
  }
}
