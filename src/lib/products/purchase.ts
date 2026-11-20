import { cartUrl } from "./catalog";
import {
  cartFields,
  chosenProduct,
  invalidModifiers,
  livePrice,
  modifierAmount,
  modifierValues,
  offeredModifiers,
  presetModifiers,
  quantityBounds,
  type PurchaseState,
} from "./choices";
import { buttonText, productImage } from "./light-dom";
import { chooseMessage, format, messages, type MessageDescriptor } from "./messages";
import {
  hasOptionControls,
  keepOffered,
  productOptions,
  valueStates,
  type ProductOption,
} from "./options";
import { formatPrice, productPrice } from "./price";
import type { CatalogProduct, OptionValue, ProductModifier } from "./types";

export interface PurchaseSettings {
  store: string;
  locale: string;
  /** The currency the page wants; each price is shown in the one it is in. */
  currency: string | null;
  /** The add button's text; the price follows it. */
  label: string;
  /** Options as buttons and swatches, as a list of rows with prices, or as drop-downs. */
  optionStyle: "buttons" | "rows" | "select";
  quantityStyle: "stepper" | "none";
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
    // `value` presets modifiers too, as a link's does.
    this.state.modifiers = presetModifiers(this.chosen ?? product, initialChoices);
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
  get price(): { price: number; listPrice: number | null; currency: string | null } | null {
    return livePrice(this.product, this.state, this.#settings.currency);
  }

  configure(settings: PurchaseSettings): void {
    this.#settings = settings;
    this.render();
  }

  #t(descriptor: MessageDescriptor, values?: Record<string, string | number>): string {
    return format(this.#settings.locale, descriptor, values);
  }

  /** The currency the chosen product's amounts are in, or the parent's until one is chosen. */
  get #currency(): string | null {
    return productPrice(this.chosen ?? this.product, this.#settings.currency).currency;
  }

  #money(amount: number, currency = this.#currency): string {
    return formatPrice(amount, currency, this.#settings.locale);
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
        const style = this.#settings.optionStyle;
        children.push(
          style === "select" || (style === "buttons" && this.#tooManyForButtons(option, index))
            ? this.#optionSelect(option, index)
            : style === "rows"
              ? this.#optionRows(option, index)
              : this.#optionPills(option, index),
        );
      });
    } else if (product._embedded?.variants?.length) {
      const variants = product._embedded.variants;
      children.push(
        this.#settings.optionStyle === "rows" ? this.#variantRows(variants) : this.#variantSelect(variants),
      );
    }

    for (const modifier of offeredModifiers(product, this.state)) {
      children.push(modifier.type === "text" ? this.#textModifier(modifier) : this.#selectModifier(modifier));
    }

    // What there is to choose sits together, so a page can set it apart.
    const choices = el("div", "foxy-product-choices");
    choices.append(...children);
    const quantity = this.#quantity();
    this.controls.replaceChildren(...(children.length ? [choices] : []), ...(quantity ? [quantity] : []), this.#button());
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

  /** More plain values than fit as buttons, such as a long list of sizes, go in a drop-down. */
  #tooManyForButtons(option: ProductOption, index: number): boolean {
    const values = this.#optionStates(option, index);
    return values.length > 8 && !values.some(({ color, image }) => color || image);
  }

  #optionStates(option: ProductOption, index: number) {
    const states = valueStates(this.product, index, this.state.choices);
    const photos = this.#valuePhotos(option);
    return option.values
      .filter(({ value }) => states.get(value) !== "missing")
      .map((value) => ({
        ...value,
        image: value.image ?? photos.get(value.value),
        soldOut: states.get(value.value) === "sold-out",
      }));
  }

  /**
   * Photos for an option's values, taken from the variants: each value's
   * is the first photo of a variant that has it. Only when every value
   * gets a different photo that isn't the product's, which is what says the
   * photos follow this option (a colour) and not another (a size).
   */
  #valuePhotos(option: ProductOption): Map<string, OptionValue["image"]> {
    const shared = this.product.definition.images?.[0]?.src;
    const photos = new Map<string, OptionValue["image"]>();
    for (const { value } of option.values) {
      const photo = (this.product._embedded?.variants ?? []).find(
        (variant) => variant.option_values?.[option.name]?.toLowerCase() === value.toLowerCase(),
      )?.definition.images?.[0];
      if (photo && photo.src !== shared) photos.set(value, photo);
    }
    const distinct = new Set([...photos.values()].map((photo) => photo!.src)).size;
    return photos.size === option.values.length && distinct === photos.size ? photos : new Map();
  }

  /** A fieldset of visually hidden radios, each followed by the label `build` returns for it. */
  #radios<T>(
    name: string,
    legend: HTMLElement,
    groupClass: string,
    items: T[],
    item: (value: T) => { value: string; checked: boolean; disabled: boolean; choose: () => void; label: HTMLLabelElement },
  ): HTMLFieldSetElement {
    const set = el("fieldset", "foxy-product-option");
    const group = el("div", groupClass);
    items.forEach((value, index) => {
      const { value: own, checked, disabled, choose, label } = item(value);
      const radio = el("input", "foxy-product-radio");
      radio.type = "radio";
      radio.value = own;
      // No field of this name reaches the cart: these controls sit in a
      // form without an action, and the cart form is built apart.
      radio.name = `${this.#id}-${name}`;
      radio.id = `${this.#id}-${name}-${index}`;
      radio.checked = checked;
      radio.disabled = disabled;
      radio.addEventListener("change", choose);
      label.htmlFor = radio.id;
      group.append(radio, label);
    });
    set.append(legend, group);
    return set;
  }

  /** One row of a list: a photo or colour when there is one, the name, and what it costs. */
  #row(text: string, media: { image?: OptionValue["image"]; color?: string }, price: string): HTMLLabelElement {
    const label = el("label", "foxy-product-row");
    const image = productImage(media.image, true);
    if (image || media.color) {
      const holder = el("span", "foxy-product-row-media");
      holder.setAttribute("aria-hidden", "true");
      if (image) {
        image.alt = "";
        holder.append(image);
      } else {
        // Set as a property, so a value that isn't a colour is ignored.
        holder.style.backgroundColor = media.color!;
      }
      label.append(holder);
    }
    label.append(el("span", "foxy-product-row-label", text));
    if (price) label.append(el("span", "foxy-product-row-price", price));
    return label;
  }

  #optionRows(option: ProductOption, index: number): HTMLElement {
    const values = this.#optionStates(option, index);
    const prices = values.map(({ value }) => this.#valuePrice(option, value));
    const showPrices = prices.every((price) => price !== null);
    return this.#radios(option.name, el("legend", undefined, option.label), "foxy-product-rows", values, (value) => ({
      value: value.value,
      checked: value.value === this.state.choices[option.name],
      disabled: value.soldOut,
      choose: () => this.#choose(option.name, value.value),
      label: this.#row(
        value.soldOut ? this.#t(messages.valueSoldOut, { label: value.label }) : value.label,
        value,
        showPrices ? prices[values.indexOf(value)]! : "",
      ),
    }));
  }

  #variantRows(variants: CatalogProduct[]): HTMLElement {
    return this.#radios("variant", el("legend", undefined, this.#t(messages.variant)), "foxy-product-rows", variants, (variant) => {
      const name = variant.definition.name ?? variant.display_name ?? variant.sku;
      const { price, currency } = productPrice(variant, this.#settings.currency);
      return {
        value: variant.sku,
        checked: variant.sku === this.state.variantSku,
        disabled: !variant.is_in_stock,
        choose: () => {
          this.state.variantSku = variant.sku;
          this.#settle();
          this.render();
        },
        label: this.#row(
          variant.is_in_stock ? name : this.#t(messages.valueSoldOut, { label: name }),
          {},
          price === null ? "" : this.#money(price, currency),
        ),
      };
    });
  }

  #optionPills(option: ProductOption, index: number): HTMLElement {
    const legend = el("legend", undefined, `${option.label} `);
    const values = this.#optionStates(option, index);
    const chosen = values.find(({ value }) => value === this.state.choices[option.name]);
    legend.append(el("span", "foxy-product-hint", chosen?.label ?? ""));
    const swatches = values.some(({ color, image }) => color || image);

    const set = this.#radios(option.name, legend, "foxy-product-values", values, (value) => {
      const text = value.soldOut ? this.#t(messages.valueSoldOut, { label: value.label }) : value.label;
      const label = el("label", swatches ? "foxy-product-swatch" : "foxy-product-pill");
      if (swatches) {
        const ring = el("span", "foxy-product-swatch-ring");
        const dot = el("span", "foxy-product-swatch-dot");
        ring.setAttribute("aria-hidden", "true");
        // A colour says more than a photo at this size, so it comes first.
        const image = value.color ? null : productImage(value.image, true);
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
      return {
        value: value.value,
        checked: value === chosen,
        disabled: value.soldOut,
        choose: () => this.#choose(option.name, value.value),
        label,
      };
    });
    if (swatches) set.querySelector<HTMLElement>(".foxy-product-values")!.dataset.swatches = "";
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
        text = this.#t(messages.valuePrice, { label: text, price: prices[valueIndex]! });
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

  /** The one price every variant with this value has, given the other choices, as text; else `null`. */
  #valuePrice(option: ProductOption, value: string): string | null {
    const wanted = { ...this.state.choices, [option.name]: value };
    const prices = new Set(
      (this.product._embedded?.variants ?? [])
        .filter((variant) =>
          Object.entries(wanted).every(
            ([name, choice]) => variant.option_values?.[name]?.toLowerCase() === choice.toLowerCase(),
          ),
        )
        .map((variant) => {
          const { price, currency } = productPrice(variant, this.#settings.currency);
          return price === null ? null : this.#money(price, currency);
        }),
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
    const amount = modifierAmount(modifier, "x", this.#currency);
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
      const amount = modifierAmount(modifier, value.value, this.#currency);
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
    const input = el("input");
    input.id = id;
    input.inputMode = "numeric";
    const set = (quantity: number) => {
      this.state.quantity = Math.min(max, Math.max(min, Math.round(quantity) || min));
      this.#refresh();
    };
    input.addEventListener("change", () => set(Number(input.value)));

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
    return this.#t(chooseMessage(name), { option: name });
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
        button.replaceChildren(
          buttonText(
            this.#settings.label || this.#t(messages.addToCart),
            this.#money(Math.round(price.price * state.quantity * 100) / 100),
          ),
        );
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
