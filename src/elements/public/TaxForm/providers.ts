interface taxProvider {
  name: string;
  supportCountries: 'all' | string[];
  supportServiceAccount: boolean;
}

const union_countries = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GB',
  'GR',
  'HR',
  'HU',
  'IE',
  'IM',
  'IT',
  'LT',
  'LU',
  'LV',
  'MC',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
];

export const providers: taxProvider[] = [
  {
    name: 'avalara',
    supportCountries: 'all',
    supportServiceAccount: true,
  },
  {
    name: 'thomsonreuters',
    supportCountries: 'all',
    supportServiceAccount: false,
  },
  {
    name: 'taxjar',
    supportCountries: [...union_countries, 'AU', 'CA', 'US'],
    supportServiceAccount: true,
  },
  {
    name: 'onesource',
    supportCountries: 'all',
    supportServiceAccount: true,
  },
];

export const taxProviders = ['avalara', 'thomsonreuters', 'taxjar', 'onesource'];

/**
function CheckHidden() {
  var taxType = $j("select.tax_type");
  var country = $j("#tax_country").val();
  if (country == "") {
    country = "US";
    $j("#tax_country_name").val("United States");
    $j("#tax_country").val("US");
  }
  var taxIsLive = ($j("input[name=tax_is_live]:checked").val() == "1");
  var useOriginRates = ($j("input[name=use_origin_rates]:checked").val() == "1");
 
  var supportsLiveTaxes = true;
  var supportsCustomTaxRate = true;
  var supportsApplyToShipping = true;
  var supportsDefaultLiveRates = false;
  var supportsOriginRates = false;
  var supportsServiceAccount = false;
  var showCity = false;
  var showRegion = true;
  var showCountry = true;
  var showExemptAllCustomerTaxIds = true;
  var validCountryForTaxJar = false;
 
  var union_countres = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IM', 'IT', 'LV', 'LT', 'LU', 'MC', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB'];
  var live_rate_supported_countries = ["US", "CA"];
  var taxJarSupportedcountries = union_countres.concat(live_rate_supported_countries).concat(["AU"]);
  if ($j.inArray(country, union_countres) > -1 || $j.inArray(country, live_rate_supported_countries) > -1 || taxType.val() == "union") {
    supportsDefaultLiveRates = true;
  }
  if ($j.inArray(country, taxJarSupportedcountries) > -1) {
    validCountryForTaxJar = true;
  }
  $j("#service_provider option").removeAttr("disabled");
  if (!validCountryForTaxJar) {
    $j("#service_provider option[value='taxjar']").attr("disabled", "disabled");
    if ($j("#service_provider").val() == "taxjar") {
      $j("#service_provider").val("avalara");
    }
  }
  if (!supportsDefaultLiveRates) {
    $j("#service_provider option[value='']").attr("disabled", "disabled");
    if ($j("#service_provider").val() == "") {
      $j("#service_provider").val("avalara");
    }
  }
  if ($j("#service_provider").val() == "avalara" || $j("#service_provider").val() == "taxjar" || $j("#service_provider").val() == "onesource") {
    supportsServiceAccount = true;
  }
 
  switch (taxType.val()) {
    case "local":
      supportsLiveTaxes = false;
      showCity = true;
      break;
    case "region":
      break;
    case "country":
      showRegion = false;
      break;
    case "union":
      showRegion = false;
      showCountry = false;
      if (taxIsLive && !supportsServiceAccount) {
        supportsOriginRates = true;
        if (useOriginRates) {
          showCountry = true;
        }
      }
      break;
    case "global":
      showRegion = false;
      showCountry = false;
      supportsLiveTaxes = false;
      break;
  }
 
  if (supportsLiveTaxes && taxIsLive) {
    supportsCustomTaxRate = false;
    if ($j("#service_provider").val() == "taxjar" || (supportsDefaultLiveRates && taxType.val() != "union")) {
      supportsApplyToShipping = false;
    }
  }
 
  var showProviderConfig = supportsLiveTaxes && taxIsLive && supportsServiceAccount;
  showExemptAllCustomerTaxIds = !showProviderConfig;
 
  if ($j("#service_provider").val() == "taxjar") {
    showExemptAllCustomerTaxIds = true;
  }
 
  $j(".tax_is_live").toggle(supportsLiveTaxes);
  $j(".service_provider").toggle(supportsLiveTaxes && taxIsLive);
  $j(".provider_config").toggle(showProviderConfig);
  $j(".provider_config_avalara").toggle($j("#service_provider").val() == "avalara");
  $j(".provider_config_taxjar").toggle($j("#service_provider").val() == "taxjar");
  $j(".provider_config_onesource").toggle($j("#service_provider").val() == "onesource");
  $j(".exempt_all_customer_tax_ids").toggle(showExemptAllCustomerTaxIds);
  $j(".tax_rate").toggle(supportsCustomTaxRate);
  $j(".tax_applies_to_shipping").toggle(supportsApplyToShipping);
  $j(".use_origin_rates").toggle(supportsOriginRates);
  $j(".city").toggle(showCity);
  $j(".region").toggle(showRegion);
  $j(".country").toggle(showCountry);
}
 
 **/
