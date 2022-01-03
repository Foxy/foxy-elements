import { CSSResultArray, PropertyDeclarations, TemplateResult, css, html } from 'lit-element';
import { Choice, Group, PropertyTable } from '../../private/index';
import { Data, Templates } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';

import { ChoiceChangeEvent } from '../../private/events';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { TextAreaElement } from '@vaadin/vaadin-text-field/vaadin-text-area';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

const NS = 'email-template-form';
const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)))
);

export class EmailTemplateForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __cacheState: { attribute: false },
      __contentChoice: { attribute: false },
    };
  }

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

  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-text-area': customElements.get('vaadin-text-area'),
      'vaadin-button': customElements.get('vaadin-button'),
      'x-property-table': PropertyTable,
      'x-choice': Choice,
      'x-group': Group,
    };
  }

  templates: Templates = {};

  private __cacheState: 'idle' | 'busy' | 'fail' = 'idle';

  private __contentChoice: 'default' | 'url' | 'clipboard' = 'default';

  render(): TemplateResult {
    const { hiddenSelector, href, lang, ns } = this;
    const action = href ? 'delete' : 'create';
    const isBusy = this.in('busy');
    const isFail = this.in('fail');

    return html`
      <div class="space-y-m">
        ${hiddenSelector.matches('description', true) ? '' : this.__renderDescription()}
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
    return html`
      <div data-testid="content">
        ${this.renderTemplateOrSlot('content:before')}

        <div class="space-y-l">
          ${this.__renderContentVariant('content_text_url', 'content_text', 'text_template')}
          ${this.__renderContentVariant('content_html_url', 'content_html', 'html_template')}
        </div>

        ${this.renderTemplateOrSlot('content:after')}
      </div>
    `;
  }

  private __renderContentVariant(
    urlPath: 'content_text_url' | 'content_html_url',
    textPath: 'content_text' | 'content_html',
    header: string
  ) {
    const isDisabled = !this.in('idle') || this.disabledSelector.matches('content', true);
    const isReadonly = this.readonlySelector.matches('content', true);
    const contentChoice = this.form[urlPath]
      ? 'url'
      : this.form[textPath]
      ? 'clipboard'
      : this.__contentChoice;

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
              this.__contentChoice = evt.detail as 'url' | 'clipboard' | 'default';
            }
          }}
        >
          ${['default', 'url', 'clipboard'].map(value => {
            return html`
              <div slot="${value}-label" class="py-s leading-s">
                <foxy-i18n class="block" lang=${this.lang} key="template_${value}" ns=${this.ns}>
                </foxy-i18n>

                <foxy-i18n
                  class="block text-s opacity-70"
                  lang=${this.lang}
                  key="template_${value}_explainer"
                  ns=${this.ns}
                >
                </foxy-i18n>
              </div>
            `;
          })}

          <div slot="url" ?hidden=${contentChoice !== 'url'}>
            <div class="flex items-center mt-0 mb-m">
              <vaadin-text-field
                data-testid="${textPath.replace('_', '-')}-url"
                value=${ifDefined(this.form[urlPath])}
                class="mr-s flex-grow"
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
                class="relative"
                ?disabled=${isDisabled || this.__cacheState === 'busy'}
                ?hidden=${isReadonly || this.form[urlPath] !== this.data?.[urlPath]}
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
          </div>

          <div slot="clipboard" ?hidden=${contentChoice !== 'clipboard'}>
            <vaadin-text-area
              data-testid="${textPath.replace('_', '-')}-clipboard"
              id="cached-content"
              class="w-full mb-m"
              ?readonly=${isReadonly}
              ?disabled=${isDisabled}
              .value=${this.form[textPath]}
              @input=${(evt: CustomEvent) => {
                const value = (evt.currentTarget as TextAreaElement).value;
                this.edit({ [textPath]: value, [urlPath]: '' });
              }}
            >
            </vaadin-text-area>
          </div>
        </x-choice>
      </x-group>
    `;
  }

  private __renderTimestamps() {
    const scope = 'timestamps';

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <x-property-table
          data-testid="timestamps"
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: this.t(field),
            value: this.data?.[field]
              ? this.t('date', { value: new Date(this.data[field] as string) })
              : '',
          }))}
        >
        </x-property-table>

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
  }

  private async __cache(): Promise<void> {
    this.__cacheState = 'busy';

    try {
      const url = this.data?._links['fx:cache'].href ?? '';
      const response = await new EmailTemplateForm.API(this).fetch(url, { method: 'POST' });

      this.__cacheState = response.ok ? 'idle' : 'fail';
    } catch {
      this.__cacheState = 'fail';
    }
  }
}
