import type {
  ProductModifier,
  ProductModifierRemoval,
  ProductOption,
  ProductOptionValue,
} from './types';

/** The API's limits for options and modifiers. */
export const LIMITS = {
  options: 3,
  values: 100,
  modifiers: 25,
  variants: 250,
  nameLength: 50,
  labelLength: 100,
  valueLength: 100,
  skuCodeLength: 20,
  categoryCodeLength: 50,
  maxLengthMax: 1000,
  maxLengthDefault: 255,
};

// The cart's own parameters, which an option or modifier name would collide with.
const RESERVED = new Set([
  'sku',
  'name',
  'price',
  'code',
  'parent_code',
  'quantity',
  'quantity_min',
  'quantity_max',
  'weight',
  'length',
  'width',
  'height',
  'category',
  'image',
  'url',
  'expires',
  'shipto',
  'sub_frequency',
  'sub_startdate',
  'sub_enddate',
  'sub_cancel',
  'sub_token',
  'sub_modify',
  'sub_restart',
  'coupon',
  'gift_card',
  'cart',
  'empty',
  'output',
  'redirect',
  'callback',
  'fcsid',
  'is_anonymous',
  'template_set',
  'h',
  'x',
]);

const RESERVED_PREFIXES = ['discount_', 'utm_', 'klarna_'];

/** An error found in options or modifiers: a translation key, and where it applies. */
export interface CatalogError {
  /** `options`, `options.0.name`, `options.0.values.2.sku_code`, `modifiers.1.values`… */
  path: string;
  code: string;
}

export function isReservedName(name: string): boolean {
  return (
    RESERVED.has(name) ||
    RESERVED_PREFIXES.some(prefix => name.startsWith(prefix)) ||
    /^[0-9]/.test(name)
  );
}

export function isRemoval(
  modifier: ProductModifier | ProductModifierRemoval
): modifier is ProductModifierRemoval {
  return (modifier as ProductModifierRemoval).remove === true;
}

/**
 * The compiled modifiers: the inherited ones, then this product's own by name.
 * A new name is appended, an inherited name is replaced in place, and a
 * removal drops it.
 */
export function mergeModifiers(
  inherited: ProductModifier[],
  own: (ProductModifier | ProductModifierRemoval)[]
): ProductModifier[] {
  const result = [...inherited];
  for (const modifier of own) {
    const index = result.findIndex(m => m.name === modifier.name);
    if (isRemoval(modifier)) {
      if (index !== -1) result.splice(index, 1);
    } else if (index === -1) {
      result.push(modifier);
    } else {
      result[index] = modifier;
    }
  }
  return result;
}

function checkName(name: string | undefined, path: string, errors: CatalogError[]) {
  if (!name) return errors.push({ path, code: 'v8n_name_required' });
  if (name.length > LIMITS.nameLength) return errors.push({ path, code: 'v8n_name_too_long' });
  if (!/^[a-z0-9_]+$/.test(name)) return errors.push({ path, code: 'v8n_name_invalid' });
  if (isReservedName(name)) return errors.push({ path, code: 'v8n_name_reserved' });
}

function checkLabel(label: string | undefined, path: string, errors: CatalogError[]) {
  if (label && label.length > LIMITS.labelLength) errors.push({ path, code: 'v8n_label_too_long' });
}

function isDecimal(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  return typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim());
}

function checkAmounts(
  item: { price_mod?: number | string; weight_mod?: number },
  path: string,
  errors: CatalogError[]
) {
  if (item.price_mod !== undefined && !isDecimal(item.price_mod)) {
    errors.push({ path: `${path}.price_mod`, code: 'v8n_amount_invalid' });
  }
  if (item.weight_mod !== undefined && !Number.isFinite(item.weight_mod)) {
    errors.push({ path: `${path}.weight_mod`, code: 'v8n_amount_invalid' });
  }
}

function checkValues(
  values: { value: string; label?: string }[] | undefined,
  path: string,
  errors: CatalogError[],
  checkValue: (value: any, path: string) => void
) {
  if (!values?.length) return errors.push({ path: `${path}.values`, code: 'v8n_values_required' });
  if (values.length > LIMITS.values) {
    errors.push({ path: `${path}.values`, code: 'v8n_values_too_many' });
  }

  const seen = new Set<string>();
  values.forEach((value, index) => {
    const valuePath = `${path}.values.${index}`;
    const key = (value.value ?? '').trim().toLowerCase();
    if (!value.value?.trim()) {
      errors.push({ path: `${valuePath}.value`, code: 'v8n_value_required' });
    } else if (value.value.length > LIMITS.valueLength) {
      errors.push({ path: `${valuePath}.value`, code: 'v8n_value_too_long' });
    } else if (seen.has(key)) {
      errors.push({ path: `${valuePath}.value`, code: 'v8n_value_duplicate' });
    }
    seen.add(key);
    checkLabel(value.label, `${valuePath}.label`, errors);
    checkAmounts(value as any, valuePath, errors);
    checkValue(value, valuePath);
  });
}

/**
 * Checks options against the contract. `otherNames` are the modifier names
 * the product ends up with, which options can't share.
 */
export function validateOptions(
  options: ProductOption[] | undefined,
  otherNames: string[] = []
): CatalogError[] {
  const errors: CatalogError[] = [];
  if (!options?.length) return errors;
  if (options.length > LIMITS.options) errors.push({ path: 'options', code: 'v8n_too_many' });

  const names = new Set<string>();
  options.forEach((option, index) => {
    const path = `options.${index}`;
    const errorCount = errors.length;
    checkName(option.name, `${path}.name`, errors);
    if (errors.length === errorCount) {
      if (names.has(option.name)) errors.push({ path: `${path}.name`, code: 'v8n_name_duplicate' });
      else if (otherNames.includes(option.name)) {
        errors.push({ path: `${path}.name`, code: 'v8n_name_used_by_modifier' });
      }
    }
    names.add(option.name);
    checkLabel(option.label, `${path}.label`, errors);

    checkValues(option.values, path, errors, (value: ProductOptionValue, valuePath) => {
      if (value.sku_code && !/^[A-Za-z0-9]{1,20}$/.test(value.sku_code)) {
        errors.push({ path: `${valuePath}.sku_code`, code: 'v8n_sku_code_invalid' });
      }
      if (value.color && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.color)) {
        errors.push({ path: `${valuePath}.color`, code: 'v8n_color_invalid' });
      }
      if (value.image && !/^https:\/\/\S+$/.test(value.image.src ?? '')) {
        errors.push({ path: `${valuePath}.image`, code: 'v8n_image_invalid' });
      }
    });
  });

  return errors;
}

/**
 * Checks this product's own modifiers against the contract. `inherited` are
 * the compiled modifiers it inherits; `optionNames` the options it has.
 */
export function validateModifiers(
  own: (ProductModifier | ProductModifierRemoval)[] | undefined,
  inherited: ProductModifier[] = [],
  optionNames: string[] = []
): CatalogError[] {
  const errors: CatalogError[] = [];
  if (!own?.length) return errors;
  if (mergeModifiers(inherited, own).length > LIMITS.modifiers) {
    errors.push({ path: 'modifiers', code: 'v8n_too_many' });
  }

  const names = new Set<string>();
  own.forEach((modifier, index) => {
    const path = `modifiers.${index}`;
    const errorCount = errors.length;
    checkName(modifier.name, `${path}.name`, errors);
    if (errors.length === errorCount) {
      if (names.has(modifier.name)) {
        errors.push({ path: `${path}.name`, code: 'v8n_name_duplicate' });
      } else if (optionNames.includes(modifier.name)) {
        errors.push({ path: `${path}.name`, code: 'v8n_name_used_by_option' });
      }
    }
    names.add(modifier.name);
    if (isRemoval(modifier)) return;

    checkLabel(modifier.label, `${path}.label`, errors);
    if (modifier.type === 'text') {
      const max = modifier.max_length;
      if (max !== undefined && (!Number.isInteger(max) || max < 1 || max > LIMITS.maxLengthMax)) {
        errors.push({ path: `${path}.max_length`, code: 'v8n_max_length_invalid' });
      }
      checkAmounts(modifier, path, errors);
    } else if (modifier.type === 'select') {
      checkValues(modifier.values, path, errors, (value, valuePath) => {
        if ((value.category_code ?? '').length > LIMITS.categoryCodeLength) {
          errors.push({ path: `${valuePath}.category_code`, code: 'v8n_category_code_too_long' });
        }
      });
    } else {
      errors.push({ path: `${path}.type`, code: 'v8n_type_required' });
    }
  });

  return errors;
}

/** Fallback SKU code for a value, as the API derives it. */
export function defaultSkuCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
}

/** `https://{host}/cart?sku=…&name=value…`, every name and value percent-encoded. */
export function buildCartLink(host: string, sku: string, params: [string, string][] = []): string {
  const query = [['sku', sku], ...params]
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('&');
  return `https://${host}/cart?${query}`;
}

/** The API's default SKU pattern: the parent's SKU, then each option's code in declared order. */
export function defaultSkuPattern(options: ProductOption[]): string {
  return ['{parent}', ...options.map(option => `{${option.name}}`)].join('-');
}

/** The SKU a pattern gives the first value of every option, as an example. */
export function exampleSku(pattern: string, parentSku: string, options: ProductOption[]): string {
  return options.reduce((sku, option) => {
    const value = option.values[0];
    const code = value?.sku_code || defaultSkuCode(value?.value ?? '');
    return sku.split(`{${option.name}}`).join(code);
  }, pattern.split('{parent}').join(parentSku));
}

/** How many variants every combination of the options makes. */
export function combinationCount(options: ProductOption[]): number {
  return options.reduce((count, option) => count * (option.values?.length ?? 0), 1);
}
