import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { TOptions } from 'i18next';
import {
  CSSResultArray,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
  property,
} from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { Skeleton } from '../Skeleton/Skeleton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type I18NOptions = TOptions<any>;

export class I18N extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-skeleton': Skeleton,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      key: { type: String, reflect: true },
      opts: { type: Object },
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          display: inline-block;
        }
      `,
    ];
  }

  public key = '';

  public opts?: I18NOptions;

  public get whenReady(): Promise<unknown> {
    return this._whenI18nReady!.then(() => this.updateComplete);
  }

  public render(): TemplateResult {
    if (this._isI18nReady) {
      return html`${this._t(this.key, this.opts)}<slot></slot>`;
    } else {
      return html`<x-skeleton class="block">${this.key}<slot></slot></x-skeleton>`;
    }
  }
}
