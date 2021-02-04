import { CSSResult, CSSResultArray, LitElement } from 'lit-element';

import { Themeable } from '../../../mixins/themeable';
import { addBreakpoints } from '../../../utils/add-breakpoints';

export class DialogWindow extends LitElement {
  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  private __removeBreakpoints?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__removeBreakpoints = addBreakpoints(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__removeBreakpoints?.();
  }
}
