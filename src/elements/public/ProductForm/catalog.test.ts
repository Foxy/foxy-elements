import type { ProductModifier, ProductOption } from './types';

import { expect } from '@open-wc/testing';
import {
  buildCartLink,
  defaultSkuPattern,
  exampleSku,
  isReservedName,
  mergeModifiers,
  validateModifiers,
  validateOptions,
} from './catalog';

const color: ProductOption = {
  name: 'color',
  label: 'Colour',
  values: [
    { value: 'Black', sku_code: 'BLK', color: '#1d1d1f' },
    { value: 'Natural', label: 'Natural (undyed)', sku_code: 'NAT' },
  ],
};

const size: ProductOption = {
  name: 'size',
  values: [{ value: 'M' }, { value: '2XL', price_mod: '2.00', weight_mod: 0.04 }],
};

const giftWrap: ProductModifier = {
  name: 'gift_wrap',
  label: 'Gift wrap',
  type: 'select',
  values: [
    { value: 'No', label: 'No thanks' },
    { value: 'Yes', label: 'Wrap it', price_mod: '4.50' },
  ],
};

const engraving: ProductModifier = {
  name: 'engraving',
  type: 'text',
  max_length: 20,
  price_mod: '6.00',
};

const codes = (errors: { path: string; code: string }[]) => errors.map(e => `${e.path} ${e.code}`);

describe('ProductForm catalog rules', () => {
  it('reserves the cart parameters, their prefixes and names starting with a digit', () => {
    for (const name of ['sku', 'quantity', 'sub_frequency', 'discount_tier', 'utm_source', 'h']) {
      expect(isReservedName(name), name).to.be.true;
    }
    expect(isReservedName('2nd_line')).to.be.true;
    expect(isReservedName('color')).to.be.false;
    expect(isReservedName('discount')).to.be.false;
  });

  it('accepts the contract example options', () => {
    expect(validateOptions([color, size])).to.deep.equal([]);
  });

  it('refuses a fourth option, naming the list', () => {
    const extra = (name: string) => ({ name, values: [{ value: 'A' }] });
    expect(codes(validateOptions([color, size, extra('fit'), extra('sleeve')]))).to.include(
      'options v8n_too_many'
    );
  });

  it('flags bad option names, and names shared with a modifier', () => {
    const errors = validateOptions(
      [
        { name: 'Colour', values: [{ value: 'A' }] },
        { name: 'quantity', values: [{ value: 'A' }] },
        { name: 'gift_wrap', values: [{ value: 'A' }] },
      ],
      ['gift_wrap']
    );
    expect(codes(errors)).to.deep.equal([
      'options.0.name v8n_name_invalid',
      'options.1.name v8n_name_reserved',
      'options.2.name v8n_name_used_by_modifier',
    ]);
  });

  it('flags values the API would refuse', () => {
    const errors = validateOptions([
      {
        name: 'color',
        values: [
          { value: 'Black', sku_code: 'BL-K', color: 'black' },
          { value: ' black ' },
          { value: 'Natural', image: { src: 'http://images.example.com/n.jpg' } },
          { value: 'Red', price_mod: '1.2.3' },
        ],
      },
    ]);
    expect(codes(errors)).to.deep.equal([
      'options.0.values.0.sku_code v8n_sku_code_invalid',
      'options.0.values.0.color v8n_color_invalid',
      'options.0.values.1.value v8n_value_duplicate',
      'options.0.values.2.image v8n_image_invalid',
      'options.0.values.3.price_mod v8n_amount_invalid',
    ]);
  });

  it('requires at least one value per option', () => {
    expect(codes(validateOptions([{ name: 'color', values: [] }]))).to.deep.equal([
      'options.0.values v8n_values_required',
    ]);
  });

  it('merges modifiers by name: appends, replaces in place, removes', () => {
    const recipient: ProductModifier = { name: 'recipient', type: 'text', required: true };
    const wrapOnly: ProductModifier = { ...giftWrap, values: [{ value: 'Yes' }] };
    expect(
      mergeModifiers(
        [giftWrap, engraving],
        [recipient, wrapOnly, { name: 'engraving', remove: true }]
      )
    ).to.deep.equal([wrapOnly, recipient]);
  });

  it('counts inherited modifiers toward the limit of 25', () => {
    const inherited = Array.from({ length: 24 }, (_, i) => ({
      name: `field_${i}`,
      type: 'text' as const,
    }));
    expect(validateModifiers([engraving], inherited)).to.deep.equal([]);
    expect(codes(validateModifiers([engraving, giftWrap], inherited))).to.include(
      'modifiers v8n_too_many'
    );
    // A removal makes room.
    expect(
      validateModifiers([engraving, giftWrap, { name: 'field_0', remove: true }], inherited)
    ).to.deep.equal([]);
  });

  it('flags modifier fields the API would refuse', () => {
    const errors = validateModifiers(
      [
        { name: 'size', type: 'text' },
        { name: 'note', type: 'text', max_length: 1001 },
        {
          name: 'delivery',
          type: 'select',
          values: [{ value: 'Pickup', category_code: 'X'.repeat(51) }],
        },
        { name: 'wrap', type: 'select', values: [] },
      ],
      [],
      ['size']
    );
    expect(codes(errors)).to.deep.equal([
      'modifiers.0.name v8n_name_used_by_option',
      'modifiers.1.max_length v8n_max_length_invalid',
      'modifiers.2.values.0.category_code v8n_category_code_too_long',
      'modifiers.3.values v8n_values_required',
    ]);
  });

  it('builds the default SKU pattern and an example from the first values', () => {
    const pattern = defaultSkuPattern([size, color]);
    expect(pattern).to.equal('{parent}-{size}-{color}');
    expect(exampleSku(pattern, 'TEE-ORG', [size, color])).to.equal('TEE-ORG-M-BLK');
    // A value without a SKU code falls back to the value, uppercased, other runs as "-".
    const fit = { name: 'fit', values: [{ value: 'relaxed fit' }] };
    expect(exampleSku('{parent}/{fit}', 'TEE', [fit])).to.equal('TEE/RELAXED-FIT');
  });

  it('percent-encodes every name and value in a cart link', () => {
    expect(
      buildCartLink('acme.foxycart.com', 'TEE&ORG', [
        ['color', 'Natural (undyed)'],
        ['engraving', 'J+K 4ever & 100%'],
      ])
    ).to.equal(
      'https://acme.foxycart.com/cart?sku=TEE%26ORG&color=Natural%20(undyed)&engraving=J%2BK%204ever%20%26%20100%25'
    );
  });
});
