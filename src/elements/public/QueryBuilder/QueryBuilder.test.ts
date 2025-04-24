import './index';

import { expect, fixture, oneEvent } from '@open-wc/testing';
import { LitElement, html } from 'lit-element';
import { Operator, Type } from './types';
import { serializeDate } from '../../../utils/serialize-date';
import { QueryBuilder } from './QueryBuilder';
import { parseDate } from '../../../utils/parse-date';

describe('QueryBuilder', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  const inputToAPIDate = (date: string, endOfDay = false) => {
    const d = parseDate(date);
    endOfDay ? d?.setHours(23, 59, 59, 999) : d?.setHours(0, 0, 0, 0);
    return encodeURIComponent(d?.toISOString() ?? '');
  };

  it('extends LitElement', () => {
    expect(new QueryBuilder()).to.be.instanceOf(LitElement);
  });

  it('registers as foxy-query-builder', () => {
    expect(customElements.get('foxy-query-builder')).to.equal(QueryBuilder);
  });

  it('has a default i18next namespace of "query-builder"', () => {
    expect(new QueryBuilder()).to.have.property('ns', 'query-builder');
  });

  it('has a reactive property "reservedPaths"', () => {
    expect(QueryBuilder).to.have.deep.nested.property('properties.reservedPaths', {
      attribute: 'reserved-paths',
      type: Array,
    });

    expect(new QueryBuilder()).to.have.deep.property('reservedPaths', [
      'zoom',
      'limit',
      'offset',
      'order',
      'fields',
    ]);
  });

  it('has a reactive property "operators"', () => {
    expect(QueryBuilder).to.have.deep.nested.property('properties.operators', { type: Array });
    expect(new QueryBuilder()).to.have.deep.property(
      'operators',
      Object.values(QueryBuilder.Operator)
    );
  });

  it('has a reactive property "disableZoom"', () => {
    expect(new QueryBuilder()).to.have.property('disableZoom', false);
    expect(QueryBuilder).to.have.deep.nested.property('properties.disableZoom', {
      type: Boolean,
      attribute: 'disable-zoom',
    });
  });

  it('has a reactive property "disableOr"', () => {
    expect(new QueryBuilder()).to.have.property('disableOr', false);
    expect(QueryBuilder).to.have.deep.nested.property('properties.disableOr', {
      type: Boolean,
      attribute: 'disable-or',
    });
  });

  it('has a reactive property "docsHref"', () => {
    expect(new QueryBuilder()).to.have.property('docsHref', null);
    expect(QueryBuilder).to.have.deep.nested.property('properties.docsHref', {
      attribute: 'docs-href',
    });
  });

  it('has a static method to generate zoom parameter value from a query string', () => {
    expect(QueryBuilder).to.have.property('zoom');
    expect(QueryBuilder.zoom('one:two:three=1&four:five=2')).to.equal('one:two,four');
  });

  it('exposes change event class as a static field', () => {
    expect(QueryBuilder).to.have.property('ChangeEvent');
    expect(new QueryBuilder.ChangeEvent('change')).to.be.instanceOf(Event);
  });

  it('exposes hAPI operators through a static field', () => {
    expect(QueryBuilder).to.have.property('Operator');

    const Operator = QueryBuilder.Operator;

    expect(Operator).to.have.property('LessThanOrEqual', 'lessthanorequal');
    expect(Operator).to.have.property('GreaterThanOrEqual', 'greaterthanorequal');
    expect(Operator).to.have.property('LessThan', 'lessthan');
    expect(Operator).to.have.property('GreaterThan', 'greaterthan');
    expect(Operator).to.have.property('IsDefined', 'isdefined');
    expect(Operator).to.have.property('Not', 'not');
    expect(Operator).to.have.property('In', 'in');
  });

  it('exposes option types through a static field', () => {
    expect(QueryBuilder).to.have.property('Type');

    const Type = QueryBuilder.Type;

    expect(Type).to.have.property('Attribute', 'attribute');
    expect(Type).to.have.property('Boolean', 'boolean');
    expect(Type).to.have.property('String', 'string');
    expect(Type).to.have.property('Number', 'number');
    expect(Type).to.have.property('Date', 'date');
    expect(Type).to.have.property('Any', 'any');
  });

  it('has a default value of null', () => {
    expect(new QueryBuilder()).to.have.property('value', null);
  });

  it('has default options set to null', () => {
    expect(new QueryBuilder()).to.have.property('options', null);
  });

  it('renders a single empty rule in advanced mode by default', async () => {
    const element = await fixture<QueryBuilder>(html`<foxy-query-builder></foxy-query-builder>`);
    const groups = element.renderRoot.querySelectorAll(`[aria-label="query_builder_group"]`);
    const rules = groups[0]?.querySelectorAll(`[aria-label="query_builder_rule"]`);
    const path = rules?.[0]?.querySelector('input');

    expect(groups).to.have.length(1);
    expect(rules).to.have.length(1);
    expect(path).to.exist;
    expect(path).to.have.value('');
  });

  it('adds a rule in advanced mode once user starts typing into the path field', async () => {
    const element = await fixture<QueryBuilder>(html`<foxy-query-builder></foxy-query-builder>`);
    const root = element.renderRoot;

    expect(root.querySelectorAll(`[aria-label="query_builder_rule"]`)).to.have.length(1);

    const path = root.querySelector('[aria-label="query_builder_rule"] input') as HTMLInputElement;
    path.value = 'a';
    path.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();

    expect(root.querySelectorAll(`[aria-label="query_builder_rule"]`)).to.have.length(2);
    expect(element).to.have.value('a=');
  });

  it('clears path of the last rule after adding a new one in advanced mode', async () => {
    const element = await fixture<QueryBuilder>(html`<foxy-query-builder></foxy-query-builder>`);
    const root = element.renderRoot;
    const path = root.querySelector('[aria-label="query_builder_rule"] input') as HTMLInputElement;

    path.value = 'a';
    path.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();

    expect(
      root.querySelector('[aria-label="query_builder_rule"]:last-of-type input')
    ).to.have.value('');
  });

  it('updates element value with notification once rule field changes in advanced mode', async () => {
    const layout = html`<foxy-query-builder value="foo="></foxy-query-builder>`;
    const element = await fixture<QueryBuilder>(layout);
    const value = element.renderRoot.querySelector(
      '[aria-label="query_builder_rule"] input'
    ) as HTMLInputElement;

    const whenGotEvent = oneEvent(element, 'change');
    value.value = 'bar';
    value.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();

    expect(element).to.have.value('bar=');
    expect(await whenGotEvent).to.be.instanceOf(QueryBuilder.ChangeEvent);
  });

  it('updates element value with notification once rule operator changes in advanced mode', async () => {
    const layout = html`<foxy-query-builder value="foo="></foxy-query-builder>`;
    const element = await fixture<QueryBuilder>(layout);
    const root = element.renderRoot;
    const toggle = root.querySelector('button[title="operator_equal"]') as HTMLButtonElement;
    const whenGotEvent = oneEvent(element, 'change');

    toggle.click();
    await element.requestUpdate();

    expect(element).to.have.value('foo%3Alessthanorequal=');
    expect(await whenGotEvent).to.be.instanceOf(QueryBuilder.ChangeEvent);
  });

  it('updates element value with notification once rule value changes in advanced mode', async () => {
    const layout = html`<foxy-query-builder value="foo=bar"></foxy-query-builder>`;
    const element = await fixture<QueryBuilder>(layout);
    const value = element.renderRoot.querySelectorAll<HTMLInputElement>(
      '[aria-label="query_builder_rule"] input'
    )[1];

    const whenGotEvent = oneEvent(element, 'change');
    value.value = 'baz';
    value.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();

    expect(element).to.have.value('foo=baz');
    expect(await whenGotEvent).to.be.instanceOf(QueryBuilder.ChangeEvent);
  });

  it('cycles through operators when clicking the toggle button in advanced mode', async () => {
    const layout = html`<foxy-query-builder value="foo="></foxy-query-builder>`;
    const element = await fixture<QueryBuilder>(layout);
    const root = element.renderRoot;
    const toggle = root.querySelector('button[title="operator_equal"]') as HTMLButtonElement;

    const values = [
      'foo%3Alessthanorequal=',
      'foo%3Alessthan=',
      'foo%3Agreaterthanorequal=',
      'foo%3Agreaterthan=',
      'foo%3Anot=',
      'foo%3Ain=',
      'foo=',
    ];

    for (const value of values) {
      const whenGotEvent = oneEvent(element, 'change');
      toggle.click();
      await element.requestUpdate();

      expect(element).to.have.value(value);
      expect(await whenGotEvent).to.be.instanceOf(QueryBuilder.ChangeEvent);
    }
  });

  it('limits operators according to settings in advanced mode', async () => {
    const layout = html`
      <foxy-query-builder
        value="foo="
        .operators=${[Operator.GreaterThan, Operator.LessThan, Operator.Not]}
      >
      </foxy-query-builder>
    `;

    const element = await fixture<QueryBuilder>(layout);
    const root = element.renderRoot;
    const toggle = root.querySelector('button[title="operator_equal"]') as HTMLButtonElement;

    const values = ['foo%3Alessthan=', 'foo%3Agreaterthan=', 'foo%3Anot=', 'foo='];

    for (const value of values) {
      const whenGotEvent = oneEvent(element, 'change');
      toggle.click();
      await element.requestUpdate();

      expect(element).to.have.value(value);
      expect(await whenGotEvent).to.be.instanceOf(QueryBuilder.ChangeEvent);
    }
  });

  it('adds attribute-only operators to the cycle for attribute-like resources in advanced mode', async () => {
    const layout = html`<foxy-query-builder value="foo[bar]="></foxy-query-builder>`;
    const element = await fixture<QueryBuilder>(layout);
    const root = element.renderRoot;
    const toggle = root.querySelector('button[title="operator_equal"]') as HTMLButtonElement;

    const values = [
      'foo%3Aname%5Bbar%5D%3Alessthanorequal=&zoom=foo',
      'foo%3Aname%5Bbar%5D%3Alessthan=&zoom=foo',
      'foo%3Aname%5Bbar%5D%3Agreaterthanorequal=&zoom=foo',
      'foo%3Aname%5Bbar%5D%3Agreaterthan=&zoom=foo',
      'foo%3Aname%5Bbar%5D%3Aisdefined=&zoom=foo',
      'foo%3Aname%5Bbar%5D%3Anot=&zoom=foo',
      'foo%3Aname%5Bbar%5D%3Ain=&zoom=foo',
      'foo%3Aname%5Bbar%5D=&zoom=foo',
    ];

    for (const value of values) {
      const whenGotEvent = oneEvent(element, 'change');
      toggle.click();
      await element.requestUpdate();

      expect(element).to.have.value(value);
      expect(await whenGotEvent).to.be.instanceOf(QueryBuilder.ChangeEvent);
    }
  });

  it('disables all interactive elements in the render root when disabled in advanced mode', async () => {
    const options = [
      { type: Type.Attribute, path: 'attributes', label: '' },
      { type: Type.Number, path: 'total_order', label: '' },
      { type: Type.Date, path: 'transaction_date', label: 'transaction_date' },
      {
        label: '',
        type: Type.Boolean,
        path: 'data_is_fed',
        list: [
          { label: 'webhooks_fed', value: 'true' },
          { label: 'webhooks_not_fed', value: 'false' },
        ],
      },
      {
        type: Type.String,
        path: 'status',
        label: 'status',
        list: [
          { label: 'transaction_authorized', value: 'authorized' },
          { label: 'transaction_approved', value: 'approved' },
          { label: 'transaction_pending', value: 'pending' },
        ],
      },
    ];

    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder
        .options=${options}
        value="total_order%3Agreaterthanorequal=15&transaction_date=2019-01-01T00%3A00%3A00..2019-01-02T00%3A00%3A00&custom_fields%5Bcolor%5D=red%7Cstatus%253Ain%3Dauthorized%252Capproved&data_is_fed=false"
      >
      </foxy-query-builder>
    `);

    const root = element.renderRoot;
    const controls = root.querySelectorAll(
      ':is(input, button, select):not([disabled]):not([type="radio"])'
    );

    controls.forEach(control => expect(control).to.not.have.attribute('disabled'));

    element.disabled = true;
    await element.requestUpdate();
    controls.forEach(control => expect(control).to.have.attribute('disabled'));
  });

  it('disables all interactive elements in the render root when readonly in advanced mode', async () => {
    const options = [
      { type: Type.Attribute, path: 'attributes', label: '' },
      { type: Type.Number, path: 'total_order', label: '' },
      { type: Type.Date, path: 'transaction_date', label: 'transaction_date' },
      {
        label: '',
        type: Type.Boolean,
        path: 'data_is_fed',
        list: [
          { label: 'webhooks_fed', value: 'true' },
          { label: 'webhooks_not_fed', value: 'false' },
        ],
      },
      {
        type: Type.String,
        path: 'status',
        label: 'status',
        list: [
          { label: 'transaction_authorized', value: 'authorized' },
          { label: 'transaction_approved', value: 'approved' },
          { label: 'transaction_pending', value: 'pending' },
        ],
      },
    ];

    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder
        .options=${options}
        value="total_order%3Agreaterthanorequal=15&transaction_date=2019-01-01T00%3A00%3A00..2019-01-02T00%3A00%3A00&custom_fields%5Bcolor%5D=red%7Cstatus%253Ain%3Dauthorized%252Capproved&data_is_fed=false"
      >
      </foxy-query-builder>
    `);

    const controls = element.renderRoot.querySelectorAll(
      ':is(input, button, select):not([disabled]):not([type="radio"])'
    );

    controls.forEach(control => expect(control).to.not.have.attribute('disabled'));
    element.readonly = true;
    await element.requestUpdate();

    element.renderRoot
      .querySelectorAll('input:not([type="radio"]), button, select')
      .forEach(control => expect(control).to.have.attribute('disabled'));
  });

  it('disables OR operator in advanced mode when .disableOr=true', async () => {
    const element = await fixture<QueryBuilder>(
      html`<foxy-query-builder value="foo=bar"></foxy-query-builder>`
    );

    const or = element.renderRoot.querySelector('[aria-label="add_or_clause"]');
    expect(or).to.not.have.class('opacity-0');

    element.disableOr = true;
    await element.requestUpdate();
    expect(or).to.have.class('opacity-0');
  });

  it('does not add zoom query param in advanced mode when .disableZoom=true', async () => {
    const element = await fixture<QueryBuilder>(html`<foxy-query-builder></foxy-query-builder>`);
    const root = element.renderRoot;
    const path = root.querySelector('[aria-label="query_builder_rule"] input') as HTMLInputElement;

    path.value = 'one:two:three';
    path.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();
    expect(root.querySelectorAll(`[aria-label="query_builder_rule"]`)).to.have.length(3);
    expect(element).to.have.value('one%3Atwo%3Athree=&zoom=one%3Atwo');

    element.value = '';
    element.disableZoom = true;
    await element.requestUpdate();
    path.value = 'one:two:three';
    path.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.value('one%3Atwo%3Athree=');
  });

  it('renders a field for Type.Boolean option in simple mode', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder .options=${[{ type: Type.Boolean, path: 'foo', label: 'option_foo' }]}>
      </foxy-query-builder>
    `);

    const rules = element.renderRoot.querySelectorAll('[aria-label="query_builder_rule"]');
    expect(rules).to.have.length(1);

    const rule = rules[0];
    const label = rule.querySelector('foxy-i18n[key="option_foo"][infer=""]');
    expect(label).to.exist;

    // Initial state
    const operatorSelect = rule.querySelector('select')!;
    expect(operatorSelect).to.exist;
    expect(operatorSelect.options).to.have.length(3);
    expect(operatorSelect.options[0].value).to.equal('any');
    expect(operatorSelect.options[0].innerText.trim()).to.equal('value_any');
    expect(operatorSelect.options[1].value).to.equal('true');
    expect(operatorSelect.options[1].innerText.trim()).to.equal('option_foo_true');
    expect(operatorSelect.options[2].value).to.equal('false');
    expect(operatorSelect.options[2].innerText.trim()).to.equal('option_foo_false');

    // Editing value (true)
    await element.requestUpdate();
    operatorSelect.value = 'true';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value(`foo=true`);

    // Editing value (false)
    await element.requestUpdate();
    operatorSelect.value = 'false';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value(`foo=false`);

    // Editing value (Any)
    await element.requestUpdate();
    operatorSelect.value = 'any';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('');
  });

  it('renders a field for Type.String option in simple mode', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder .options=${[{ type: Type.String, path: 'foo', label: 'option_foo' }]}>
      </foxy-query-builder>
    `);

    const rules = element.renderRoot.querySelectorAll('[aria-label="query_builder_rule"]');
    expect(rules).to.have.length(1);

    const rule = rules[0];
    const label = rule.querySelector('foxy-i18n[key="option_foo"][infer=""]');
    expect(label).to.exist;

    // Initial state
    const operatorSelect = rule.querySelector('select')!;
    expect(operatorSelect).to.exist;
    expect(operatorSelect.options).to.have.length(3);
    expect(operatorSelect.options[0].value).to.equal('any');
    expect(operatorSelect.options[0].innerText.trim()).to.equal('value_any');
    expect(operatorSelect.options[1].value).to.equal('equal');
    expect(operatorSelect.options[1].innerText.trim()).to.equal('operator_equal');
    expect(operatorSelect.options[2].value).to.equal('not');
    expect(operatorSelect.options[2].innerText.trim()).to.equal('operator_not');

    // Editing operator (Equal)
    operatorSelect.value = 'equal';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo=');
    await element.requestUpdate();

    // Editing value
    const valueInput = rule.querySelector('input') as HTMLInputElement;
    expect(valueInput).to.exist;
    expect(valueInput).to.have.value('');
    valueInput.value = 'baz';
    valueInput.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.value('foo=baz');

    // Editing operator (Not)
    operatorSelect.value = 'not';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo%3Anot=baz');

    // Editing operator (Any)
    operatorSelect.value = 'any';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('');
  });

  it('renders a field for Type.Number option in simple mode', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder
        .options=${[{ type: Type.Number, path: 'foo', label: 'option_foo', min: 10 }]}
      >
      </foxy-query-builder>
    `);

    const rules = element.renderRoot.querySelectorAll('[aria-label="query_builder_rule"]');
    expect(rules).to.have.length(1);

    const rule = rules[0];
    const label = rule.querySelector('foxy-i18n[key="option_foo"][infer=""]');
    expect(label).to.exist;

    // Initial state
    const operatorSelect = rule.querySelector('select')!;
    expect(operatorSelect).to.exist;
    expect(operatorSelect.options).to.have.length(8);
    expect(operatorSelect.options[0].value).to.equal('any');
    expect(operatorSelect.options[0].innerText.trim()).to.equal('value_any');
    expect(operatorSelect.options[1].value).to.equal('equal');
    expect(operatorSelect.options[1].innerText.trim()).to.equal('operator_equal');
    expect(operatorSelect.options[2].value).to.equal('not');
    expect(operatorSelect.options[2].innerText.trim()).to.equal('operator_not');
    expect(operatorSelect.options[3].value).to.equal('lessthanorequal');
    expect(operatorSelect.options[3].innerText.trim()).to.equal('operator_lessthanorequal');
    expect(operatorSelect.options[4].value).to.equal('lessthan');
    expect(operatorSelect.options[4].innerText.trim()).to.equal('operator_lessthan');
    expect(operatorSelect.options[5].value).to.equal('greaterthanorequal');
    expect(operatorSelect.options[5].innerText.trim()).to.equal('operator_greaterthanorequal');
    expect(operatorSelect.options[6].value).to.equal('greaterthan');
    expect(operatorSelect.options[6].innerText.trim()).to.equal('operator_greaterthan');
    expect(operatorSelect.options[7].value).to.equal('range');
    expect(operatorSelect.options[7].innerText.trim()).to.equal('range');

    // Editing operator (Equal)
    operatorSelect.value = 'equal';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo=10');
    await element.requestUpdate();

    // Editing value
    const valueInput = rule.querySelector('input') as HTMLInputElement;
    expect(valueInput).to.exist;
    expect(valueInput).to.have.value('10');
    expect(valueInput).to.have.attribute('min', '10');
    valueInput.value = '13';
    valueInput.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.value('foo=13');

    // Editing operator (Not)
    operatorSelect.value = 'not';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo%3Anot=13');

    // Editing operator (LessThanOrEqual)
    operatorSelect.value = 'lessthanorequal';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo%3Alessthanorequal=13');

    // Editing operator (LessThan)
    operatorSelect.value = 'lessthan';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo%3Alessthan=13');

    // Editing operator (GreaterThanOrEqual)
    operatorSelect.value = 'greaterthanorequal';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo%3Agreaterthanorequal=13');

    // Editing operator (GreaterThan)
    operatorSelect.value = 'greaterthan';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo%3Agreaterthan=13');

    // Editing operator (Range)
    operatorSelect.value = 'range';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo=13..23');

    // Editing range value (From)
    await element.requestUpdate();
    const rangeFromInput = rule.querySelectorAll('input')[0] as HTMLInputElement;
    expect(rangeFromInput).to.exist;
    expect(rangeFromInput).to.have.attribute('min', '10');
    expect(rangeFromInput).to.have.value('13');
    rangeFromInput.value = '15';
    rangeFromInput.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.value('foo=15..23');

    // Editing range value (To)
    const rangeToInput = rule.querySelectorAll('input')[1] as HTMLInputElement;
    expect(rangeToInput).to.exist;
    expect(rangeToInput).to.have.value('23');
    expect(rangeFromInput).to.have.attribute('min', '10');
    rangeToInput.value = '25';
    rangeToInput.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.value('foo=15..25');

    // Editing operator (Any)
    operatorSelect.value = 'any';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('');
  });

  it('renders a field for Type.Date option in simple mode', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder
        .options=${[{ type: Type.Date, path: 'foo', label: 'option_foo', min: '2020-10-05' }]}
      >
      </foxy-query-builder>
    `);

    const rules = element.renderRoot.querySelectorAll('[aria-label="query_builder_rule"]');
    expect(rules).to.have.length(1);

    const rule = rules[0];
    const label = rule.querySelector('foxy-i18n[key="option_foo"][infer=""]');
    expect(label).to.exist;

    // Initial state
    const operatorSelect = rule.querySelector('select')!;
    expect(operatorSelect).to.exist;
    expect(operatorSelect.options).to.have.length(8);
    expect(operatorSelect.options[0].value).to.equal('any');
    expect(operatorSelect.options[0].innerText.trim()).to.equal('value_any');
    expect(operatorSelect.options[1].value).to.equal('equal');
    expect(operatorSelect.options[1].innerText.trim()).to.equal('operator_equal');
    expect(operatorSelect.options[2].value).to.equal('not');
    expect(operatorSelect.options[2].innerText.trim()).to.equal('operator_not');
    expect(operatorSelect.options[3].value).to.equal('lessthanorequal');
    expect(operatorSelect.options[3].innerText.trim()).to.equal('operator_lessthanorequal');
    expect(operatorSelect.options[4].value).to.equal('lessthan');
    expect(operatorSelect.options[4].innerText.trim()).to.equal('operator_lessthan');
    expect(operatorSelect.options[5].value).to.equal('greaterthanorequal');
    expect(operatorSelect.options[5].innerText.trim()).to.equal('operator_greaterthanorequal');
    expect(operatorSelect.options[6].value).to.equal('greaterthan');
    expect(operatorSelect.options[6].innerText.trim()).to.equal('operator_greaterthan');
    expect(operatorSelect.options[7].value).to.equal('range');
    expect(operatorSelect.options[7].innerText.trim()).to.equal('range');

    // Editing operator (Equal)
    operatorSelect.value = 'equal';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element.value).to.include(serializeDate(new Date())); // include because ms can be different
    await element.requestUpdate();

    // Editing value
    const valueInput = rule.querySelector('input') as HTMLInputElement;
    expect(valueInput).to.exist;
    expect(valueInput).to.have.value(serializeDate(new Date()));
    expect(valueInput).to.have.attribute('min', '2020-10-05');
    valueInput.value = '2024-12-06';
    valueInput.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.value(`foo=${inputToAPIDate('2024-12-06')}`);

    // Editing operator (Not)
    await element.requestUpdate();
    operatorSelect.value = 'not';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value(`foo%3Anot=${inputToAPIDate('2024-12-06')}`);

    // Editing operator (LessThanOrEqual)
    await element.requestUpdate();
    operatorSelect.value = 'lessthanorequal';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value(`foo%3Alessthanorequal=${inputToAPIDate('2024-12-06')}`);

    // Editing operator (LessThan)
    await element.requestUpdate();
    operatorSelect.value = 'lessthan';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value(`foo%3Alessthan=${inputToAPIDate('2024-12-06')}`);

    // Editing operator (GreaterThanOrEqual)
    await element.requestUpdate();
    operatorSelect.value = 'greaterthanorequal';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value(`foo%3Agreaterthanorequal=${inputToAPIDate('2024-12-06')}`);

    // Editing operator (GreaterThan)
    await element.requestUpdate();
    operatorSelect.value = 'greaterthan';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value(`foo%3Agreaterthan=${inputToAPIDate('2024-12-06')}`);

    // Editing operator (Range)
    await element.requestUpdate();
    operatorSelect.value = 'range';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value(
      `foo=${inputToAPIDate('2024-11-06')}..${inputToAPIDate('2024-12-06', true)}`
    );

    // Editing range value (From)
    await element.requestUpdate();
    const rangeFromInput = rule.querySelectorAll('input')[0] as HTMLInputElement;
    expect(rangeFromInput).to.exist;
    expect(rangeFromInput).to.have.attribute('min', '2020-10-05');
    expect(rangeFromInput).to.have.value('2024-11-06');
    rangeFromInput.value = '2023-11-06';
    rangeFromInput.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.value(
      `foo=${inputToAPIDate('2023-11-06')}..${inputToAPIDate('2024-12-06', true)}`
    );

    // Editing range value (To)
    await element.requestUpdate();
    const rangeToInput = rule.querySelectorAll('input')[1] as HTMLInputElement;
    expect(rangeToInput).to.exist;
    expect(rangeFromInput).to.have.attribute('min', '2020-10-05');
    expect(rangeToInput).to.have.value('2024-12-06');
    rangeToInput.value = '2025-01-02';
    rangeToInput.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.value(
      `foo=${inputToAPIDate('2023-11-06')}..${inputToAPIDate('2025-01-02', true)}`
    );

    // Editing operator (Any)
    await element.requestUpdate();
    operatorSelect.value = 'any';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('');
  });

  it('renders a field for Type.Attribute option in simple mode', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder .options=${[{ type: Type.Attribute, path: 'foo', label: 'option_foo' }]}>
      </foxy-query-builder>
    `);

    const rules = element.renderRoot.querySelectorAll('[aria-label="query_builder_rule"]');
    expect(rules).to.have.length(1);

    const rule = rules[0];
    const label = rule.querySelector('foxy-i18n[key="option_foo"][infer=""]');
    expect(label).to.exist;

    // Initial state
    const nameInput = rule.querySelector('input')!;
    const operatorSelect = rule.querySelector('select')!;
    expect(nameInput).to.exist;
    expect(operatorSelect).to.exist;
    expect(operatorSelect.options).to.have.length(3);
    expect(operatorSelect.options[0].value).to.equal('any');
    expect(operatorSelect.options[0].innerText.trim()).to.equal('value_any');
    expect(operatorSelect.options[1].value).to.equal('equal');
    expect(operatorSelect.options[1].innerText.trim()).to.equal('operator_equal');
    expect(operatorSelect.options[2].value).to.equal('not');
    expect(operatorSelect.options[2].innerText.trim()).to.equal('operator_not');

    // Editing name
    nameInput.value = 'bar';
    nameInput.dispatchEvent(new CustomEvent('input'));
    expect(element).to.have.value('foo%3Aname%5Bbar%5D%3Aisdefined=true&zoom=foo');
    await element.requestUpdate();

    // Editing operator (Equal)
    operatorSelect.value = 'equal';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo%3Aname%5Bbar%5D=&zoom=foo');
    await element.requestUpdate();
    const [_, valueInput] = rule.querySelectorAll('input');
    expect(valueInput).to.exist;
    expect(valueInput).to.have.value('');

    // Editing value
    valueInput.value = 'baz';
    valueInput.dispatchEvent(new InputEvent('input'));
    expect(element).to.have.value('foo%3Aname%5Bbar%5D=baz&zoom=foo');
    await element.requestUpdate();

    // Editing operator (Not)
    operatorSelect.value = 'not';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo%3Aname%5Bbar%5D%3Anot=baz&zoom=foo');
    await element.requestUpdate();

    // Editing operator (Any)
    operatorSelect.value = 'any';
    operatorSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('foo%3Aname%5Bbar%5D%3Aisdefined=true&zoom=foo');
    await element.requestUpdate();

    // Editing name (empty)
    nameInput.value = '';
    nameInput.dispatchEvent(new CustomEvent('input'));
    expect(element).to.have.value('');
  });

  it('renders sorting controls for options in simple mode', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder .options=${[{ type: Type.Number, path: 'foo', label: 'option_foo' }]}>
      </foxy-query-builder>
    `);

    const rules = element.renderRoot.querySelectorAll('[aria-label="query_builder_rule"]');
    const rule = rules[0];
    const [_, orderSelect] = rule.querySelectorAll('select');

    expect(orderSelect).to.exist;
    expect(orderSelect.options).to.have.length(3);
    expect(orderSelect.options[0].value).to.equal('none');
    expect(orderSelect.options[0].innerText.trim()).to.equal('order_none');
    expect(orderSelect.options[1].value).to.equal('asc');
    expect(orderSelect.options[1].innerText.trim()).to.equal('order_asc_number');
    expect(orderSelect.options[2].value).to.equal('desc');
    expect(orderSelect.options[2].innerText.trim()).to.equal('order_desc_number');

    // Editing order (Ascending)
    orderSelect.value = 'asc';
    orderSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('order=foo+asc');

    // Editing order (Descending)
    orderSelect.value = 'desc';
    orderSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('order=foo+desc');

    // Editing order (None)
    orderSelect.value = 'none';
    orderSelect.dispatchEvent(new InputEvent('change'));
    expect(element).to.have.value('');
  });

  it('renders a switcher for simple/advanced mode when options are available', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder
        value="foo=123"
        .options=${[{ type: Type.Number, path: 'foo', label: 'option_foo' }]}
      >
      </foxy-query-builder>
    `);

    const simpleModeTabLabel = element.renderRoot.querySelector(
      'foxy-i18n[key="mode_simple"][infer=""]'
    );
    const advancedModeTabLabel = element.renderRoot.querySelector(
      'foxy-i18n[key="mode_advanced"][infer=""]'
    );

    const simpleModeTabInput = simpleModeTabLabel?.closest('label')?.querySelector('input');
    const advancedModeTabInput = advancedModeTabLabel?.closest('label')?.querySelector('input');

    // Initial state
    expect(simpleModeTabInput).to.exist;
    expect(advancedModeTabInput).to.exist;
    expect(simpleModeTabInput?.checked).to.be.true;
    expect(simpleModeTabInput?.name).to.equal(advancedModeTabInput?.name);

    // 1 rule (no placeholder) indicates that the Simple mode is on
    expect(element.renderRoot.querySelectorAll('[aria-label="query_builder_rule"]')).to.have.length(
      1
    );

    advancedModeTabInput!.checked = true;
    advancedModeTabInput!.dispatchEvent(new CustomEvent('change'));
    await element.requestUpdate();

    // 2 rules, where one has data and one is an empty placeholder, indicates that the Advanced mode is on
    expect(element.renderRoot.querySelectorAll('[aria-label="query_builder_rule"]')).to.have.length(
      2
    );
  });

  it('disables simple mode if filters cannot be rendered in the simple mode', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder
        value="foo=123&bar=baz"
        .options=${[{ type: Type.Number, path: 'foo', label: 'option_foo' }]}
      >
      </foxy-query-builder>
    `);

    const simpleModeTabLabel = element.renderRoot.querySelector(
      'foxy-i18n[key="mode_simple_unsupported"][infer=""]'
    );
    const advancedModeTabLabel = element.renderRoot.querySelector(
      'foxy-i18n[key="mode_advanced"][infer=""]'
    );

    const advancedModeTabInput = advancedModeTabLabel?.closest('label')?.querySelector('input');
    const simpleModeTabInput = simpleModeTabLabel?.closest('label')?.querySelector('input');

    expect(advancedModeTabInput).to.exist;
    expect(advancedModeTabInput?.checked).to.be.true;
    expect(advancedModeTabInput?.name).to.equal(simpleModeTabInput?.name);

    expect(simpleModeTabInput).to.exist;
    expect(simpleModeTabInput?.disabled).to.be.true;
  });

  it('displays simple mode even if options are not provided for paths in .reservedPaths', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder
        value="foo=123&bar=baz"
        .options=${[{ type: Type.Number, path: 'foo', label: 'option_foo' }]}
        .reservedPaths=${['bar']}
      >
      </foxy-query-builder>
    `);

    const rules = element.renderRoot.querySelectorAll('[aria-label="query_builder_rule"]');
    const simpleModeTabLabel = element.renderRoot.querySelector(
      'foxy-i18n[key="mode_simple"][infer=""]'
    );

    // 1 rule (no placeholder) indicates that the Simple mode is on
    expect(rules).to.have.length(1);
    expect(simpleModeTabLabel).to.exist;
  });

  it('displays docs reference in the advanced mode if .docsUrl is set', async () => {
    const element = await fixture<QueryBuilder>(html`
      <foxy-query-builder docs-href="https://example.com" value="foo=123&bar=baz">
      </foxy-query-builder>
    `);

    const notice = element.renderRoot.querySelector(
      'foxy-i18n[infer=""][key="advanced_mode_notice"]'
    );
    const apiReferenceLinkCaption = element.renderRoot.querySelector(
      'foxy-i18n[infer=""][key="api_reference_link"]'
    );
    const apiReferenceLink = apiReferenceLinkCaption?.closest('a');

    expect(notice).to.exist;
    expect(apiReferenceLink).to.exist;
    expect(apiReferenceLink?.href).to.equal('https://example.com/');
    expect(apiReferenceLink?.target).to.equal('_blank');
    expect(apiReferenceLink?.rel).to.equal('nofollow noreferrer noopener');
  });
});
