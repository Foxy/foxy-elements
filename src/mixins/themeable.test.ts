import './themeable';

import { expect } from '@open-wc/testing';

/** Resolves a CSS color (including `var()` references) to `rgb(...)` via a probe element. */
function resolve(color: string): number[] {
  const probe = document.createElement('div');
  probe.style.color = color;
  document.body.append(probe);
  const rgb = getComputedStyle(probe)
    .color.match(/\d+(\.\d+)?/g)!
    .slice(0, 3)
    .map(Number);
  probe.remove();
  return rgb;
}

function contrast(a: number[], b: number[]): number {
  const luminance = (c: number[]) => {
    const [r, g, b] = c.map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => m - n);
  return (y + 0.05) / (x + 0.05);
}

function withStyle(css: string, position: 'start' | 'end', test: () => void) {
  const style = document.createElement('style');
  style.textContent = css;
  position === 'start' ? document.head.prepend(style) : document.head.append(style);

  try {
    test();
  } finally {
    style.remove();
  }
}

describe('ThemeableMixin', () => {
  describe('Lumo AA colors', () => {
    const white = [255, 255, 255];

    it('inserts the AA colors right after the Lumo color declaration', () => {
      const style = document.getElementById('foxy-lumo-aa-colors');
      const lumo = style?.previousElementSibling;

      expect(style).to.exist;
      expect(lumo?.localName).to.equal('custom-style');
      expect(lumo?.textContent).to.include('--lumo-primary-color:');
      expect(document.querySelectorAll('#foxy-lumo-aa-colors')).to.have.length(1);
    });

    it('meets 4.5:1 for text colors on white', () => {
      ['--lumo-primary-text-color', '--lumo-error-text-color', '--lumo-success-text-color'].forEach(
        token => expect(contrast(resolve(`var(${token})`), white), token).to.be.at.least(4.5)
      );
    });

    it('meets 4.5:1 for white text on button colors', () => {
      ['--lumo-primary-color', '--lumo-error-color', '--lumo-success-color'].forEach(token =>
        expect(contrast(resolve(`var(${token})`), white), token).to.be.at.least(4.5)
      );
    });

    it('lets a merchant :root override win even when it comes before Lumo', () => {
      withStyle(':root { --lumo-primary-color: rgb(1, 2, 3); }', 'start', () => {
        expect(resolve('var(--lumo-primary-color)')).to.deep.equal([1, 2, 3]);
      });
    });

    it('lets a merchant html override win when it comes after Lumo', () => {
      withStyle('html { --lumo-error-text-color: rgb(4, 5, 6); }', 'end', () => {
        expect(resolve('var(--lumo-error-text-color)')).to.deep.equal([4, 5, 6]);
      });
    });

    it('keeps primary text following a merchant primary color', () => {
      withStyle(':root { --lumo-primary-color: rgb(7, 8, 9); }', 'end', () => {
        expect(resolve('var(--lumo-primary-text-color)')).to.deep.equal([7, 8, 9]);
      });
    });
  });
});
