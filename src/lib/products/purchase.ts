import { cartUrl } from "./catalog";
import {
  cartFields,
  chosenProduct,
  invalidModifiers,
  livePrice,
  modifierAmount,
  modifierValues,
  offeredModifiers,
  quantityBounds,
  type PurchaseState,
} from "./choices";
import { productImage } from "./light-dom";
import { format, messages, type MessageDescriptor } from "./messages";
import {
  hasOptionControls,
  keepOffered,
  productOptions,
  valueStates,
  type ProductOption,
} from "./options";
import { formatPrice, productPrice } from "./price";
import type { CatalogProduct, ProductModifier } from "./types";

export interface PurchaseSettings {
  store: string;
  locale: string;
  currency: string | null;
  /** The add button's text; the price follows it. */
  label: string;
  /** Options as buttons and swatches, or as drop-downs. */
  optionStyle: "pills" | "select";
  quantityStyle: "stepper" | "input" | "none";
}

let instances = 0;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

/**
 * What a shopper chooses before adding one product, and the add itself:
 * option pickers (values with no variant left out, sold-out ones shown but
 * not choosable), the chosen variant's modifiers, quantity, and a button
 * that says what is still missing.
 *
 * `controls` holds the visible controls and has no `action`. `cartForm` is
 * what the cart is sent: a hidden `<form action="https://<store>/cart">` of
 * hidden inputs, which the owner keeps in light DOM and this submits with
 * `requestSubmit()`, so 2.0's `foxycart.js` takes it over as it would any
 * add-to-cart form, and the browser posts it when 2.0 isn't on the page.
 */
export class Purchase {
  readonly controls = el("form", "foxy-product-controls");
  readonly cartForm = el("form");
  readonly product: CatalogProduct;
  state: PurchaseState;

  #settings: PurchaseSettings;
  #onChange: () => void;
  #id = `foxy-product-${++instances}`;
  #showErrors = false;
  #refreshers: Array<() => void> = [];

  constructor(
    product: CatalogProduct,
    settings: PurchaseSettings,
    initialChoices: Record<string, string>,
    onChange: () => void,
  ) {
    this.product = product;
    this.#settings = settings;
    this.#onChange = onChange;

    const variants = product._embedded?.variants ?? [];
    const optionControls = hasOptionControls(product);
    this.state = {
      choices: optionControls ? keepOffered(product, initialChoices) : {},
      variantSku:
        !optionControls && variants.length
          ? (variants.find((v) => v.is_in_stock) ?? variants[0]).sku
          : null,
      modifiers: {},
      quantity: 1,
    };
    this.#settle();

    this.controls.noValidate = true;
    this.controls.addEventListener("submit", (event) => {
      event.preventDefault();
      this.#submit();
    });
    this.cartForm.method = "post";
    this.cartForm.hidden = true;
    this.render();
  }

  /** The product the choices so far add, if they name one. */
  get chosen(): CatalogProduct | undefined {
    return chosenProduct(this.product, this.state);
  }

  /** One unit's price with the chosen modifiers; `null` until a variant is chosen. */
  get price(): { price: number; listPrice: number | null } | null {
    return livePrice(this.product, this.state, this.#settings.currency);
  }

  configure(settings: PurchaseSettings): void {
    this.#settings = settings;
    this.render();
  }

  #t(descriptor: MessageDescriptor, values?: Record<string, string | number>): string {
    return format(this.#settings.locale, descriptor, values);
  }

  #money(amount: number): string {
    return formatPrice(amount, this.#settings.currency, this.#settings.locale);
  }

  /** Brings modifier values and quantity in line with the chosen product. */
  #settle(): void {
    const { state } = this;
    state.modifiers = modifierValues(offeredModifiers(this.product, state), state.modifiers);
    const { min, max } = quantityBounds(this.chosen ?? this.product);
    state.quantity = Math.min(max, Math.max(min, state.quantity));
  }

  /** Rebuilds the controls, keeping the shopper's focus where it was. */
  render(): void {
    const root = this.controls.getRootNode() as Document | ShadowRoot;
    const focused = this.controls.contains(root.activeElement) ? root.activeElement?.id : "";

    this.#refreshers = [];
    const { product } = this;
    const children: HTMLElement[] = [];

    if (hasOptionControls(product)) {
      productOptions(product).forEach((option, index) => {
        children.push(
          this.#settings.optionStyle === "select"
            ? this.#optionSelect(option, index)
            : this.#optionPills(option, index),
        );
      });
    } else if (product._embedded?.variants?.length) {
      children.push(this.#variantSelect(product._embedded.variants));
    }

    for (const modifier of offeredModifiers(product, this.state)) {
      children.push(modifier.type === "text" ? this.#textModifier(modifier) : this.#selectModifier(modifier));
    }

    const quantity = this.#quantity();
    if (quantity) children.push(quantity);
    children.push(this.#button());

    this.controls.replaceChildren(...children);
    if (focused) this.controls.querySelector<HTMLElement>(`#${CSS.escape(focused)}`)?.focus();
    this.#refresh();
  }

  /** Updates what depends on the state without replacing any control. */
  #refresh(): void {
    this.cartForm.action = cartUrl(this.#settings.store);
    this.cartForm.replaceChildren(
      ...cartFields(this.product, this.state).map(([name, value]) => {
        const input = el("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        return input;
      }),
    );
    this.#refreshers.forEach((refresh) => refresh());
    this.#onChange();
  }

  #choose(name: string, value: string): void {
    this.state.choices = keepOffered(this.product, { ...this.state.choices, [name]: value });
    this.#settle();
    this.render();
  }

  #optionStates(option: ProductOption, index: number) {
    const states = valueStates(this.product, index, this.state.choices);
    return option.values
      .filter(({ value }) => states.get(value) !== "missing")
      .map((value) => ({ ...value, soldOut: states.get(value.value) === "sold-out" }));
  }

  #optionPills(option: ProductOption, index: number): HTMLElement {
    const set = el("fieldset", "foxy-product-option");
    const legend = el("legend", undefined, `${option.label} `);
    const values = this.#optionStates(option, index);
    const chosen = values.find(({ value }) => value === this.state.choices[option.name]);
    legend.append(el("span", "foxy-product-hint", chosen?.label ?? ""));

    const group = el("div", "foxy-product-values");
    const swatches = values.some(({ color, image }) => color || image);
    if (swatches) group.dataset.swatches = "";

    values.forEach((value, valueIndex) => {
      const radio = el("input", "foxy-product-radio");
      radio.type = "radio";
      // No `form` field of this name reaches the cart: these controls sit
      // in a form without an action, and the cart form is built apart.
      radio.name = `${this.#id}-${option.name}`;
      radio.id = `${this.#id}-${option.name}-${valueIndex}`;
      radio.checked = value === chosen;
      radio.disabled = value.soldOut;
      radio.addEventListener("change", () => this.#choose(option.name, value.value));

      const text = value.soldOut ? this.#t(messages.valueSoldOut, { label: value.label }) : value.label;
      const label = el("label", swatches ? "foxy-product-swatch" : "foxy-product-pill");
      label.htmlFor = radio.id;
      if (swatches) {
        const ring = el("span", "foxy-product-swatch-ring");
        const dot = el("span", "foxy-product-swatch-dot");
        ring.setAttribute("aria-hidden", "true");
        const image = productImage(value.image, true);
        if (image) {
          image.alt = "";
          dot.append(image);
        } else if (value.color) {
          // Set as a property, so a value that isn't a colour is ignored.
          dot.style.backgroundColor = value.color;
        }
        ring.append(dot);
        label.append(ring, el("span", undefined, text));
      } else {
        label.textContent = text;
      }
      group.append(radio, label);
    });

    set.append(legend, group);
    return set;
  }

  #field(id: string, label: string, hint?: { text: string; tone?: "notice" }): HTMLDivElement {
    const field = el("div", "foxy-product-field");
    const element = el("label", "foxy-product-field-label", label);
    element.htmlFor = id;
    if (hint) {
      const span = el("span", "foxy-product-hint", hint.text);
      if (hint.tone) span.dataset.tone = hint.tone;
      element.append(" ", span);
    }
    field.append(element);
    return field;
  }

  #optionSelect(option: ProductOption, index: number): HTMLElement {
    const id = `${this.#id}-${option.name}`;
    const field = this.#field(id, option.label);
    const select = el("select", "foxy-product-input");
    select.id = id;
    select.append(new Option(this.#missingLabel(option), ""));

    const offered = this.#optionStates(option, index);
    // A price beside each value only when each has one price and they differ.
    const prices = offered.map(({ value }) => this.#valuePrice(option, value));
    const showPrices = prices.every((price) => price !== null) && new Set(prices).size > 1;
    offered.forEach((value, valueIndex) => {
      let text = value.soldOut ? this.#t(messages.valueSoldOut, { label: value.label }) : value.label;
      if (showPrices) {
        text = this.#t(messages.valuePrice, { label: text, price: this.#money(prices[valueIndex]!) });
      }
      const item = new Option(text, value.value);
      item.disabled = value.soldOut;
      select.append(item);
    });
    select.value = this.state.choices[option.name] ?? "";
    // The empty first item matches no value, so choosing it clears the choice.
    select.addEventListener("change", () => this.#choose(option.name, select.value));
    field.append(select);
    return field;
  }

  /** The one price every variant with this value has, given the other choices; else `null`. */
  #valuePrice(option: ProductOption, value: string): number | null {
    const wanted = { ...this.state.choices, [option.name]: value };
    const prices = new Set(
      (this.product._embedded?.variants ?? [])
        .filter((variant) =>
          Object.entries(wanted).every(
            ([name, choice]) => variant.option_values?.[name]?.toLowerCase() === choice.toLowerCase(),
          ),
        )
        .map((variant) => productPrice(variant, this.#settings.currency).price),
    );
    const [price] = prices;
    return prices.size === 1 ? (price ?? null) : null;
  }

  #variantSelect(variants: CatalogProduct[]): HTMLElement {
    const id = `${this.#id}-variant`;
    const field = this.#field(id, this.#t(messages.variant));
    const select = el("select", "foxy-product-input");
    select.id = id;
    for (const variant of variants) {
      const name = variant.definition.name ?? variant.display_name ?? variant.sku;
      const item = new Option(
        variant.is_in_stock ? name : this.#t(messages.valueSoldOut, { label: name }),
        variant.sku,
      );
      item.disabled = !variant.is_in_stock;
      select.append(item);
    }
    select.value = this.state.variantSku ?? "";
    select.addEventListener("change", () => {
      this.state.variantSku = select.value;
      this.#settle();
      this.render();
    });
    field.append(select);
    return field;
  }

  #modifierHint(modifier: ProductModifier, amount: number): { text: string; tone?: "notice" } | undefined {
    const price = this.#money(amount);
    if (modifier.required) {
      return {
        text: amount ? this.#t(messages.requiredHintPrice, { price }) : this.#t(messages.requiredHint),
        tone: "notice",
      };
    }
    // An optional choice starts on a value, so only free text says it can be left empty.
    if (modifier.type === "select") return undefined;
    return { text: amount ? this.#t(messages.optionalHintPrice, { price }) : this.#t(messages.optionalHint) };
  }

  /** The error line under a modifier's control, shown after a refused add. */
  #error(modifier: ProductModifier, control: HTMLElement): HTMLParagraphElement {
    const error = el("p", "foxy-product-error");
    error.id = `${control.id}-error`;
    this.#refreshers.push(() => {
      const problem = this.#showErrors
        ? invalidModifiers(this.product, this.state).get(modifier.name)
        : undefined;
      error.hidden = !problem;
      error.textContent =
        problem === "required"
          ? this.#t(messages.required)
          : problem === "too-long"
            ? this.#t(messages.tooLong, { max: modifier.max_length ?? 255 })
            : "";
      control.setAttribute("aria-invalid", String(Boolean(problem)));
      if (problem) control.setAttribute("aria-describedby", error.id);
      else control.removeAttribute("aria-describedby");
    });
    return error;
  }

  #textModifier(modifier: ProductModifier): HTMLElement {
    const id = `${this.#id}-${modifier.name}`;
    const amount = modifierAmount(modifier, "x", this.#settings.currency);
    const field = this.#field(id, modifier.label || modifier.name, this.#modifierHint(modifier, amount));
    const max = modifier.max_length ?? 255;

    const input = el("input", "foxy-product-input");
    input.id = id;
    input.type = "text";
    input.maxLength = max;
    input.required = Boolean(modifier.required);
    input.value = this.state.modifiers[modifier.name] ?? "";
    field.append(input);

    if (modifier.max_length) {
      input.placeholder = this.#t(messages.upTo, { max });
      const counter = el("p", "foxy-product-counter");
      this.#refreshers.push(() => {
        counter.textContent = this.#t(messages.counter, { count: input.value.length, max });
      });
      field.append(counter);
    }

    input.addEventListener("input", () => {
      this.state.modifiers[modifier.name] = input.value;
      this.#refresh();
    });
    field.append(this.#error(modifier, input));
    return field;
  }

  #selectModifier(modifier: ProductModifier): HTMLElement {
    const id = `${this.#id}-${modifier.name}`;
    const field = this.#field(id, modifier.label || modifier.name, this.#modifierHint(modifier, 0));
    const select = el("select", "foxy-product-input");
    select.id = id;
    select.required = Boolean(modifier.required);
    // Only a required choice starts empty; an optional one has no "none"
    // unless the merchant declared one.
    if (modifier.required) select.append(new Option(this.#t(messages.choose), ""));
    for (const value of modifier.values ?? []) {
      const amount = modifierAmount(modifier, value.value, this.#settings.currency);
      const label = value.label || value.value;
      select.append(
        new Option(
          amount ? `${label} ${this.#t(messages.modifierPrice, { price: this.#money(amount) })}` : label,
          value.value,
        ),
      );
    }
    select.value = this.state.modifiers[modifier.name] ?? "";
    select.addEventListener("change", () => {
      this.state.modifiers[modifier.name] = select.value;
      this.#refresh();
    });
    field.append(select, this.#error(modifier, select));
    return field;
  }

  #quantity(): HTMLElement | null {
    const style = this.#settings.quantityStyle;
    const { min, max } = quantityBounds(this.chosen ?? this.product);
    if (style === "none" || max <= min) return null;

    const id = `${this.#id}-quantity`;
    const field = this.#field(id, this.#t(messages.quantity));
    const input = el("input", style === "input" ? "foxy-product-input foxy-product-quantity" : undefined);
    input.id = id;
    input.inputMode = "numeric";
    const set = (quantity: number) => {
      this.state.quantity = Math.min(max, Math.max(min, Math.round(quantity) || min));
      this.#refresh();
    };
    input.addEventListener("change", () => set(Number(input.value)));

    if (style === "input") {
      input.type = "number";
      input.min = String(min);
      if (Number.isFinite(max)) input.max = String(max);
      this.#refreshers.push(() => (input.value = String(this.state.quantity)));
      field.append(input);
      return field;
    }

    const step = (label: string, sign: string, by: number) => {
      const button = el("button", undefined, sign);
      button.type = "button";
      button.id = `${id}-${by > 0 ? "more" : "fewer"}`;
      button.setAttribute("aria-label", label);
      button.addEventListener("click", () => set(this.state.quantity + by));
      this.#refreshers.push(() => {
        button.disabled = by > 0 ? this.state.quantity >= max : this.state.quantity <= min;
      });
      return button;
    };
    const stepper = el("div", "foxy-product-stepper");
    this.#refreshers.push(() => (input.value = String(this.state.quantity)));
    stepper.append(step(this.#t(messages.decrease), "−", -1), input, step(this.#t(messages.increase), "+", 1));
    field.append(stepper);
    return field;
  }

  /** "Choose a size": lowercased, as it sits mid-sentence. */
  #missingLabel(option: ProductOption): string {
    const name = option.label.toLowerCase();
    return this.#t(/^[aeiou]/.test(name) ? messages.chooseAn : messages.chooseA, { option: name });
  }

  #button(): HTMLButtonElement {
    const button = el("button", "foxy-product-button foxy-product-add");
    button.type = "submit";
    button.id = `${this.#id}-add`;
    this.#refreshers.push(() => {
      const { product, state } = this;
      const chosen = this.chosen;
      const missing = hasOptionControls(product)
        ? productOptions(product).find(({ name }) => state.choices[name] === undefined)
        : undefined;
      const price = this.price;

      if (!product.is_in_stock || (chosen && !chosen.is_in_stock)) {
        button.textContent = this.#t(messages.soldOut);
      } else if (missing) {
        button.textContent = this.#missingLabel(missing);
      } else if (!chosen || !price) {
        button.textContent = this.#t(messages.unavailable);
      } else {
        button.textContent = this.#t(messages.addWithPrice, {
          label: this.#settings.label || this.#t(messages.addToCart),
          price: this.#money(Math.round(price.price * state.quantity * 100) / 100),
        });
      }
      button.disabled = !chosen || !chosen.is_in_stock || !price;
    });
    return button;
  }

  #submit(): void {
    if (!this.chosen?.is_in_stock) return;
    const invalid = invalidModifiers(this.product, this.state);
    if (invalid.size) {
      this.#showErrors = true;
      this.#refresh();
      this.controls.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    // The submit event fires on the light-DOM form, so 2.0's handler on
    // body sees it; without 2.0, the browser posts it to the cart.
    this.cartForm.requestSubmit();
  }
}
