# Adding an Element

This page will guide you through the process of adding a new element to the library, explain the existing conventions and provide helpful tips along the way.

## File Structure

Think of a name for your new element. As a convention, we categorize them into 4 groups: cards (name ends with "card"), forms ("form"), tables ("table") and other (no suffix). The main part of the name is usually a [hAPI relation](https://api.foxycart.com/docs/reference) like `custom_field`. Convert that name to PascalCase and create the following folder structure (we'll be using custom field as an example here and below):

```text
src/elements/public/CustomFieldForm
  CustomFieldForm.ts          # element class
  CustomFieldForm.stories.ts  # storybook docs
  CustomFieldForm.test.ts     # tests
  types.ts                    # shared type definitions
  index.ts                    # element(s) registration
```

## Shared Type Definitions

Construct the data type of your element in `types.ts`. Most of the time you'll be able to find your resource under the [Rels](https://github.com/Foxy/foxy-sdk/blob/main/src/backend/Rels.d.ts) namespace of the Backend SDK. You should prefer the relations exported from the Backend namespace since other namespaces usually export a subset of it anyway.

```ts
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.CustomField>;
```

If you need to add other shared type definitions, it's a good idea to put them into this file as well for consistency with other elements.

## Element Class

Use the data type to create a basic element class in `CustomFieldForm.ts`. If you're working with hAPI resources, you'll want to use [NucleonElement](https://github.com/Foxy/foxy-elements/tree/main/src/elements/public/NucleonElement) since it comes with a lot of [useful functionality](https://elements.foxy.dev/?path=/story/other-nucleon--page) for state management and editing. Note how we import `NucleonElement` and not `index` from the element folder since the latter comes with a side effect of defining an element in a global registry.

```ts
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Data } from './types';

/**
 * Form element for creating or editing `fx:custom_field` resources.
 *
 * @element foxy-custom-field-form
 * @since 1.11.0
 */
export class CustomFieldForm extends NucleonElement<Data> {}
```

If your element doesn't work with hAPI, it's ok to extend `LitElement` directly instead. You can also extend other elements if it makes sense. Don't forget about [JSDoc](https://github.com/runem/web-component-analyzer#-how-to-document-your-components-using-jsdoc) – it turns into a nicely formatted API reference in Storybook once you run `npm run wca`.

## Element(s) Registration

Import your element in `index.ts`, define and re-export the class. Local name is "foxy" + your class name in kebab-case. If you're using a 3rd-party element that automatically defines itself (like `iron-icon`), place its import in `index.ts` as well. We separate definition from registration to support side effect-free inheritance and [scoped element registries](https://open-wc.org/docs/development/scoped-elements).

```ts
import { CustomFieldForm } from './CustomFieldForm';

customElements.define('foxy-custom-field-form', CustomFieldForm);

export { CustomFieldForm };
```

## Storybook Docs

Import `index.ts` in `CustomFieldForm.stories.ts` and bootstrap the story using our generators and mock server. This is a standard [Storybook CSF file](https://storybook.js.org/docs/web-components/api/csf), so feel free to skip our utilities and use the format directly. Start with the four stories from the code snippet below and add more if necessary.

```ts
import './index'; // Automatically define the element

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

const summary: Summary = {
  // Mock URL of a standalone resource (see Mock server)
  href: 'https://demo.foxycart.com/s/admin/custom_fields/0',

  // Mock URL of a collection that standalone resource belongs to (see Mock server)
  parent: 'https://demo.foxycart.com/s/admin/transactions/0/custom_fields',

  // Always true for elements based on NucleonElement
  nucleon: true,

  // The tag you've your element with
  localName: 'foxy-custom-field-form',

  // Set to true if your element uses TranslatableMixin (see Mixins section)
  translatable: false,

  // Set to true if your element uses ConfigurableMixin (see Mixins section)
  configurable: false,
};

// Story metadata automatically generated from the summary above
export default getMeta(summary);

// Story displaying the element in the `idle.snapshot.clean` state + a code snippet
export const Playground = getStory({ ...summary, code: true });

// Story displaying the element in the `idle.template.clean` state
export const Empty = getStory(summary);
Empty.args.href = '';

// Story displaying the element in the `fail` state
export const Error = getStory(summary);
Error.args.href = 'https://demo.foxycart.com/s/admin/not-found';

// Story displaying the element in the `busy` state
export const Busy = getStory(summary);
Busy.args.href = 'https://demo.foxycart.com/s/admin/sleep';
```

To see your stories in action, run `npm run storybook`.

## Package Exports

Expose the newly added element via `index.ts` and `index.defined.ts`. This adds your element to the two main library exports available to npm users.

```ts
// src/elements/public/index.ts
export { CustomFieldForm } from './CustomFieldForm/CustomFieldForm';
```

```ts
// src/elements/public/index.defined.ts
export { CustomFieldForm } from './CustomFieldForm/index';
```

## Tests

Writing tests is perhaps the most standard thing out of all in Elements. See [Web Test Runner guides](https://modern-web.dev/guides/test-runner/getting-started/) for a detailed intro to the approach and tech stack. Here's an example of what a good starting point could look like for `CustomFieldForm.test.ts`:

```ts
import { expect } from '@open-wc/testing';
import { CustomFieldForm } from './index';

it('defines a custom element tagged "foxy-custom-field-form"', () => {
  expect(customElements.get('foxy-custom-field-form')).to.equal(CustomFieldForm);
});
```

To test your changes, run `npm test` or `npm run test:watch` (the latter re-runs the tests on save). Running the whole test suite might take a while, so you might want to limit yourself to just one file while developing:

```bash
./node_modules/.bin/wtr **/CustomFieldForm.test.ts --watch
```
