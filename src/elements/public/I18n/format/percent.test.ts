import { expect } from '@open-wc/testing';
import { percent } from './percent';

describe('I18n', () => {
  describe('format', () => {
    describe('percent', () => {
      it('formats whole percentages without decimals', () => {
        expect(percent(0.09, undefined, 'en')).to.equal('9%');
      });

      it('keeps fractional percentages instead of rounding them', () => {
        expect(percent(0.066, undefined, 'en')).to.equal('6.6%');
        expect(percent(0.08875, undefined, 'en')).to.equal('8.875%');
      });

      it('allows overriding fraction digits via options', () => {
        expect(percent(0.066, undefined, 'en', { maximumFractionDigits: 0 })).to.equal('7%');
      });

      it('returns non-numeric values as strings', () => {
        expect(percent('foo', undefined, 'en')).to.equal('foo');
      });
    });
  });
});
