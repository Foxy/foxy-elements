import { ScopedElementsMap } from '@open-wc/scoped-elements';
import jsonata from 'jsonata';
import { css, CSSResultArray, PropertyDeclarations } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { interpret } from 'xstate';
import { RequestEvent, UnhandledRequestError } from '../../../../../../events/request';
import { Translatable } from '../../../../../../mixins/translatable';
import { Skeleton } from '../../../../../private/index';
import { FriendlyError } from '../../../../../private/ErrorScreen/ErrorScreen';
import { machine, WidgetLoadSuccessEvent } from './machine';

export class Widget extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .top-left-m {
          top: 0;
          left: 0;
          margin-top: calc(0px - (var(--lumo-size-s) / 3));
          margin-left: calc(0px - (var(--lumo-size-s) / 4));
        }

        .bottom-right-m {
          right: 0;
          bottom: 0;
          margin-right: calc(0px - (var(--lumo-size-s) / 4));
          margin-bottom: calc(0px - (var(--lumo-size-s) / 3));
        }
      `,
    ];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      query: { type: String },
      href: { type: String },
    };
  }

  public query = '';

  public href = '';

  private __machine = machine.withConfig({
    services: { load: () => this.__load() },
  });

  private __service = interpret(this.__machine);

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
    const error = this.__service.state.matches('error');
    const loading = this.__service.state.matches('loading');
    const variant = error ? 'error' : null;
    const border = error ? 'border-error' : 'border-contrast-10';

    return html`
      <figure
        class="px-s py-xs bg-base leading-m rounded-t-l rounded-b-l transition duration-200 border ${border}"
      >
        <p class="text-xl font-medium text-body">
          ${loading || error
            ? html`<x-skeleton class="w-full" .variant=${variant}>&nbsp;</x-skeleton>`
            : html`${this.__display}&nbsp;`}
        </p>

        <figcaption class="text-s text-secondary truncate">
          ${loading || error
            ? html`<x-skeleton class="w-full" .variant=${variant}>&nbsp;</x-skeleton>`
            : html`<slot></slot>&nbsp;`}
        </figcaption>
      </figure>
    `;
  }

  public updated(changedProperties: Map<keyof Widget, unknown>): void {
    if (changedProperties.get('href')) this.__service.send('RESET');
  }

  private get __display() {
    try {
      return jsonata(this.query).evaluate(this.__service.state.context.resource);
    } catch (err) {
      this.__service.send('ERROR');
      return '';
    }
  }

  private async __load(): Promise<WidgetLoadSuccessEvent['data']> {
    try {
      const response = await RequestEvent.emit({
        source: this,
        init: [this.href],
      });

      if (response.ok) {
        return response.json();
      } else {
        const type = response.status === 401 ? 'unauthorized' : 'unknown';
        throw new FriendlyError(type);
      }
    } catch (err) {
      if (err instanceof FriendlyError) throw err;
      if (err instanceof UnhandledRequestError) throw new FriendlyError('setup_needed');
      throw new FriendlyError('unknown');
    }
  }
}
