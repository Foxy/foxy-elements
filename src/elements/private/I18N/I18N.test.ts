import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { I18N } from './I18N';

customElements.define('x-i18n', I18N);

const samples = {
  ns: {
    default: 'global',
    custom: 'custom',
  } as const,
  key: {
    default: '',
    custom: 'test',
  } as const,
  opts: {
    default: undefined,
    custom: { value: 'test' },
  },
  lang: {
    default: 'en',
    custom: 'fr',
  } as const,
  text: {
    en: {
      global: { test: 'dolor sit {{value}}' },
      custom: { test: '{{value}} elit, sed do' },
    },
    fr: {
      global: { test: 'elit, sed {{value}} do' },
      custom: { test: 'dolor {{value}} sit' },
    },
  },
};

/**
 * @param ns
 */
function testNs(ns: 'global' | 'custom') {
  return async (element: I18N) => {
    await element.whenReady;
    expect(element.ns).to.equal(ns);
  };
}

/**
 * @param key
 */
function testKey(key: '' | 'test') {
  return async (element: I18N) => {
    await element.whenReady;
    expect(element.key).to.equal(key);
  };
}

/**
 * @param opts
 * @param opts.value
 */
function testOpts(opts?: { value: string }) {
  return async (element: I18N) => {
    await element.whenReady;
    expect(element.opts).to.deep.equal(opts);
  };
}

/**
 * @param lang
 */
function testLang(lang: 'en' | 'fr') {
  return async (element: I18N) => {
    await element.whenReady;
    expect(element.lang).to.equal(lang);
  };
}

/**
 * @param element
 */
async function testText(element: I18N) {
  await element.whenReady;

  const lang = element.lang as 'en' | 'fr';
  const ns = element.ns as 'global' | 'custom';
  const key = element.key as '' | 'test';
  const opts = element.opts as { value: string } | undefined;
  const value = opts?.value ?? '';
  const text = key === '' ? '' : samples.text[lang][ns][key].replace('{{value}}', value);

  expect(element.shadowRoot!.textContent).to.equal(text);
}

const machine = createMachine({
  type: 'parallel',
  states: {
    ns: {
      meta: { test: testText },
      initial: 'withoutNs',
      states: {
        withoutNs: {
          on: { SET_NS: 'withNs' },
          meta: { test: testNs(samples.ns.default) },
        },
        withNs: {
          meta: { test: testNs(samples.ns.custom) },
        },
      },
    },
    key: {
      meta: { test: testText },
      initial: 'withoutKey',
      states: {
        withoutKey: {
          on: { SET_KEY: 'withKey' },
          meta: { test: testKey(samples.key.default) },
        },
        withKey: {
          meta: { test: testKey(samples.key.custom) },
        },
      },
    },
    opts: {
      meta: { test: testText },
      initial: 'withoutOpts',
      states: {
        withoutOpts: {
          on: { SET_OPTS: 'withOpts' },
          meta: { test: testOpts(samples.opts.default) },
        },
        withOpts: {
          meta: { test: testOpts(samples.opts.custom) },
        },
      },
    },
    lang: {
      meta: { test: testText },
      initial: 'withoutLang',
      states: {
        withoutLang: {
          on: { SET_LANG: 'withLang' },
          meta: { test: testLang(samples.lang.default) },
        },
        withLang: {
          meta: { test: testLang(samples.lang.custom) },
        },
      },
    },
  },
});

const model = createModel<I18N>(machine).withEvents({
  SET_NS: { exec: element => void (element.ns = samples.ns.custom) },
  SET_KEY: { exec: element => void (element.key = samples.key.custom) },
  SET_OPTS: { exec: element => void (element.opts = samples.opts.custom) },
  SET_LANG: { exec: element => void (element.lang = samples.lang.custom) },
});

describe('I18N', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-i18n></x-i18n>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
