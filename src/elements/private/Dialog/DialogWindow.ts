import type { CSSResultArray, PropertyDeclarations } from 'lit-element';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { LitElement, css } from 'lit-element';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';

export class DialogWindow extends ConfigurableMixin(
  ThemeableMixin(ResponsiveMixin(TranslatableMixin(InferrableMixin(LitElement))))
) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      group: {},
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          position: relative;
          z-index: 200;
        }
      `,
    ];
  }

  /** NucleonElement's Rumour sync group. */
  group = '';
}
