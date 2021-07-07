interface TaxContext {
  supportAutomatic: boolean;
  supportCity: boolean;
  supportCountry: boolean;
  supportExempt: boolean;
  supportOrigin: boolean;
  supportOriginCountry: boolean;
  supportProvider: boolean;
  providerOptions: {
    avalara: boolean;
    onesource: boolean;
    taxjar: boolean;
    thomsonreuters: boolean;
  };
  supportRegion: boolean;
  supportShipping: boolean;
  scope: string;
  mode: string;
  provider: string;
  country: string;
}

type Scope = 'global' | 'union' | 'country' | 'region' | 'local' | null;
type Provider = 'avalara' | 'onesource' | 'taxjar' | 'thomsonreuters' | '';

const type2scope = (type: string): Scope => {
  const candidate = type.replace('SET', '').toLowerCase();
  if (['global', 'union', 'country', 'region', 'local'].includes(candidate)) {
    return candidate as Scope;
  } else {
    return null;
  }
};

/**
 * @param ctx
 */
function setSupportCountry(ctx: TaxContext): void {
  ctx.supportCountry =
    ['country', 'region', 'local'].includes(ctx.scope) ||
    (ctx.scope === 'union' && ctx.supportOriginCountry);
}

/**
 * @param ctx
 * @param ev
 * @param ev.type
 */
function setSupportAutomatic(ctx: TaxContext, ev: { type: string }): void {
  const scope = type2scope(ev.type);
  if (scope) {
    ctx.supportAutomatic = ['union', 'country', 'region'].includes(scope);
  }
}

/**
 * Sets the value of supportShipping in the provided context.
 *
 * This function does not rely on any particular event, allowing it to be
 * triggered by any event.
 *
 * @param ctx the context to be modified to make supportShipping consistent.
 */
function setSupportShipping(ctx: TaxContext): void {
  let result = true;
  if (ctx.provider == 'taxjar') {
    result = false;
  } else {
    if (ctx.scope != 'union' && ['USCA', 'EU'].includes(ctx.country)) {
      result = false;
    }
  }
  ctx.supportShipping = result;
}

/**
 * @param ctx
 */
function setSupportProvider(ctx: TaxContext): void {
  ctx.supportProvider = ctx.supportAutomatic && ctx.mode === 'auto';
}

const setLocal = (ctx: TaxContext, ev: CustomEvent): void => {
  const scope = type2scope(ev.type);
  if (scope !== null) {
    ctx.supportRegion = ['region', 'local'].includes(scope);
    ctx.supportCity = ['local'].includes(scope);
    ctx.scope = scope;
    setSupportCountry(ctx);
    setSupportProvider(ctx);
  }
};

const setProviders = (ctx: TaxContext, ev: { type: string }): void => {
  const eur = ['CHOOSEEUROPE', 'SETUNION'];
  const eua = 'CHOOSEEUA';
  const aus = 'CHOOSEAUS';
  const relevant = ['CHOOSEANY', ...eur, eua];
  if (relevant.includes(ev.type)) {
    ctx.providerOptions = {
      avalara: true,
      onesource: true,
      taxjar: [...eur, eua, aus].includes(ev.type),
      thomsonreuters: [...eur, eua].includes(ev.type),
    };
  }
};

const setExempt = (ctx: TaxContext): void => {
  ctx.supportExempt = ctx.provider == 'taxjar' || ctx.mode == 'rate';
};

const providerActions = [
  setExempt,
  setSupportShipping,
  (ctx: TaxContext, ev: CustomEvent): void => {
    ctx.provider = ev.type.replace('CHOOSE', '').toLowerCase();
  },
];

const countryActions = [setProviders, setSupportShipping];

const scopeConfig = {
  actions: [setSupportAutomatic, setLocal, setExempt],
  target: 'scope',
};

const automaticConfig = {
  actions: providerActions,
  target: 'automatic',
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
    automatic: {
      entry: [setSupportProvider, createAction('mode', 'auto')],
      exit: [setSupportProvider],
      initial: 'regular',
      on: {
        CHOOSEAVALARA: automaticConfig,
        CHOOSEONESOURCE: automaticConfig,
        CHOOSETAXJAR: automaticConfig,
        CHOOSETHOMSONREUTERS: {
          ...automaticConfig,
          target: '.useOrigin',
        },
        RATE: {
          actions: [...providerActions],
          target: 'rate',
        },
      },
      states: {
        regular: {
          on: {
            CHOOSEORIGINRATES: 'useOrigin',
          },
        },
        useOrigin: {
          entry: [createAction('supportOriginCountry', true)],
          exit: [createAction('supportOriginCountry', false)],
          on: {
            CHOOSEREGULARRATES: 'regular',
          },
        },
      },
    },
    rate: {
      entry: [createAction('supportShipping', true), createAction('mode', 'rate')],
      on: {
        LIVE: {
          cond: (ctx: TaxContext): boolean => ctx.supportAutomatic,
          target: 'automatic',
        },
      },
    },
  },
};

const countryStates = {
  initial: 'any',
  states: {
    any: {
      entry: [createAction('country', 'any')],
      on: {
        CHOOSEAU: {
          actions: countryActions,
          cond: (ctx: TaxContext): boolean => ctx.supportCountry,
          target: 'australia',
        },
        CHOOSEEUA: {
          actions: countryActions,
          cond: (ctx: TaxContext): boolean => ctx.supportCountry,
          target: 'northWest.euaCan',
        },
        CHOOSEEUROPE: {
          actions: countryActions,
          cond: (ctx: TaxContext): boolean => ctx.supportCountry,
          target: 'northWest.europe',
        },
      },
    },
    australia: {
      entry: [createAction('country', 'AU')],
      on: {
        CHOOSEANY: {
          actions: countryActions,
          cond: (ctx: TaxContext): boolean => ctx.supportCountry,
          target: 'any',
        },
        CHOOSEEUA: {
          actions: countryActions,
          cond: (ctx: TaxContext): boolean => ctx.supportCountry,
          target: 'northWest.euaCan',
        },
        CHOOSEEUROPE: {
          actions: countryActions,
          cond: (ctx: TaxContext): boolean => ctx.supportCountry,
          target: 'northWest.europe',
        },
      },
    },
    northWest: {
      on: {
        CHOOSEANY: {
          actions: countryActions,
          cond: (ctx: TaxContext): boolean => ctx.supportCountry,
          target: 'any',
        },
        CHOOSEAU: {
          actions: countryActions,
          cond: (ctx: TaxContext): boolean => ctx.supportCountry,
          target: 'australia',
        },
      },
      states: {
        euaCan: {
          entry: [createAction('country', 'USCA')],
          on: {
            CHOOSEEUROPE: {
              actions: countryActions,
              cond: (ctx: TaxContext): boolean => ctx.supportCountry,
              target: 'europe',
            },
          },
        },
        europe: {
          entry: [createAction('country', 'EU')],
          on: {
            CHOOSEEUA: {
              actions: countryActions,
              cond: (ctx: TaxContext): boolean => ctx.supportCountry,
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
    country: '',
    mode: '',
    provider: '',
    providerOptions: {
      avalara: false,
      onesource: false,
      taxjar: false,
      thomsonreuters: false,
    },
    scope: 'global',
    supportAutomatic: false,
    supportCity: false,
    supportCountry: false,
    supportExempt: false,
    supportOrigin: false,
    supportOriginCountry: false,
    supportProvider: false,
    supportRegion: false,
    supportShipping: false,
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
