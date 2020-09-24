import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@vaadin/vaadin-button';
import { html, TemplateResult } from 'lit-html';
import { escape } from 'lodash-es';
import SortableJS from 'sortablejs/modular/sortable.core.esm.js';
import { interpret } from 'xstate';
import { RequestEvent, UnhandledRequestError } from '../../../../../events/request';
import { Translatable } from '../../../../../mixins/translatable';
import { FriendlyError } from '../../../../private/ErrorScreen/ErrorScreen';
import { Editable, I18N, Page } from '../../../../private/index';
import { LoadingScreen } from '../../../../private/LoadingScreen/LoadingScreen';
import { FxBookmark } from '../../types';

import {
  AdminDashboardLoadSuccessEvent,
  AdminDashboardOpenEvent,
  machine,
  WIDGETS_ATTRIBUTE,
  WIDGETS_TOTAL_ATTRIBUTE,
} from './machine';

import { Widget } from './Widget/Widget';
import { WidgetEditor } from './WidgetEditor/WidgetEditor';
import { WidgetEditorSubmitEvent } from './WidgetEditor/WidgetEditorSubmitEvent';

export class AdminDashboard extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-loading-screen': LoadingScreen,
      'x-widget-editor': WidgetEditor,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-editable': Editable,
      'iron-icon': customElements.get('iron-icon'),
      'x-widget': Widget,
      'x-page': Page,
      'x-i18n': I18N,
    };
  }

  private __machine = machine.withConfig({
    services: {
      load: () => this.__load(),
      save: () => this.__save(),
    },
    actions: {
      openEditor: (_, evt) => this.__widgetEditor.open((evt as AdminDashboardOpenEvent).data),
    },
  });

  private __service = interpret(this.__machine);

  private __sortable: SortableJS | null = null;

  public constructor() {
    super('admin');
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (!this.__service.initialized) {
      this.__service
        .onChange(() => this.requestUpdate())
        .onTransition(({ changed }) => changed && this.requestUpdate())
        .start();
    }
  }

  public render(): TemplateResult {
    const editable = this.__service.state.matches('idle.editable');
    const loading = ['loading', 'saving'].some(v => this.__service.state.matches(v));
    const idle = this.__service.state.matches('idle');
    const ctx = this.__service.state.context;

    return html`
      <x-page class="relative font-lumo">
        <h1 slot="title">${this.__service.state.context.store?.store_name ?? ''}</h1>

        <section class="space-y-m">
          <div class="flex items-center justify-between space-x-m">
            <h2 class="text-xl font-semibold text-header">Overview</h2>
            <vaadin-button
              theme="tertiary-inline"
              @click=${() => this.__service.send(editable ? 'SAVE' : 'EDIT')}
            >
              <x-i18n key=${editable ? 'save' : 'edit'} lang=${this.lang}></x-i18n>
            </vaadin-button>
          </div>

          <div id="widgets" class="grid gap-m grid-rows-auto sm:grid-cols-2 lg:grid-cols-3">
            ${idle
              ? this.__service.state.context.widgets.map(
                  (preset, index) => html`
                    <x-editable
                      ?editable=${editable}
                      @delete=${() => this.__service.send({ type: 'REMOVE', data: index })}
                    >
                      <x-widget
                        ns=${this.ns}
                        lang=${this.lang}
                        href="${ctx.store!._links.self.href}/${preset.source}"
                        query=${preset.jsonata}
                        class="drag-handle"
                        @click=${() => {
                          this.__service.send({
                            type: 'OPEN',
                            data: { index, preset },
                          });
                        }}
                      >
                        <x-i18n ns=${this.ns} lang=${this.lang} key=${preset.label}></x-i18n>
                      </x-widget>
                    </x-editable>
                  `
                )
              : ''}
            ${editable
              ? html`
                  <vaadin-button
                    class="h-full rounded-t-l rounded-b-l drag-boundary"
                    @click=${() => this.__service.send('OPEN')}
                  >
                    <x-i18n ns=${this.ns} lang=${this.lang} key="dashboard.widgets.add"></x-i18n>
                    <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
                  </vaadin-button>
                `
              : ''}
          </div>
        </section>
      </x-page>

      <x-widget-editor
        id="widget-editor"
        ns=${this.ns}
        lang=${this.lang}
        store=${this.__service.state.context.store?._links.self.href ?? ''}
        @submit=${(evt: WidgetEditorSubmitEvent) => {
          this.__service.send({ type: 'UPSERT', data: evt.detail });
        }}
      >
      </x-widget-editor>

      ${loading ? html`<x-loading-screen></x-loading-screen>` : ''}
    `;
  }

  public updated(): void {
    this.__sortable?.destroy();
    this.__sortable = null;

    if (this.__service.state.matches('idle.editable') && this.__widgets) {
      this.__sortable = new SortableJS(this.__widgets, {
        ghostClass: 'opacity-0',
        animation: 200,
        handle: '.drag-handle',
        onMove: evt => !evt.related.classList.contains('drag-boundary'),
        onEnd: evt => {
          // undo DOM changes so that lit-html renderer doesn't get confused
          const parent = evt.item.parentElement!;
          parent.insertBefore(evt.item, parent.children[evt.oldIndex! + 1]);

          // trigger a proper re-render
          this.__service.send({ type: 'SWAP', data: evt });
        },
      });
    }
  }

  private get __widgets(): HTMLElement | null {
    return this.shadowRoot!.querySelector('#widgets');
  }

  private get __widgetEditor(): WidgetEditor {
    return this.shadowRoot!.querySelector('#widget-editor') as WidgetEditor;
  }

  private async __load(): Promise<AdminDashboardLoadSuccessEvent['data']> {
    try {
      const bookmarkResponse = await RequestEvent.emit({ source: this, init: ['/'] });
      if (!bookmarkResponse.ok) throw new FriendlyError('unknown');
      const bookmark = (await bookmarkResponse.json()) as FxBookmark;

      const storeHref = bookmark._links['fx:store'].href;
      const storeResponse = await RequestEvent.emit({ source: this, init: [storeHref] });
      if (!storeResponse.ok) throw new FriendlyError('unknown');
      const store = await storeResponse.json();

      return { bookmark, store };
    } catch (err) {
      if (err instanceof FriendlyError) throw err;
      if (err instanceof UnhandledRequestError) throw new FriendlyError('setup_needed');
      throw new FriendlyError('unknown');
    }
  }

  private async __save() {
    try {
      const configNames = [WIDGETS_ATTRIBUTE, WIDGETS_TOTAL_ATTRIBUTE];
      const { store, widgets } = this.__service.state.context;

      const otherAttributes =
        store?._embedded?.['fx:attributes'].filter(({ name }) => !configNames.includes(name)) ?? [];

      const newWidgets = widgets.map(preset => ({
        name: WIDGETS_ATTRIBUTE,
        value: escape(JSON.stringify(preset)),
        visibility: 'restricted',
      }));

      const response = await RequestEvent.emit({
        source: this,
        init: [
          this.__service.state.context.store!._links['fx:attributes'].href,
          {
            method: 'PUT',
            body: JSON.stringify([
              ...otherAttributes,
              ...newWidgets,
              {
                name: WIDGETS_TOTAL_ATTRIBUTE,
                value: String(newWidgets.length),
                visibility: 'restricted',
              },
            ]),
          },
        ],
      });

      if (!response.ok) throw new FriendlyError('unknown');
    } catch (err) {
      if (err instanceof FriendlyError) throw err;
      if (err instanceof UnhandledRequestError) throw new FriendlyError('setup_needed');
      throw new FriendlyError('unknown');
    }
  }
}
