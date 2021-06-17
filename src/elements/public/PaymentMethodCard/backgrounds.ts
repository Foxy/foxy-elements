import { unsafeCSS } from 'lit-element';

const pattern = unsafeCSS(`
  repeating-radial-gradient(
    circle at -100% 500%,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.05) 4px
  )
`);

const colors = {
  amex: '#2557d6',
  diners: '#0079be',
  discover: '#4d4d4d',
  jcb: '#0e4c96',
  maestro: '#181818',
  mastercard: '#16366f',
  unionpay: '#0dadb5',
  unknown: '#797c85',
  visa: '#0e4595',
};

export const backgrounds = unsafeCSS(
  Object.entries(colors)
    .map(([card, color]) => `.bg-${card} { background: ${color} ${pattern} }`)
    .join(' ')
);
