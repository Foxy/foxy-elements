import { Translatable } from '../../../../mixins/translatable';
import { QuickCheckoutProduct } from '../types';
import { html } from 'lit-element';
import { Checkbox, Section, Group, I18N } from '../../../private/index';

export class Product extends Translatable {
  public static get scopedElements() {
    return {
      'x-checkbox': Checkbox,
      'x-section': Section,
      'x-group': Group,
      'x-number-field': customElements.get('vaadin-number-field'),
      'x-i18n': I18N,
    };
  }

  public constructor() {
    super('quick-checkout');
  }

  private __default_image = {
    src: 'https://www.foxy.io/merchants/shopping-cart-full.svg',
    alt: 'A sketch of a shopping cart with three boxes',
  };

  public value: QuickCheckoutProduct | undefined;

  public render() {
    return html`
      <x-section>
        <x-group frame>
          <article class="product flex flex-row flex-wrap justify-between overflow-hidden">
            <img
              class="max-w-xs min-w-1 block"
              alt="${this.value?.alt ?? this.__default_image.alt}"
              src="${this.value?.image ?? this.__default_image.src}"
            />
            <x-section class="description flex flex-wrap flex-column p-s min-w-xl">
              <x-i18n slot="title" .ns=${this.ns} .lang=${this.lang} key="prod.title"></x-i18n>
              <x-i18n
                slot="subtitle"
                .ns=${this.ns}
                .lang=${this.lang}
                key="prod.subtitle"
              ></x-i18n>
              <x-i18n .ns=${this.ns} .lang=${this.lang} key="prod.description"></x-i18n>
            </x-section>
            <x-section class="item-info p-s min-w-2">
              <div>$ 70.00</div>
            </x-section>
            <x-section class="actions p-s min-w-3">
              <x-number-field value="1" min="0" max="10" has-controls></x-number-field>
              <x-checkbox data-testid="toggle">Remove</x-checkbox>
            </x-section>
          </article>
        </x-group>
      </x-section>
    `;
  }
}
