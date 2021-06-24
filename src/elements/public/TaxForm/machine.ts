import { createMachine } from 'xstate';

interface TaxContext {
  auto: boolean;
  city: boolean;
  country: boolean;
  exemptShow: boolean;
  originShow: boolean;
  provider: boolean;
  providerValues: {
    avalara: boolean;
    onesource: boolean;
    taxjar: boolean;
    thomsonreuters: boolean;
  };
  region: boolean;
  scope: string;
  shipping: boolean;
}

const type2scope = (type: string) => type.replace('SET', '').toLowerCase();

const setLocal = (ctx: TaxContext, ev: CustomEvent) => {
  const scope = type2scope(ev.type);
  ctx.scope = scope;
  ctx.country = ['country', 'region', 'local'].includes(scope);
  ctx.region = ['region', 'local'].includes(scope);
  ctx.city = ['local'].includes(scope);
};

const setAuto = (ctx: TaxContext, ev: { type: string }) => {
  const scope = type2scope(ev.type);
  ctx.auto = ['union', 'country', 'region'].includes(scope);
};

const setProviders = (ctx: TaxContext, ev: { type: string }) => {
  const eur = ['CHOOSEEUROPE', 'SETUNION'];
  const eua = 'CHOOSEEUA';
  ctx.providerValues = {
    avalara: [...eur, eua].includes(ev.type),
    onesource: true,
    taxjar: [...eur, eua].includes(ev.type),
    thomsonreuters: [...eur, eua].includes(ev.type),
  };
};

const setProvider = (ctx: TaxContext, ev: CustomEvent) => {
  const providerMap = {
    CHOOSETAXJAR: 'taxJar',
    CHOOSETHOMSONREUTERS: 'thomsonReuters',
  };
  ctx.originShow = (providerMap as any)[ev.type] == 'thomsonReuters';
  ctx.exemptShow = (providerMap as any)[ev.type] == 'thomsonReuters';
};

const setExempt = (ctx: TaxContext, ev: CustomEvent) => {
  ctx.exemptShow = ['SETTAXJAR', 'SETFOXY'].includes(ev.type);
};

const autoActions = [setProvider];

const scopeActions = [setAuto, setLocal, setProviders];

const providerActions = [setExempt];

const scopeConfig = {
  actions: scopeActions,
  target: 'scope',
};

const autoConfig = {
  actions: autoActions,
  target: 'auto',
};

const scopeStates = {
  initial: 'scope',
  states: {
    scope: {
      on: {
        SETCOUNTRY: scopeConfig,
        SETGLOBAL: scopeConfig,
        SETLOCAL: scopeConfig,
        SETREGION: scopeConfig,
        SETUNION: scopeConfig,
      },
    },
  },
};

const modeStates = {
  initial: 'rate',
  states: {
    auto: {
      on: {
        CHOOSEAVALARA: autoConfig,
        CHOOSEONESOURCE: autoConfig,
        CHOOSETAXJAR: autoConfig,
        CHOOSETHOMSONREUTERS: autoConfig,
        RATE: {
          actions: [
            ...providerActions,
            createAction('shipping', true),
            createAction('provider', false),
          ],
          target: 'rate',
        },
      },
    },
    rate: {
      on: {
        AUTOMATIC: {
          actions: [createAction('shipping', false), createAction('provider', true)],
          cond: (ctx: TaxContext) => ctx.auto,
          target: 'auto',
        },
      },
    },
  },
};

const countryStates = {
  initial: 'any',
  states: {
    any: {
      on: {
        CHOOSEEUA: {
          actions: setProviders,
          cond: (ctx: TaxContext) => ctx.country,
          target: 'northWest.euaCan',
        },
        CHOOSEEUROPE: {
          actions: setProviders,
          cond: (ctx: TaxContext) => ctx.country,
          target: 'northWest.europe',
        },
      },
    },
    northWest: {
      on: {
        CHOOSEANY: {
          actions: setProviders,
          cond: (ctx: TaxContext) => ctx.country,
          target: 'any',
        },
      },
      states: {
        euaCan: {
          on: {
            CHOOSEEUROPE: {
              actions: setProviders,
              cond: (ctx: TaxContext) => ctx.country,
              target: 'europe',
            },
          },
        },
        europe: {
          on: {
            CHOOSEEUA: {
              actions: setProviders,
              cond: (ctx: TaxContext) => ctx.country,
              target: 'euaCan',
            },
          },
        },
      },
    },
  },
};

export const taxMachine = {
  context: {
    auto: false,
    city: false,
    country: false,
    exemptShow: false,
    originShow: false,
    provider: false,
    providerValues: {
      avalara: false,
      onesource: false,
      taxjar: false,
      thomsonreuters: false,
    },
    region: false,
    scope: 'global',
    shipping: false,
  },
  id: 'taxMachine',
  states: {
    country: countryStates,
    mode: modeStates,
    scope: scopeStates,
  },
  type: 'parallel',
};

/**
 * Create a simple action that sets a value to a context attribute.
 *
 * @param field to have the value set.
 * @param value the value the field should assume.
 * @returns function that changes the context.
 */
function createAction(field: keyof TaxContext, value: string | boolean): (ctx: TaxContext) => void {
  return (ctx: TaxContext) => ((ctx[field] as any) = value);
}
