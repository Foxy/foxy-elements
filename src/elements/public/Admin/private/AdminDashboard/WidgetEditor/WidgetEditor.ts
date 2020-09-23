import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field';
import { css, CSSResultArray, PropertyDeclarations } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { debounce } from 'lodash-es';
import { interpret } from 'xstate';
import { RequestEvent } from '../../../../../../events/request';
import { Translatable } from '../../../../../../mixins/translatable';
import { Dialog } from '../../../../../private/Dialog/Dialog';
import { ChoiceChangeEvent } from '../../../../../private/events';
import { Choice, Group, I18N } from '../../../../../private/index';
import { Widget } from '../Widget/Widget';
import { Preset } from './defaults';
import { machine, WidgetEditorJSONEvent } from './machine';
import { WidgetEditorCloseEvent } from './WidgetEditorCloseEvent';
import { WidgetEditorSubmitEvent } from './WidgetEditorSubmitEvent';

const DEBOUNCE_WAIT = 275;

export interface WidgetEditorInit {
  preset: Preset;
  index: number;
}

export class WidgetEditor extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-button': customElements.get('vaadin-button'),
      'iron-icon': customElements.get('iron-icon'),
      'x-choice': Choice,
      'x-dialog': Dialog,
      'x-widget': Widget,
      'x-group': Group,
      'x-i18n': I18N,
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          position: absolute;
          pointer-events: none;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
      `,
    ];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      store: { type: String, noAccessor: true },
    };
  }

  private readonly __service = interpret(
    machine.withConfig({
      services: {
        load: () => this.__load(),
      },
      actions: {
        showSource: () => this.__showSource(),
        hideSource: () => this.__hideSource(),
        submit: () => this.__submit(),
      },
    })
  );

  private readonly __handleLabelInput: () => void = debounce(
    () => this.__service.send({ type: 'SET_LABEL', data: this.__label.value }),
    DEBOUNCE_WAIT
  );

  private readonly __handleJsonataInput: () => void = debounce(
    () => this.__service.send({ type: 'SET_JSONATA', data: this.__jsonata.value }),
    DEBOUNCE_WAIT
  );

  private readonly __handleSourceInput: () => void = debounce(
    () => this.__service.send({ type: 'SET_HREF', data: this.__source.value }),
    DEBOUNCE_WAIT
  );

  public get store(): string {
    return this.__service.state?.context.store ?? '';
  }

  public set store(value: string) {
    if (value !== this.store) this.__service.send({ type: 'SET_STORE', data: value });
  }

  public async open(params?: WidgetEditorInit): Promise<void> {
    this.__service.send({ type: 'RESET', data: params });
    await this.requestUpdate();
    return this.__dialog.open();
  }

  public close(): Promise<void> {
    return this.__dialog.close();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (!this.__service.initialized) this.__initializeService();
  }

  public render(): TemplateResult {
    const scope = 'dashboard.widgets';
    const state = this.__service.state;
    const context = state.context;

    const codeIcon = state.matches('idle')
      ? context.resourceError
        ? 'error-outline'
        : 'code'
      : 'schedule';

    return html`
      <x-dialog
        id="dialog"
        size="medium"
        lang=${this.lang}
        @close=${() => this.dispatchEvent(new WidgetEditorCloseEvent())}
      >
        <x-i18n
          ns=${this.ns}
          key="${scope}.${context.index === null ? 'add' : 'edit'}"
          lang=${this.lang}
          slot="header"
        >
        </x-i18n>

        <article class="pointer-events-auto font-lumo p-m space-y-m md:space-y-xl md:p-xl">
          <section class="p-xl rounded-t-l rounded-b-l bg-contrast-5">
            <x-widget
              class="my-l rounded-t-l rounded-b-l shadow-xl md:my-0"
              style="transform: rotate(-2deg)"
              query=${context.jsonata}
              href=${this.__sourceHref}
            >
              <x-i18n
                ns=${this.ns}
                lang=${this.lang}
                key=${context.label || `${scope}.label_empty`}
              >
              </x-i18n>
            </x-widget>
          </section>

          <section class="-mx-m rounded-t-l rounded-b-l md:mx-0 md:border md:border-contrast-10">
            <x-choice
              value=${context.preset}
              .items=${[...context.presets.map(v => v.label), 'custom']}
              @change=${this.__handleChoiceChange}
            >
              <x-i18n ns=${this.ns} lang=${this.lang} key="${scope}.custom" slot="custom-label">
              </x-i18n>

              ${context.presets.map(
                ({ label }) => html`
                  <x-i18n ns=${this.ns} lang=${this.lang} key=${label} slot="${label}-label">
                  </x-i18n>
                `
              )}

              <div
                class="space-y-m py-s ${context.preset === 'custom' ? '' : 'sr-only'}"
                slot="custom"
              >
                <div class="space-y-xs">
                  <div class="flex items-end space-x-s">
                    <vaadin-text-field
                      id="source"
                      class="flex-1"
                      value=${context.source}
                      label=${this._t(`${scope}.source`).toString()}
                      placeholder="subscriptions?is_active=1"
                      errorMessage=${this._t(`${scope}.source_error`).toString()}
                      .invalid=${!!context.resourceError}
                      @keydown=${this.__stopNavigation}
                      @change=${(evt: Event) => evt.stopPropagation()}
                      @input=${this.__handleSourceInput}
                    >
                    </vaadin-text-field>

                    <vaadin-button
                      theme="icon ${context.resourceError ? 'error' : ''}"
                      class="flex-shrink-0"
                      title=${this._t(`${scope}.source_show`).toString()}
                      ?disabled=${!state.matches('idle')}
                      @click=${() => this.__service.send('SHOW_SOURCE')}
                    >
                      <iron-icon icon="icons:${codeIcon}"></iron-icon>
                    </vaadin-button>
                  </div>

                  <p class="text-xs leading-s text-tertiary">
                    <x-i18n ns=${this.ns} lang=${this.lang} key="${scope}.source_hint"> </x-i18n>

                    <a
                      rel="nofollow noreferrer noopener"
                      href="https://api.foxycart.com/"
                      class="inline-block -mx-xs px-xs text-primary font-medium rounded hover:underline focus:outline-none focus:shadow-outline"
                      target="_blank"
                      router-ignore
                    >
                      <x-i18n ns=${this.ns} lang=${this.lang} key="${scope}.source_link"> </x-i18n>
                      <iron-icon icon="icons:open-in-new" class="icon-inline"></iron-icon>
                    </a>
                  </p>
                </div>

                <div class="space-y-xs">
                  <vaadin-text-field
                    id="jsonata"
                    class="w-full"
                    value=${context.jsonata}
                    label=${this._t(`${scope}.jsonata`).toString()}
                    placeholder="total_items"
                    .errorMessage=${context.jsonataError}
                    .invalid=${!!context.jsonataError}
                    @keydown=${this.__stopNavigation}
                    @change=${(evt: Event) => evt.stopPropagation()}
                    @input=${this.__handleJsonataInput}
                  >
                  </vaadin-text-field>

                  <p class="text-xs leading-s text-tertiary">
                    <x-i18n ns=${this.ns} key="${scope}.jsonata_hint" lang=${this.lang}> </x-i18n>

                    <a
                      rel="nofollow noreferrer noopener"
                      href="https://jsonata.org/"
                      class="inline-block -mx-xs px-xs text-primary font-medium rounded hover:underline focus:outline-none focus:shadow-outline"
                      target="_blank"
                      router-ignore
                    >
                      <x-i18n ns=${this.ns} lang=${this.lang} key="${scope}.jsonata_link"> </x-i18n>
                      <iron-icon icon="icons:open-in-new" class="icon-inline"></iron-icon>
                    </a>
                  </p>
                </div>

                <vaadin-text-field
                  id="label"
                  class="w-full"
                  label=${this._t(`${scope}.label`).toString()}
                  value=${this.__preset ? this._t(context.label).toString() : context.label}
                  placeholder=${this._t(`${scope}.label_placeholder`).toString()}
                  @keydown=${this.__stopNavigation}
                  @change=${(evt: Event) => evt.stopPropagation()}
                  @input=${this.__handleLabelInput}
                >
                </vaadin-text-field>
              </div>
            </x-choice>
          </section>

          <vaadin-button
            class="w-full"
            theme="large primary"
            ?disabled=${!state.matches('idle.content.complete')}
            @click=${() => this.__service.send('SUBMIT')}
          >
            <x-i18n ns=${this.ns} lang=${this.lang} key="${scope}.add"></x-i18n>
          </vaadin-button>
        </article>
      </x-dialog>

      <x-dialog id="code" lang=${this.lang} @close=${() => this.__service.send('HIDE_SOURCE')}>
        <x-i18n ns=${this.ns} lang=${this.lang} key="${scope}.source" slot="header"> </x-i18n>
        <code class="block overflow-auto leading-s text-body text-xs p-m">
          <pre>${JSON.stringify(context.resourceError ?? context.resource, null, 2)}</pre>
        </code>
      </x-dialog>
    `;
  }

  private get __sourceHref() {
    return `${this.store}/${this.__service.state.context.source}`;
  }

  private get __preset() {
    return this.__service.state.context.presets.find(
      ({ label }) => label === this.__service.state.context.label
    );
  }

  private get __jsonata(): HTMLInputElement {
    return this.shadowRoot!.querySelector('#jsonata')! as HTMLInputElement;
  }

  private get __dialog(): Dialog {
    return this.shadowRoot!.querySelector('#dialog')! as Dialog;
  }

  private get __source(): HTMLInputElement {
    return this.shadowRoot!.querySelector('#source')! as HTMLInputElement;
  }

  private get __label(): HTMLInputElement {
    return this.shadowRoot!.querySelector('#label')! as HTMLInputElement;
  }

  private get __code(): Dialog | null {
    return this.shadowRoot!.querySelector('#code')! as Dialog;
  }

  private async __load(): Promise<WidgetEditorJSONEvent['data']> {
    try {
      const response = await RequestEvent.emit({
        init: [this.__sourceHref],
        source: this,
      });

      if (response.ok) return response.json();
      throw await response.json();
    } catch (err) {
      if (err instanceof Error) throw err.message;
      throw err;
    }
  }

  private __stopNavigation(evt: KeyboardEvent) {
    if (evt.key.startsWith('Arrow')) evt.stopPropagation();
  }

  private __initializeService() {
    this.__service
      .onChange(() => this.requestUpdate())
      .onTransition(({ changed }) => changed && this.requestUpdate())
      .start();
  }

  private __handleChoiceChange(evt: ChoiceChangeEvent) {
    this.__service.send({ type: 'SET_PRESET', data: evt.detail });
  }

  private __showSource() {
    this.__code?.open();
  }

  private __hideSource() {
    this.__code?.close();
  }

  private __submit() {
    this.dispatchEvent(
      new WidgetEditorSubmitEvent({
        index: this.__service.state.context.index,
        preset: {
          jsonata: this.__service.state.context.jsonata,
          source: this.__service.state.context.source,
          label: this._t(this.__service.state.context.label).toString(),
        },
      })
    );

    this.__dialog.close(true);
  }
}
