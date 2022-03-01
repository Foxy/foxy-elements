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
import { TranslatableMixin } from '../../../../mixins/translatable';

type Data = Resource<Rels.GiftCardItemCategory>;
const Base = ConfigurableMixin(
  ScopedElementsMixin(ThemeableMixin(TranslatableMixin(NucleonElement)))
);

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
      giftCard: { type: String, attribute: 'gift-card' },
    };
  }

  itemCategory = '';

  giftCard = '';

  render(): TemplateResult {
    return html`
      <div class="h-full flex items-center">
        <x-checkbox
          ?disabled=${!this.in('idle') || this.disabled}
          ?readonly=${this.readonly}
          ?checked=${!!this.data}
          @change=${(evt: CheckboxChangeEvent) => {
            if (evt.detail) {
              this.edit({
                item_category_uri: this.itemCategory,
                gift_card_uri: this.giftCard,
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
