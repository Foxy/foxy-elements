declare module '@vaadin/vaadin-overlay/src/vaadin-overlay-position-mixin';

declare module 'uainfer/src/uainfer.js' {
  function analyze(ua: string): { toString: () => string };
  function scan(ua: string): { name: string; version: string }[];
  const version: string;

  export { version, analyze, scan };
}
