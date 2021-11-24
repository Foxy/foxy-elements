export const regionsUS = {
  _links: {
    'curies': [{ name: 'fx', href: 'https://api.foxycart.com/rels/{rel}', templated: true }],
    'self': {
      href: 'https://demo.foxycart.com/s/admin/property_helpers/regions',
      title:
        'List of valid region values. It defaults to US states, but you can filter for other country states using ?country_code=<valid country code>',
    },
    'fx:countries': {
      href: 'https://demo.foxycart.com/s/admin/property_helpers/countries',
      title:
        'List of valid country values for any country setting such as the Store resource store_country.',
    },
    'fx:property_helpers': {
      href: 'https://demo.foxycart.com/s/admin/property_helpers',
      title: 'Property Helpers Home',
    },
  },
  message:
    'The values listed here are the correct values for the Store store_state field for the given country code. The values are listed in the format value => description. If no values are specified, any store_state value can be used for this country code.',
  values: {
    AL: { default: 'Alabama', code: 'AL', alternate_values: [], boost: 1, active: true },
    AK: { default: 'Alaska', code: 'AK', alternate_values: [], boost: 1, active: true },
    AS: { default: 'American Samoa', code: 'AS', alternate_values: [], boost: 1, active: true },
    AZ: { default: 'Arizona', code: 'AZ', alternate_values: [], boost: 1, active: true },
    AR: { default: 'Arkansas', code: 'AR', alternate_values: [], boost: 1, active: true },
    AF: {
      default: 'Armed Forces Africa',
      code: 'AF',
      alternate_values: [],
      boost: 0.4,
      active: true,
    },
    AA: {
      default: 'Armed Forces Americas',
      code: 'AA',
      alternate_values: [],
      boost: 0.4,
      active: true,
    },
    AC: {
      default: 'Armed Forces Canada',
      code: 'AC',
      alternate_values: [],
      boost: 0.4,
      active: true,
    },
    AE: {
      default: 'Armed Forces Europe',
      code: 'AE',
      alternate_values: [],
      boost: 0.4,
      active: true,
    },
    AM: {
      default: 'Armed Forces Middle East',
      code: 'AM',
      alternate_values: [],
      boost: 0.4,
      active: true,
    },
    AP: {
      default: 'Armed Forces Pacific',
      code: 'AP',
      alternate_values: [],
      boost: 0.4,
      active: true,
    },
    CA: { default: 'California', code: 'CA', alternate_values: [], boost: 1, active: true },
    CO: { default: 'Colorado', code: 'CO', alternate_values: [], boost: 1, active: true },
    CT: { default: 'Connecticut', code: 'CT', alternate_values: [], boost: 1, active: true },
    DE: { default: 'Delaware', code: 'DE', alternate_values: [], boost: 1, active: true },
    DC: {
      default: 'Washington DC',
      code: 'DC',
      alternate_values: ['District of Columbia'],
      boost: 1,
      active: true,
    },
    FM: {
      default: 'Federated States Of Micronesia',
      code: 'FM',
      alternate_values: [],
      boost: 1,
      active: true,
    },
    FL: { default: 'Florida', code: 'FL', alternate_values: [], boost: 1, active: true },
    GA: { default: 'Georgia', code: 'GA', alternate_values: [], boost: 1, active: true },
    GU: { default: 'Guam', code: 'GU', alternate_values: [], boost: 1, active: true },
    HI: { default: 'Hawaii', code: 'HI', alternate_values: [], boost: 1, active: true },
    ID: { default: 'Idaho', code: 'ID', alternate_values: [], boost: 1, active: true },
    IL: { default: 'Illinois', code: 'IL', alternate_values: [], boost: 1, active: true },
    IN: { default: 'Indiana', code: 'IN', alternate_values: [], boost: 1, active: true },
    IA: { default: 'Iowa', code: 'IA', alternate_values: [], boost: 1, active: true },
    KS: { default: 'Kansas', code: 'KS', alternate_values: [], boost: 1, active: true },
    KY: { default: 'Kentucky', code: 'KY', alternate_values: [], boost: 1, active: true },
    LA: { default: 'Louisiana', code: 'LA', alternate_values: [], boost: 1, active: true },
    ME: { default: 'Maine', code: 'ME', alternate_values: [], boost: 1, active: true },
    MH: { default: 'Marshall Islands', code: 'MH', alternate_values: [], boost: 1, active: true },
    MD: { default: 'Maryland', code: 'MD', alternate_values: [], boost: 1, active: true },
    MA: { default: 'Massachusetts', code: 'MA', alternate_values: [], boost: 1, active: true },
    MI: { default: 'Michigan', code: 'MI', alternate_values: [], boost: 1, active: true },
    MN: { default: 'Minnesota', code: 'MN', alternate_values: [], boost: 1, active: true },
    MS: { default: 'Mississippi', code: 'MS', alternate_values: [], boost: 1, active: true },
    MO: { default: 'Missouri', code: 'MO', alternate_values: [], boost: 1, active: true },
    MT: { default: 'Montana', code: 'MT', alternate_values: [], boost: 1, active: true },
    NE: { default: 'Nebraska', code: 'NE', alternate_values: [], boost: 1, active: true },
    NV: { default: 'Nevada', code: 'NV', alternate_values: [], boost: 1, active: true },
    NH: { default: 'New Hampshire', code: 'NH', alternate_values: [], boost: 1, active: true },
    NJ: { default: 'New Jersey', code: 'NJ', alternate_values: [], boost: 1, active: true },
    NM: { default: 'New Mexico', code: 'NM', alternate_values: [], boost: 1, active: true },
    NY: { default: 'New York', code: 'NY', alternate_values: [], boost: 1, active: true },
    NC: { default: 'North Carolina', code: 'NC', alternate_values: [], boost: 1, active: true },
    ND: { default: 'North Dakota', code: 'ND', alternate_values: [], boost: 1, active: true },
    MP: {
      default: 'Northern Mariana Islands',
      code: 'MP',
      alternate_values: [],
      boost: 1,
      active: true,
    },
    OH: { default: 'Ohio', code: 'OH', alternate_values: [], boost: 1, active: true },
    OK: { default: 'Oklahoma', code: 'OK', alternate_values: [], boost: 1, active: true },
    OR: { default: 'Oregon', code: 'OR', alternate_values: [], boost: 1, active: true },
    PA: { default: 'Pennsylvania', code: 'PA', alternate_values: [], boost: 1, active: true },
    PR: { default: 'Puerto Rico', code: 'PR', alternate_values: [], boost: 1, active: true },
    RI: { default: 'Rhode Island', code: 'RI', alternate_values: [], boost: 1, active: true },
    SC: { default: 'South Carolina', code: 'SC', alternate_values: [], boost: 1, active: true },
    SD: { default: 'South Dakota', code: 'SD', alternate_values: [], boost: 1, active: true },
    TN: { default: 'Tennessee', code: 'TN', alternate_values: [], boost: 1, active: true },
    TX: { default: 'Texas', code: 'TX', alternate_values: [], boost: 1, active: true },
    UT: { default: 'Utah', code: 'UT', alternate_values: [], boost: 1, active: true },
    VT: { default: 'Vermont', code: 'VT', alternate_values: [], boost: 1, active: true },
    VI: { default: 'Virgin Islands', code: 'VI', alternate_values: [], boost: 1, active: true },
    VA: { default: 'Virginia', code: 'VA', alternate_values: [], boost: 1, active: true },
    WA: { default: 'Washington', code: 'WA', alternate_values: [], boost: 1, active: true },
    WV: { default: 'West Virginia', code: 'WV', alternate_values: [], boost: 1, active: true },
    WI: { default: 'Wisconsin', code: 'WI', alternate_values: [], boost: 1, active: true },
    WY: { default: 'Wyoming', code: 'WY', alternate_values: [], boost: 1, active: true },
  },
};
