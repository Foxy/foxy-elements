import { createMachine } from 'xstate';

interface TaxContext {
  isLiveShow: boolean;
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

const setLocal = (ctx: TaxContext, ev: CustomEvent): void => {
  const scope = type2scope(ev.type);
  ctx.scope = scope;
  ctx.country = ['country', 'region', 'local'].includes(scope);
  ctx.region = ['region', 'local'].includes(scope);
  ctx.city = ['local'].includes(scope);
};

const setIsLive = (ctx: TaxContext, ev: { type: string }): void => {
  const scope = type2scope(ev.type);
  ctx.isLiveShow = ['union', 'country', 'region'].includes(scope);
};

const setProviders = (ctx: TaxContext, ev: { type: string }): void => {
  const eur = ['CHOOSEEUROPE', 'SETUNION'];
  const eua = 'CHOOSEEUA';
  const relevant = ['CHOOSEANY', ...eur, eua];
  if (relevant.includes(ev.type)) {
    ctx.providerValues = {
      avalara: true,
      onesource: true,
      taxjar: [...eur, eua].includes(ev.type),
      thomsonreuters: [...eur, eua].includes(ev.type),
    };
  }
};

const setProvider = (ctx: TaxContext, ev: CustomEvent): void => {
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

const isLiveActions = [setProvider];

const scopeActions = [setIsLive, setLocal, setProviders];

const providerActions = [setExempt];

const scopeConfig = {
  actions: scopeActions,
  target: 'scope',
};

const isLiveConfig = {
  actions: isLiveActions,
  target: 'isLive',
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
    isLive: {
      on: {
        CHOOSEAVALARA: isLiveConfig,
        CHOOSEONESOURCE: isLiveConfig,
        CHOOSETAXJAR: isLiveConfig,
        CHOOSETHOMSONREUTERS: isLiveConfig,
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
        LIVE: {
          actions: [createAction('shipping', false), createAction('provider', true)],
          cond: (ctx: TaxContext): boolean => ctx.isLiveShow,
          target: 'isLive',
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
          cond: (ctx: TaxContext): boolean => ctx.country,
          target: 'northWest.euaCan',
        },
        CHOOSEEUROPE: {
          actions: setProviders,
          cond: (ctx: TaxContext): boolean => ctx.country,
          target: 'northWest.europe',
        },
      },
    },
    northWest: {
      on: {
        CHOOSEANY: {
          actions: setProviders,
          cond: (ctx: TaxContext): boolean => ctx.country,
          target: 'any',
        },
      },
      states: {
        euaCan: {
          on: {
            CHOOSEEUROPE: {
              actions: setProviders,
              cond: (ctx: TaxContext): boolean => ctx.country,
              target: 'europe',
            },
          },
        },
        europe: {
          on: {
            CHOOSEEUA: {
              actions: setProviders,
              cond: (ctx: TaxContext): boolean => ctx.country,
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
    city: false,
    country: false,
    exemptShow: false,
    isLiveShow: false,
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
