# Contribution Guidelines

This document outlines various standards and development guidelines used by Team Foxy. We encourage other contributors to follow these rules as well.

## Public components

Public components are the ones included in the library export. When you add a public component, make sure that:

1. It has a Storybook page with docs examples;
2. Its class name starts with `Foxy` and ends with `Element` (e.g. `FoxySubscriptionsElement`);
3. Its class has a readonly static property named `defaultNodeName` containing node name with which it will be registered in the global custom element registry by default. Make sure it starts with `foxy` (e.g. `foxy-subscription`);
4. It has its own folder under `src/public` matching the class name, where all the docs and files are located. The structure will look like this:

```
src
  public
    FoxySubscriptionsElement                # element folder
      FoxySubscriptionsElement.ts           # element class export
      FoxySubscriptionsElement.test.ts      # tests (main file – add more .test.ts files if needed)
      FoxySubscriptionsElement.stories.mdx  # storybook docs page
      index.ts                              # main export registering element with default node name
```

Main export (`index.ts`) MUST check if node name has already been taken before attempting to register. This is necessary to avoid errors and enable library consumers to customize elements across the entire library. For example, a developer may import the element class from `./src/public/FoxySubscriptionsElement/FoxySubscriptionsElement.ts`, extend it with additional functionality and register it under the default name before loading the rest of the elements. If they then use our `<foxy-customer>` component, it will display their custom version of `<foxy-subscriptions>` even though we use scoped element registries internally.

Main export MUST export element class after attempting to register the custom element. An info-level message SHOULD be logged to console if registration fails.

Here's an example of what `index.ts` might look like (note the use of `define()` utility):

```ts
import { FoxySubscriptionsElement } from './FoxySubscriptionsElement';
import { define } from '../../../utils/define';

define(FoxySubscriptionsElement);

export { FoxySubscriptionsElement };
```

In library code, public elements MUST be added to scoped registry like so:

```ts
import { FoxySubscriptionsElement } from '@/public/FoxySubscriptionsElement';

class MyElement extends HTMLElement {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-subscriptions': customElements.get(FoxySubscriptionsElement.defaultNodeName),
    };
  }
}
```

A few things to note here:

1. Import from `index.ts` that automatically registers the element if needed;
2. Use string literal to specify scoped tag name, but try to keep it the same as the default node name for that element. We can't (and shouldn't tbh) do dynamic node names with `lit-html`, so making it a dynamic property could be a bit misleading. You're free to use a different scoped node name if you need, but if you don't, it's generally best to use the default for consistency.
3. Get class constructor from the global element registry using the `defaultNodeName` (as opposed to the class import) to enable library consumers to customize public elements across the entire package.
