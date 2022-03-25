import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { Checkbox } from '../../../private/Checkbox/Checkbox';
import { CheckboxChangeEvent } from '../../../private/events';
import { ConfigurableMixin } from '../../../../mixins/configurable';
import { NucleonElement } from '../../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ThemeableMixin } from '../../../../mixins/themeable';

type Data = Resource<Rels.CouponItemCategory>;
const Base = ConfigurableMixin(ScopedElementsMixin(ThemeableMixin(NucleonElement)));

export class CategoryRestrictionsPageItemContent extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'x-checkbox': Checkbox,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      itemCategory: { type: String, attribute: 'item-category' },
      coupon: { type: String },
    };
  }

  itemCategory = '';

  coupon = '';

  render(): TemplateResult {
    return html`
      <div class="h-full flex items-center">
        <x-checkbox
          data-testid="checkbox"
          ?disabled=${!this.in('idle') || this.disabled}
          ?readonly=${this.readonly}
          ?checked=${!!this.data}
          @change=${(evt: CheckboxChangeEvent) => {
            if (evt.detail) {
              this.edit({
                item_category_uri: this.itemCategory,
                coupon_uri: this.coupon,
              });

              this.submit();
            } else {
              this.delete();
            }
          }}
        >
          <slot></slot>
        </x-checkbox>
      </div>
    `;
  }
}
