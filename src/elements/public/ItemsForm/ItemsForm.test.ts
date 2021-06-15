import { aTimeout, elementUpdated, expect, fixture, html, oneEvent } from '@open-wc/testing';
import * as sinon from 'sinon';
import { ItemsForm } from './ItemsForm';
import { MockItem } from '../../../mocks/FxItem';
import { Dropdown, ErrorScreen } from '../../private/index';

const cartWideFields = ['sub_token', 'sub_modify', 'sub_restart', 'sub_cancel'];

/**
 * Avoid CustomElementsRegistry collisions
 *
 * not using defineCE because lit-html doesn't support dynamic tags by default.
 */
class TestItemsForm extends ItemsForm {
  public static get scopedElements(): Record<string, unknown> {
    return {
      'x-error-screen': ErrorScreen,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-dropdown': Dropdown,
      'x-item': MockItem,
    };
  }
}

class TestRegularItemsForm extends ItemsForm {
  constructor() {
    super();
  }
}

class TestMockItem extends MockItem {
  constructor() {
    super();
  }
}

customElements.define('test-items-form', TestItemsForm);
customElements.define('x-testitem', TestMockItem);
customElements.define('test-items-form-regular', TestRegularItemsForm);

describe('The form should allow new items to be added and removed', async function () {
  it('Should recognize new items added as JS array', async function () {
    const el = await fixture(html`
      <test-items-form
        store="test.foxycart.com"
        currency="usd"
        items='[{"name":"Alpha","price":"75.95"},{"name":"Alpha1","price":"64.95"}]'
      >
      </test-items-form>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll('[data-item]');
    expect(items).to.have.lengthOf(2);
  });

  it('Should recognize new items added as foxy-item', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com">
        <x-testitem name="Beta1" price="10"></x-testitem>
        <x-testitem name="Beta2" price="10"></x-testitem>
        <x-testitem name="Beta3" price="10"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    // Items will be found in the DOM even if not recognized by ItemsForm
    // So we check if the price was properly updated
    expect((el as ItemsForm).total).to.equal(30);
  });

  it('Should recognize changes to JS array', async function () {
    const el = await fixture(html`
      <test-items-form
        currency="usd"
        store="test.foxycart.com"
        items='[{"name": "GammaOrig1", "price": "1"}, {"name": "GammaOrig2", "price": "2"}]'
      ></test-items-form>
    `);
    await elementUpdated(el);
    let items = el.querySelectorAll('[data-item]');
    expect(items).to.have.lengthOf(2);
    // Increase the number of items
    (el as ItemsForm).items = [
      { name: 'GammaNew1', price: 1 },
      { name: 'GammaNew2', price: 2 },
      { name: 'GammaNew3', price: 3 },
    ];
    await elementUpdated(el);
    items = el.querySelectorAll('[data-item]');
    expect(items).to.have.lengthOf(3);
    // Decrease the number of items
    (el as ItemsForm).items = [(el as ItemsForm).items[0]];
    await elementUpdated(el);
    items = el.querySelectorAll('[data-item]');
    expect(items).to.have.lengthOf(1);
  });

  it('Should recognize new items added later as item tags', async function () {
    const el = await formWith2items(10, 10);
    expect((el as ItemsForm).total).to.equal(20);
    const lateItem = document.createElement('x-testitem') as MockItem;
    lateItem.price = 20;
    el.appendChild(lateItem);
    await elementUpdated(el);
    expect((el as ItemsForm).total).to.equal(40);
  });

  it('Should recognize child items removed from the DOM', async function () {
    const el = await formWith2items(10, 10);
    const toRemove = el.querySelector('#first');
    if (toRemove) {
      el.removeChild(toRemove);
    }
    await elementUpdated(el);
    expect((el as ItemsForm).total).to.equal(10);
  });

  it('Should add new valid items', async function () {
    const el = await formWith2items(10, 10);
    (el as ItemsForm).addItems([{ name: 'p3', price: 10 }]);
    await elementUpdated(el);
    const items = el.querySelectorAll('[data-item]');
    expect(items).to.exist;
    expect(items.length).to.equal(3);
  });

  it('Should remove items by item id', async function () {
    const el = await formWith2items(10, 10);
    let items = el.querySelectorAll('[data-item]');
    const pid = (items[0] as MockItem).pid;
    el.removeItems([pid]);
    await elementUpdated(el);
    items = el.querySelectorAll('[data-item]');
    expect(items).to.exist;
    expect(items.length).to.equal(1);
  });

  it('Should provide new items its currency', async function () {
    // Create the ItemsForm instance directly to avoid overrwriting createItem
    const el = await fixture(
      html`<test-items-form-regular currency="usd"></test-items-form-regular>`
    );
    const p = (el as ItemsForm).createItem({});
    expect((p as MockItem).currency).to.equal('usd');
  });

  it('Should listen to changes in child elements', async function () {
    const el = await formWith2items(10, 10);
    await elementUpdated(el);
    const input = document.createElement('input');
    const listener = oneEvent(input, 'change');
    const changeSpy = sinon.spy(el as any, '__itemChange');
    el.appendChild(input);
    await elementUpdated(el);
    input.dispatchEvent(new CustomEvent('change', { detail: 'changing' }));
    await listener;
    await aTimeout(3);
    expect(changeSpy.called).to.be.true;
    expect(changeSpy.firstCall.args[0].detail).to.equal('changing');
  });
});

describe('The form should allow items to be retrieved', async function () {
  it('should allow items to be retrieved', async function () {
    const el = await formWith2items(10, 10);
    await elementUpdated(el);
    expect(el.items.length).to.equal(2);
    expect(el.items[0].price).to.equal(10);
    expect(el.items[1].price).to.equal(10);
  });

  it('Should update the items property', async function () {
    const el = await formWith2items(10, 10);
    await elementUpdated(el);
    el.items = [{ name: 'Foo', price: 30 }];
    await elementUpdated(el);
    expect(el.items[0].price).to.equal(30);
    expect(el.items[0].name).to.equal('Foo');
  });

  it('Should update the items themselves', async function () {
    const el = await formWith2items(10, 10);
    await elementUpdated(el);
    el.items[0].price = 2;
    el.items[0].name = 'foobarbaz';
    el.items[1].price = 2;
    el.items[1].name = 'foobarbaz';
    await elementUpdated(el);
    expect(el.items[0].price).to.equal(2);
    expect(el.items[0].name).to.equal('foobarbaz');
    expect(el.items[1].price).to.equal(2);
    expect(el.items[1].name).to.equal('foobarbaz');
  });

  it('Should not pollute items with illegal values', async function () {
    const el = await formWith2items(10, 10);
    await elementUpdated(el);
    try {
      el.items[0].foo = 'bar';
      el.items[0].bar = 'foo';
      await elementUpdated(el);
    } catch (e) {
      expect(e instanceof TypeError).to.be.true;
    } finally {
      expect(el.items[0].foo).not.to.exist;
      expect(el.items[0].bar).not.to.exist;
    }
  });
});

describe('The form should remain valid', async function () {
  let xhr: sinon.SinonFakeXMLHttpRequestStatic;
  let requests: sinon.SinonFakeXMLHttpRequest[];
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = (xhr: sinon.SinonFakeXMLHttpRequest) => {
      sinon.stub(xhr as unknown as XMLHttpRequest, 'send');
      requests.push(xhr);
    };
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    xhr.restore();
    logSpy.restore();
  });

  it('Should not send a new order with empty items', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com">
        <x-testitem name="p1" price="10.00" quantity="0"></x-testitem>
        <x-testitem name="p2" price="10.00" quantity="0"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form).to.exist;
    expect(new FormData(form)).to.be.empty;
  });

  it('Should not allow negative prices or quantities', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com">
        <x-testitem name="p1" price="-10.00"></x-testitem>
        <x-testitem name="p2" price="10.00" quantity="-3"></x-testitem>
        <x-testitem name="p3" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot).to.exist;
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form).to.exist;
    expect(valuesFromField(new FormData(form), 'price').every(v => Number(v) >= 0)).to.be.true;
  });

  interface FrequencyFormatTest {
    it: string;
    frequencies: string[] | null | string;
    logHappens: boolean;
  }
  const frequencyTests: FrequencyFormatTest[] = [
    {
      it: 'Should accept valid frequencies',
      frequencies: ['5d', '10d', '15d', '1m', '1y', '.5m'],
      logHappens: false,
    },
    {
      it: 'Should reject numeric frequencies',
      frequencies: ['5', '10d'],
      logHappens: true,
    },
    {
      it: 'Should reject empty string frequencies',
      frequencies: [''],
      logHappens: true,
    },
    {
      it: 'Should not accept string frequencies, it must be an array',
      frequencies: '5d, 10d',
      logHappens: true,
    },
    {
      it: 'Should not accept null frequency, it must be an array, ',
      frequencies: null,
      logHappens: true,
    },
  ];

  for (const t of frequencyTests) {
    it(t.it, async function () {
      const el = await fixture(html`
        <test-items-form
          store="test.foxycart.com"
          currency="usd"
          frequencies="${JSON.stringify(t.frequencies)}"
        >
          <x-testitem name="p3" price="10.00" quantity="3"></x-testitem>
        </test-items-form>
      `);
      await elementUpdated(el);
      expect(logSpy.calledWith('Invalid frequency')).to.equal(t.logHappens);
    });
  }

  interface DateFormatTest {
    it: string;
    dates: string[];
    dateType: string;
    logMessage: string;
    logHappens: boolean;
  }
  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().replace(/(-|T.*)/g, '');
  const dateFormatsTests: DateFormatTest[] = [
    {
      it: 'Should accept valid start date formats',
      dates: ['20201010', '20', '2', '1d', '12w', '2y', '10m'],
      logMessage: 'Invalid start date',
      dateType: 'start',
      logHappens: false,
    },
    {
      it: 'Should not accept invalid start date formats',
      dates: ['202010100', '80', '.5m', 'tomorrow', 'today', '-1'],
      logMessage: 'Invalid start date',
      dateType: 'start',
      logHappens: true,
    },
    {
      it: 'Should accept valid end date formats',
      dates: [tomorrowStr, '20', '2', '1d', '12w', '2y', '10m'],
      logMessage: 'Invalid end date',
      dateType: 'end',
      logHappens: false,
    },
    {
      it: 'Should not accept invalid end date formats',
      dates: ['20191010', '219810100', '80', '.5m', 'tomorrow', '-1'],
      dateType: 'end',
      logMessage: 'Invalid end date',
      logHappens: true,
    },
  ];
  for (const t of dateFormatsTests) {
    it(t.it, async function () {
      for (const d of t.dates) {
        const el = await fixture(html`
          <test-items-form
            currency="usd"
            store="test.foxycart.com"
            frequencies='["5d", "10d"]'
            sub_enddate="${t.dateType == 'end' ? d : ''}"
            sub_startdate="${t.dateType == 'start' ? d : ''}"
          >
            <x-testitem name="p3" price="10.00"></x-testitem>
          </test-items-form>
        `);
        await elementUpdated(el);
        expect(logSpy.calledWith(t.logMessage)).to.equal(t.logHappens);
      }
    });
  }
});

describe('The form should be aware of its items', async function () {
  it('Shows the total price of the items added as tags', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com">
        <x-testitem name="p1" price="10.00" quantity="3"></x-testitem>
        <x-testitem name="p2" price="10.00" quantity="1"></x-testitem>
        <x-testitem name="p3" price="10.00" quantity="2"></test-item>
        <x-testitem name="p4" price="10.00" quantity="1"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    expect((el as ItemsForm).total).to.equal(70);
  });

  it('Shows the total price of the items added as arrays ', async function () {
    const el = await fixture(html`
      <test-items-form
        store="test.foxycart.com"
        items='[ {"name": "p1", "price":"10.00"}, {"name": "p2", "price":"10.00"}, {"name": "p3", "price":"10.00", "quantity": "2"}, {"name":"p4","price": "10"} ]'
      >
      </test-items-form>
    `);
    await elementUpdated(el);
    expect((el as ItemsForm).total).to.equal(50);
  });

  it('Update the total price as quantities change', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com">
        <x-testitem name="p1" price="10.00" quantity="3"></x-testitem>
        <x-testitem name="p2" price="10.00"></x-testitem>
        <x-testitem name="p3" price="10.00" quantity="2"></x-testitem>
        <x-testitem name="p4" price="10.00"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    expect((el as ItemsForm).total).to.equal(70);
    const firstItem = el.querySelector('[data-item]');
    expect(firstItem).to.exist;
    const m = firstItem as MockItem;
    m.quantity = 30;
    m.dispatchEvent(new Event('change'));
    await elementUpdated(el);
    expect((el as ItemsForm).total).to.equal(340);
  });
});

describe('The form should add frequency fields', async function () {
  it('Should provide field to choose frequencies', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com" frequencies='["1m", "3m"]'>
        <x-testitem name="p1" price="10.00"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    const freqInput = el.shadowRoot?.querySelector('[name=frequency]');
    expect(freqInput).to.exist;
  });
});

describe('The form submits a valid POST to forxycart', async function () {
  const sig64 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const signatures = {
    name: sig64,
    code: sig64,
    price: sig64,
    quantity: sig64,
    sub_modify: sig64,
    sub_restart: sig64,
  };
  let xhr: sinon.SinonFakeXMLHttpRequestStatic;
  let requests: sinon.SinonFakeXMLHttpRequest[];
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = (xhr: sinon.SinonFakeXMLHttpRequest) => {
      sinon.stub(xhr as unknown as XMLHttpRequest, 'send');
      requests.push(xhr);
    };
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    xhr.restore();
    logSpy.restore();
  });

  it('Prepends ids to the items', async function () {
    const el = await formWith2items(10, 10);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form).to.exist;
    const fd = new FormData(form);
    for (const k of fd.keys()) {
      if (k != 'cart') {
        if (!cartWideFields.includes(k)) {
          expect(k.match(/^\d+:.*$/)!.index).to.equal(0);
        }
      }
    }
  });

  it('Uses signed versions of field names', async function () {
    const el = await fixture(html`
      <test-items-form
        currency="usd"
        store="test.foxycart.com"
        signatures="${JSON.stringify(signatures)}"
      >
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
        <x-testitem name="p2" code="MyCode2" price="10.00" quantity="1"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll('[data-item]');
    expect(items).to.exist;
    let last: MockItem | null = null;
    for (const p of items) {
      (p as MockItem).signatures = signatures;
      last = p as MockItem;
    }
    if (last) {
      last.dispatchEvent(new CustomEvent('change'));
    }
    await elementUpdated(el);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form).to.exist;
    const fd = new FormData(form);
    for (const [k, v] of fd.entries()) {
      if (k != 'cart') {
        expect(k).to.match(/.*signed.*/);
      }
    }
  });

  it('Does not create empty frequency field', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com" frequencies="">
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    const frequencyField = el.shadowRoot?.querySelector('[name=frequency]');
    expect(frequencyField).not.to.exist;
  });

  it('Sends valid subscription fields', async function () {
    const el = await fixture(html`
      <test-items-form
        currency="usd"
        store="test.foxycart.com"
        frequencies='["1d", "2d", "10d"]'
        sub_startdate="1m"
        sub_enddate="1y"
      >
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    const frequencyField = el.shadowRoot?.querySelector('[name=frequency]');
    expect(frequencyField).to.exist;
    frequencyField?.dispatchEvent(new CustomEvent('change', { detail: '1d' }));
    await elementUpdated(el);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    let freqFound = false;
    for (const e of new FormData(form).entries()) {
      if (e[0].match(/sub_frequency||signed/)) {
        freqFound = true;
        break;
      }
    }
    expect(freqFound).to.be.true;
  });

  it('Avoids sending empty subscription fields', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com" sub_frequency="1m">
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    for (const e of new FormData(form).entries()) {
      expect(e[0].match(/.*sub_startdate$/)).not.to.exist;
      expect(e[0].match(/.*sub_subenddate/)).not.to.exist;
    }
  });

  it('Adds the same frequency information to all products', async function () {
    const el = await fixture(html`
      <test-items-form
        currency="usd"
        store="test.foxycart.com"
        sub_startdate="30"
        sub_enddate="22220101"
        sub_frequency="3m"
      >
        <x-testitem name="I have freq" code="MyCode" price="10.00" quantity="3"></x-testitem>
        <x-testitem name="Me too" code="MyCode" price="10.00" quantity="3"></x-testitem>
        <x-testitem name="So do I" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    const freqStartEnd = [0, 0, 0];
    const allentries: any = [];
    for (const e of new FormData(form).entries()) {
      allentries.push(e);
    }
    for (const e of new FormData(form).entries()) {
      if (e[0].match(/.*sub_frequency/)) {
        freqStartEnd[0] += 1;
        expect(e[1]).to.equal('3m');
      }
      if (e[0].match(/.*sub_startdate/)) {
        freqStartEnd[1] += 1;
        expect(e[1]).to.equal('30');
      }
      if (e[0].match(/.*sub_enddate/)) {
        freqStartEnd[2] += 1;
        expect(e[1]).to.equal('22220101');
      }
    }
    expect(freqStartEnd).to.deep.equal([3, 3, 3]);
  });

  it('Defaults sub_modify to replace', async function () {
    const el = await formWith2items(10, 10);
    await elementUpdated(el);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    for (const e of new FormData(form).entries()) {
      if (e[0].match(/.*sub_modify/)) {
        expect(e[1]).to.equal('replace');
      }
    }
  });

  it('Allow user to set sub_modify to append mode', async function () {
    let el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com" sub_modify="">
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    let form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    for (const e of new FormData(form).entries()) {
      if (e[0].match(/.*sub_modify/)) {
        expect(e[1]).to.equal('');
      }
    }
    el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com" sub_modify="append">
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    for (const e of new FormData(form).entries()) {
      if (e[0].match(/.*sub_modify/)) {
        expect(e[1]).to.equal('');
      }
    }
  });

  it('Defaults sub_restart to auto', async function () {
    const el = await formWith2items(10, 10);
    await elementUpdated(el);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    for (const e of new FormData(form).entries()) {
      if (e[0].match(/.*sub_restart/)) {
        expect(e[1]).to.equal('auto');
      }
    }
  });

  it('Allows user to set sub_restart to true', async function () {
    let el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com" sub_restart="true">
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    let form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    for (const e of new FormData(form).entries()) {
      if (e[0].match(/.*sub_restart/)) {
        expect(e[1]).to.equal('true');
      }
    }
    el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com" sub_restart="anythingelse">
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    for (const e of new FormData(form).entries()) {
      if (e[0].match(/.*sub_restart/)) {
        expect(e[1]).to.equal('auto');
      }
    }
  });

  it('Allow user to set sub_token', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com" sub_token="retrievedurl">
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    for (const e of new FormData(form).entries()) {
      if (e[0].match(/.*sub_token/)) {
        expect(e[1]).to.equal('retrievedurl');
      }
    }
  });
});

describe('The form directs the user to the proper destination', async function () {
  it('Uses the _top window', async function () {
    const el = await formWith2items(10, 10);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form.target).to.equal('_top');
  });

  it('Allows user to change the window used', async function () {
    const el = await fixture(html`
      <test-items-form target="_parent" currency="usd" store="test.foxycart.com" sub_frequency="1m">
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form.target).to.equal('_parent');
  });

  it('Goes directly to the checkout', async function () {
    const el = await formWith2items(10, 10);
    await elementUpdated(el);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(form).to.exist;
    expect(new FormData(form).get('cart')).to.equal('checkout');
  });

  it('Allows user to configure it to add products to cart', async function () {
    const el = await fixture(html`
      <test-items-form cart="add" currency="usd" store="test.foxycart.com" sub_frequency="1m">
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="3"></x-testitem>
      </test-items-form>
    `);
    const form = el.shadowRoot!.querySelector('form') as HTMLFormElement;
    expect(new FormData(form).get('cart')).to.equal('add');
  });
});

describe('The form reveals its state to the user', async function () {
  let xhr: sinon.SinonFakeXMLHttpRequestStatic;
  let requests: sinon.SinonFakeXMLHttpRequest[];
  let logSpy: sinon.SinonStub;

  beforeEach(function () {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = (xhr: sinon.SinonFakeXMLHttpRequest) => {
      sinon.stub(xhr as unknown as XMLHttpRequest, 'send');
      requests.push(xhr);
    };
    logSpy = sinon.stub(console, 'error');
  });

  afterEach(function () {
    xhr.restore();
    logSpy.restore();
  });

  it('Disables submit button when no item is valid', async function () {
    const el = await fixture(html`
      <test-items-form currency="usd" store="test.foxycart.com" frequencies='["1d", "2d", "10d"]'>
        <x-testitem name="p1" code="MyCode" price="10.00" quantity="0"></x-testitem>
      </test-items-form>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[data-testid=submit][disabled]')).to.exist;
  });
});

/** Helper functions **/

/**
 * @param price1
 * @param price2
 */
async function formWith2items(price1: number, price2: number) {
  const el = await fixture(html`
    <test-items-form currency="usd" store="test.foxycart.com">
      <x-testitem id="first" data-item name="p1" price="${price1}"></x-testitem>
      <x-testitem id="second" name="p2" price="${price2}"></x-testitem>
    </test-items-form>
  `);
  await elementUpdated(el);
  return el as ItemsForm;
}

/**
 * Returns FormDataEntryValues for fields with a particular name, following
 * FoxyCart convention
 *
 * @param formData
 * @param name
 */
function valuesFromField(formData: FormData, name: string): FormDataEntryValue[] {
  const re = new RegExp(`\\d+:${name}(||.*)?`);
  const values: FormDataEntryValue[] = [];
  formData.forEach((value, key) => {
    if (key.match(re)) {
      values.push(value);
    }
  });
  return values;
}
