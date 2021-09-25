type Scope = 'global' | 'union' | 'country' | 'region' | 'local' | null;

type Provider = 'avalara' | 'onesource' | 'taxjar' | 'thomsonreuters' | '';

interface TaxContext {
  support: {
    automatic: boolean;
    city: boolean;
    country: boolean;
    exempt: boolean;
    origin: boolean;
    originCountry: boolean;
    provider: boolean;
    providerOptions: {
      avalara: boolean;
      onesource: boolean;
      taxjar: boolean;
      thomsonreuters: boolean;
    };
    region: boolean;
    shipping: boolean;
  };
  value: {
    scope: Scope;
    mode: string;
    provider: Provider;
    country: string;
  };
}

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
function updateSupport(ctx: TaxContext): void {
  setSupportScope(ctx);
  setSupportCountry(ctx);
  setSupportAutomatic(ctx);
  setSupportProvider(ctx);
  setSupportProviderOptions(ctx);
  setSupportOrigin(ctx);
  setSupportExempt(ctx);
  setSupportShipping(ctx);
  setSupportCountry(ctx);
}

/**
 * @param ctx
 */
function setSupportScope(ctx: TaxContext): void {
  ctx.support.region = ['region', 'local'].includes(ctx.value.scope!);
  ctx.support.city = ['local'].includes(ctx.value.scope!);
  if (['global', 'local'].includes(ctx.value.scope!)) {
    ctx.value.mode = 'rate';
  }
}

/**
 * @param ctx
 */
function setSupportCountry(ctx: TaxContext): void {
  ctx.support.country =
    ['country', 'region', 'local'].includes(ctx.value.scope!) ||
    (ctx.value.scope === 'union' &&
      ctx.support.originCountry &&
      ctx.value.provider == 'thomsonreuters');
}

/**
 * Sets the value of support.automatic in the provided context.
 *
 * @param ctx the current context to be used to evaluate the support for automatic.
 * @param ev the event that has triggered a state change
 * @param ev.type the type of the event
 */
function setSupportAutomatic(ctx: TaxContext): void {
  ctx.support.automatic = ['union', 'country', 'region'].includes(ctx.value.scope!);
}

/**
 * @param ctx
 */
function setSupportProvider(ctx: TaxContext): void {
  ctx.support.provider = ctx.support.automatic && ctx.value.mode === 'auto';
}

/**
 * @param ctx
 */
function setSupportOrigin(ctx: TaxContext): void {
  ctx.support.origin = ctx.value.scope === 'union' && ctx.value.provider === 'thomsonreuters';
}

/**
 * @param ctx
 */
function setSupportExempt(ctx: TaxContext): void {
  ctx.support.exempt = ctx.value.provider == 'taxjar' || ctx.value.mode == 'rate';
}

/**
 * Sets the value of support.shipping in the provided context.
 *
 * This function does not rely on any particular event, allowing it to be
 * triggered by any event.
 *
 * @param ctx the context to be modified to make support.shipping consistent.
 */
function setSupportShipping(ctx: TaxContext): void {
  let result = true;
  if (ctx.value.provider == 'taxjar') {
    result = false;
  } else {
    if (ctx.value.scope != 'union' && ['usa', 'eur'].includes(ctx.value.country)) {
      result = false;
    }
  }
  ctx.support.shipping = result;
}

const setLocal = (ctx: TaxContext, ev: CustomEvent): void => {
  const scope = type2scope(ev.type);
  if (scope !== null) {
    ctx.value.scope = scope;
  }
};

const setSupportProviderOptions = (ctx: TaxContext): void => {
  ctx.support.providerOptions = {
    avalara: true,
    onesource: true,
    taxjar: ['eur', 'usa', 'aus'].includes(ctx.value.country),
    thomsonreuters: ['eur', 'usa'].includes(ctx.value.country),
  };
};

const scopeConfig = {
  actions: [setLocal, updateSupport],
  target: 'scope',
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

const providerActions = [
  (ctx: TaxContext, ev: CustomEvent): void => {
    ctx.value.provider = ev.type.replace('CHOOSE', '').toLowerCase() as Provider;
  },
];

const automaticConfig = {
  actions: providerActions,
  target: 'automatic',
};

const modeStates = {
  initial: 'rate',
  states: {
    automatic: {
      entry: [(ctx: TaxContext): string => (ctx.value.mode = 'auto'), updateSupport],
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
          entry: [(ctx: TaxContext): boolean => (ctx.support.originCountry = true)],
          exit: [(ctx: TaxContext): boolean => (ctx.support.originCountry = false)],
          on: {
            CHOOSEREGULARRATES: 'regular',
          },
        },
      },
    },
    rate: {
      entry: [(ctx: TaxContext): string => (ctx.value.mode = 'rate'), updateSupport],
      on: {
        LIVE: {
          cond: (ctx: TaxContext): boolean => ctx.support.automatic,
          target: 'automatic',
        },
      },
    },
  },
};

const countryActions = [
  (ctx: TaxContext, ev: { type: string }): void => {
    const countryAction = {
      CHOOSEANY: 'any',
      CHOOSEAU: 'aus',
      CHOOSEEUROPE: 'eur',
      CHOOSEUSA: 'usa',
      SETUNION: 'eur',
    };
    ctx.value.country = (countryAction as any)[ev.type];
  },
];

const countryStates = {
  initial: 'any',
  states: {
    any: {
      entry: [...countryActions, updateSupport],
      on: {
        CHOOSEAU: {
          cond: (ctx: TaxContext): boolean => ctx.support.country,
          target: 'australia',
        },
        CHOOSEEUROPE: {
          cond: (ctx: TaxContext): boolean => ctx.support.country,
          target: 'northWest.europe',
        },
        CHOOSEUSA: {
          cond: (ctx: TaxContext): boolean => ctx.support.country,
          target: 'northWest.euaCan',
        },
      },
    },
    australia: {
      entry: [...countryActions, updateSupport],
      on: {
        CHOOSEANY: {
          cond: (ctx: TaxContext): boolean => ctx.support.country,
          target: 'any',
        },
        CHOOSEEUROPE: {
          cond: (ctx: TaxContext): boolean => ctx.support.country,
          target: 'northWest.europe',
        },
        CHOOSEUSA: {
          cond: (ctx: TaxContext): boolean => ctx.support.country,
          target: 'northWest.euaCan',
        },
      },
    },
    northWest: {
      entry: [...countryActions, updateSupport],
      on: {
        CHOOSEANY: {
          cond: (ctx: TaxContext): boolean => ctx.support.country,
          target: 'any',
        },
        CHOOSEAU: {
          cond: (ctx: TaxContext): boolean => ctx.support.country,
          target: 'australia',
        },
      },
      states: {
        euaCan: {
          on: {
            CHOOSEEUROPE: {
              cond: (ctx: TaxContext): boolean => ctx.support.country,
              target: 'europe',
            },
          },
        },
        europe: {
          on: {
            CHOOSEUSA: {
              cond: (ctx: TaxContext): boolean => ctx.support.country,
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
    support: {
      automatic: false,
      city: false,
      country: false,
      exempt: false,
      origin: false,
      originCountry: false,
      provider: false,
      providerOptions: {
        avalara: false,
        onesource: false,
        taxjar: false,
        thomsonreuters: false,
      },
      region: false,
      shipping: false,
    },
    value: {
      country: '',
      mode: '',
      provider: '',
      scope: 'global',
    },
  },
  id: 'taxMachine',
  states: {
    country: countryStates,
    mode: modeStates,
    scope: scopeStates,
  },
  type: 'parallel',
};
