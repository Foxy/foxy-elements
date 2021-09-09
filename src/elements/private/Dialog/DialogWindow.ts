import { CSSResultArray, LitElement, css } from 'lit-element';

import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';

export class DialogWindow extends ThemeableMixin(ResponsiveMixin(LitElement)) {
  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          position: relative;
          z-index: 1000;
        }
      `,
    ];
  }
}
