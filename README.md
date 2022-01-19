# Foxy Elements 🦊🏗

Collection of [web components](https://developer.mozilla.org/docs/Web/Web_Components) powering the new front-end functionality at Foxy with built-in i18n and theming. Works with React, Vue, Svelte and more – or just on its own. Built with [LitElement](https://github.com/polymer/lit-element), [Tailwind](https://github.com/tailwindlabs/tailwindcss) and [Vaadin](https://github.com/vaadin/vaadin).

You can view all the components in various states, with plenty of examples, at [elements.foxy.dev](https://elements.foxy.dev/).

## Getting started

If you're targeting [browsers that support ES6](https://caniuse.com/#feat=es6), you can use modules to get started with no additional setup:

```html
<!-- 1. Load polyfills (optional); -->
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@^2/webcomponents-bundle.js"></script>

<!-- 2. Load element (replace "foxy-donation" with the one you need or add more script tags); -->
<script type="module" src="https://unpkg.com/@foxy.io/elements@1/dist/cdn/foxy-donation.js"></script>

<!-- 3. Use the element anywhere on your page. -->
<foxy-donation></foxy-donation>
```

When using a bundler, you have an option of registering elements with a custom name whenever it works for you in your use case. All public elements are available as named exports (PascalCase, no "Foxy" prefix).

```js
import { Donation } from '@foxy.io/elements';
customElements.define('my-donation', Donation);
```

This also works great with the [`ScopedElementsMixin`](https://open-wc.org/scoped-elements/) by open-wc.org:

```js
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Donation } from '@foxy.io/elements';

class MyElement extends ScopedElementsMixin(LitElement) {
  static get scopedElements() {
    return {
      'my-donation': Donation,
    };
  }
}
```

Please keep in mind that with this approach you'll also need to take care of loading polyfills and applying necessary optimizations before deploying to production.

If you use `es-dev-server`, you might run into a few issues depending on the components you import – those are most likely caused by how `xstate` is processed by the server. We've made a number of plugins ([one](./plugins/fix-xstate-chalk-imports.js), [two](./plugins/use-es-version-of-xstate.js), [three](./plugins/set-node-env.js)) to battle that. They're a bit hacky and may not work in every scenario, so we are not going to publish them on npm, but you can still use them as a starting point to bring your setup back in action.

## Development

To run this project locally, you'll need Node.JS installed on your machine. If you don't have it already, we suggest getting the latest LTS release from nodejs.org. Additionally, you can update npm (comes with Node.JS) to the latest version by running the following command in your Terminal:

```sh
npm install npm@latest -g
```

Once that's done, [clone](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) or download this repository, switch to the folder you placed it in and install the dependencies with npm:

```sh
npm install
```

There's a number of useful scripts that you might need:

- `npm run storybook` runs Storybook;
- `npm run format` fixes style errors in your code;
- `npm run lint` shows style errors in your code;
- `npm run test` runs all test suites with [Karma](https://github.com/karma-runner/karma);
