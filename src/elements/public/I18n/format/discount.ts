import { FormatFunction } from 'i18next';

type Value = { type: string; details: string };

/**
 * i18next formatter that returns a human-readable discount description for an API value.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const discount: FormatFunction = ({ type, details }: Value, format, lang): string => {
  const methods = ['allunits', 'incremental', 'repeat', 'single'];
  const factor = type.endsWith('_percentage') ? 0.01 : 1;
  const tiers = details.split('|');
  const method = methods.includes(tiers[0]) ? tiers.shift() : 'single';
  const i18nKey = `${method}_${type}_discount_summary`;

  const translatedTiers = tiers.map(tier => {
    const signIndex = /[-+]/.exec(tier)?.index ?? -1;
    const adjustment = parseFloat(tier.substring(signIndex)) * factor;
    const from = parseFloat(tier.substring(0, signIndex));

    return `$t(${i18nKey}, ${JSON.stringify({ adjustment, from })})`;
  });

  return translatedTiers.join('; ');
};
