/** CSS reset adapted from github.com/necolas/normalize.css */
export const previewCSS = `
  <style>
    html {
      line-height: 1.15;
      -webkit-text-size-adjust: 100%;
    }

    body {
      margin: 0;
    }

    button,
    input,
    optgroup,
    select,
    textarea {
      font-family: inherit;
      font-size: 100%;
      line-height: 1.15;
      margin: 0;
    }

    button,
    input {
      overflow: visible;
    }

    button,
    select {
      text-transform: none;
    }

    button,
    [type="button"],
    [type="reset"],
    [type="submit"] {
      -webkit-appearance: button;
    }

    button::-moz-focus-inner,
    [type="button"]::-moz-focus-inner,
    [type="reset"]::-moz-focus-inner,
    [type="submit"]::-moz-focus-inner {
      border-style: none;
      padding: 0;
    }

    button:-moz-focusring,
    [type="button"]:-moz-focusring,
    [type="reset"]:-moz-focusring,
    [type="submit"]:-moz-focusring {
      outline: 1px dotted ButtonText;
    }

    fieldset {
      padding: 0.35em 0.75em 0.625em;
    }

    legend {
      box-sizing: border-box;
      color: inherit;
      display: table;
      max-width: 100%;
      padding: 0;
      white-space: normal;
    }

    textarea {
      overflow: auto;
    }

    [type="checkbox"],
    [type="radio"] {
      box-sizing: border-box;
      padding: 0;
    }

    [type="number"]::-webkit-inner-spin-button,
    [type="number"]::-webkit-outer-spin-button {
      height: auto;
    }

    [type="search"] {
      -webkit-appearance: textfield;
      outline-offset: -2px;
    }

    [type="search"]::-webkit-search-decoration {
      -webkit-appearance: none;
    }

    ::-webkit-file-upload-button {
      -webkit-appearance: button;
      font: inherit;
    }

    [hidden] {
      display: none;
    }

    html {
      color-scheme: light dark !important;
    }

    body {
      display: flex;
      padding: 2rem;
    }

    form {
      flex: 1;
      max-width: 20rem;
      font: normal 0.875rem system-ui;
      display: grid;
      grid-template-columns: auto 1fr;
      grid-gap: 0.5rem;
      align-items: center;
      margin: auto;
    }

    form:has(fieldset) {
      grid-gap: 1rem;
    }

    fieldset {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-gap: 0.5rem;
      grid-column: 1 / span 2;
      align-items: center;
      margin: 0;
    }

    legend {
      white-space: nowrap;
    }

    button {
      grid-column: 1 / span 2;
      margin-top: 0.5rem;
    }

    form:has(fieldset) button {
      margin-top: 0;
    }

    label {
      display: contents;
    }
  </style>
`;
