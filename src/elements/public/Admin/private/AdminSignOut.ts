import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { css, CSSResultArray } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { RequestEvent } from '../../../../events/request';
import { Themeable } from '../../../../mixins/themeable';
import { FriendlyError } from '../../../private/index';
import { LoadingScreen } from '../../../private/LoadingScreen/LoadingScreen';

export class AdminSignOut extends Themeable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-loading-screen': LoadingScreen,
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
      `,
    ];
  }

  public async firstUpdated(): Promise<void> {
    try {
      const response = await RequestEvent.emit({
        source: this,
        init: ['foxy://sign-out', { method: 'POST' }],
      });

      if (response.status !== 200) throw new FriendlyError('unknown');
    } catch (err) {
      throw new FriendlyError('unknown');
    }
  }

  public render(): TemplateResult {
    return html`<x-loading-screen class="absolute inset-0"></x-loading-screen>`;
  }
}
