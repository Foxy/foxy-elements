# Mixins

Some of the core functionality of our elements is available in form of [mixins](https://www.typescriptlang.org/docs/handbook/mixins.html), making it possible to opt into it only when you actually need it. This page will give you a quick tour around what's in store.

## ThemeableMixin

We use [TailwindCSS](https://tailwindcss.com) to generate utility classes for the [Lumo Design System](https://demo.vaadin.com/lumo-editor) that comes with [Vaadin 14](https://vaadin.com/docs/v14/guide/introduction). If you'd like to use them, simply apply this mixin to your element. Remember to always use full utility names to prevent [PurgeCSS](https://purgecss.com) from removing their CSS from the production build. If you need to use responsive styles, apply `ResponsiveMixin` as well.

```ts
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { html } from 'lit-element';
import { Data } from './types';

export class CustomFieldForm extends ThemeableMixin(NucleonElement)<Data> {
  render() {
    return html`<div class="text-primary font-lumo">Foo</div>`;
  }
}
```

## ResponsiveMixin

This mixin tracks the element size with [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) and adds the applicable breakpoints to an attribute, allowing you to use responsive utilities from `ThemeableMixin` or target specific container sizes with the [:host()](<https://developer.mozilla.org/en-US/docs/Web/CSS/:host()>) function. Just like [CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries), but now and supported in all major browsers.

```ts
import { ResponsiveMixin } from '../../../mixins/themeable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { html } from 'lit-element';
import { Data } from './types';

export class CustomFieldForm extends ResponsiveMixin(ThemeableMixin(NucleonElement))<Data> {
  render() {
    return html`<div class="text-s md-text-m lg-text-l">Foo</div>`;
  }
}
```

## TranslatableMixin

Apply this mixin to make your element translatable with [i18next](https://www.i18next.com). Use your class name in kebab-case as namespace (second argument). Add translations under `src/static/translations/${namespace}/${lang}.json`. Add as much as you can to "shared" first, and if there's something specific to this particular element, use your own namespace.

```ts
import { TranslatableMixin } from '../../../mixins/translatable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { html } from 'lit-element';
import { Data } from './types';

export class CustomFieldForm extends TranslatableMixin(NucleonElement, 'custom-field-form')<Data> {
  render() {
    return html`<div lang=${this.lang}>${this.t('name')}</div>`;
  }
}
```

## ConfigurableMixin

We strive to make each and every one of our components as configurable as possible. Sometimes our customers want to hide specific controls, sometimes they need to make them read-only or disabled in certain circumstances, and sometimes they ask us if it's possible to add some content in a completely unexpected place. This mixin provides a flexible API based on [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) catering to all of these scenarios.

### Hide, Disable, Make Readonly

```ts
import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { html } from 'lit-element';
import { Data } from './types';

export class CustomFieldForm extends ConfigurableMixin(NucleonElement)<Data> {
  render() {
    // use .disabledSelector to toggle parts of your elements on and off
    // use .readonlySelector to control which parts of your elements are editable
    // use .hiddenSelector to hide parts of your elements

    const isNameDisabled = this.disabledSelector.matches('name', true);
    const isValueDisabled = this.disabledSelector.matches('value', true);

    return html`
      <label>Name: <input ?disabled=${isNameDisabled} /></label>
      <label>Value: <input ?disabled=${isValueDisabled} /></label>
    `;
  }
}
```

```html
<!-- Disable all inputs in a form -->
<foxy-custom-field-form disabled></foxy-custom-field-form>
<foxy-custom-field-form disabledcontrols="name value"></foxy-custom-field-form>

<!-- Disable only the name input -->
<foxy-custom-field-form disabledcontrols="name"></foxy-custom-field-form>
<foxy-custom-field-form disabledcontrols="not=value"></foxy-custom-field-form>
```

### Add Custom Content

```ts
import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { html } from 'lit-element';
import { Data } from './types';

export class CustomFieldForm extends ConfigurableMixin(NucleonElement)<Data> {
  render() {
    return html`
      <div>
        <span>${this.renderTemplateOrSlot('title:before')}</span>
        <span>Custom field form title</span>
        <span>${this.renderTemplateOrSlot('title:after')}</span>
      </div>
    `;
  }
}
```

```html
<foxy-custom-field-form>
  <template slot="title:before">Dynamic prefix for ${host.data.name}</template>
  <div slot="title:after">Static suffix for a custom field</div>
</foxy-custom-field-form>
```

### Conventions

Surround every configurable control with `:before` and `:after` templates. Hiding the control should hide the templates as well. Here's what it might look like in your template:

```ts
import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { html } from 'lit-element';
import { Data } from './types';

export class CustomFieldForm extends ConfigurableMixin(NucleonElement)<Data> {
  render() {
    if (this.hiddenSelector.matches('name', true)) return;

    const isNameDisabled = this.disabledSelector.matches('name', true);
    const isNameReadonly = this.readonlySelector.matches('name', true);

    return html`
      ${this.renderTemplateOrSlot('name:before')}
      <input ?disabled=${isNameDisabled} ?readonly=${isNameReadonly} />
      ${this.renderTemplateOrSlot('name:after')}
    `;
  }
}
```

### Deep Configurations

When using other configurable elements in your code, don't forget to pass the configuration to them like so:

```ts
import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { html } from 'lit-element';
import { Data } from './types';

export class CustomFieldForm extends ConfigurableMixin(NucleonElement)<Data> {
  render() {
    return html`
      <foxy-attribute-form
        disabledcontrols=${this.disabledSelector.zoom('form').toString()}
        readonlycontrols=${this.readonlySelector.zoom('form').toString()}
        hiddencontrols=${this.hiddenSelector.zoom('form').toString()}
        .templates=${this.getNestedTemplates('form')}
      >
      </foxy-attribute-form>
    `;
  }
}
```

```html
<foxy-custom-field-form hiddencontrols="form:timestamps" readonlycontrols="form:not=value">
  <template slot="form:name:before">Dynamic prefix for ${host.data.name}</template>
</foxy-custom-field-form>
```
