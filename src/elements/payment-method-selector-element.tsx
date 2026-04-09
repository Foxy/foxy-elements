import type {
  PaymentMethodSelectorConfig,
  PaymentMethodSelectorElementContract,
  PaymentMethodSelectorOption,
} from "@/elements/contracts";

import { paymentMethodSelectorEvents } from "@/elements/contracts";

export const PAYMENT_METHOD_SELECTOR_ELEMENT_TAG =
  "foxy-payment-method-selector";

export type PaymentMethodSelectorTokenizeEventDetail = {
  payload: Record<string, unknown>;
};

export type PaymentMethodSelectorChangeEventDetail = {
  optionId: string;
  optionType: string | undefined;
};

const CONFIG_ATTRIBUTE = "config";
const SELECTED_OPTION_ATTRIBUTE = "selected-option-id";
const LOADING_ATTRIBUTE = "loading";

class PaymentMethodSelectorElement
  extends HTMLElement
  implements PaymentMethodSelectorElementContract
{
  #config: PaymentMethodSelectorConfig = {
    options: [],
  };
  #stylesheet: CSSStyleSheet | string | null = null;

  static get observedAttributes(): string[] {
    return [CONFIG_ATTRIBUTE, SELECTED_OPTION_ATTRIBUTE, LOADING_ATTRIBUTE];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  get config(): PaymentMethodSelectorConfig {
    return this.#config;
  }

  set config(value: PaymentMethodSelectorConfig) {
    this.#config = {
      locale: value.locale,
      options: value.options ?? [],
      selectedOptionId: value.selectedOptionId,
      loading: value.loading ?? false,
    };
    this.#render();
  }

  get stylesheet(): CSSStyleSheet | string | null {
    return this.#stylesheet;
  }

  set stylesheet(value: CSSStyleSheet | string | null) {
    this.#stylesheet = value;
    this.#applyStylesheet();
  }

  async tokenize(): Promise<Record<string, unknown>> {
    const selectedOption = this.#resolveSelectedOption();
    if (!selectedOption) {
      throw new Error("No payment method is selected.");
    }

    const payload = {
      optionId: selectedOption.id,
      optionType: selectedOption.type,
    };

    this.dispatchEvent(
      new CustomEvent<PaymentMethodSelectorTokenizeEventDetail>(
        paymentMethodSelectorEvents.tokenize,
        {
          bubbles: true,
          composed: true,
          detail: {
            payload,
          },
        },
      ),
    );
    return payload;
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  connectedCallback() {
    this.#render();
  }

  disconnectedCallback() {
    // No-op: no external subscriptions are held.
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (name === CONFIG_ATTRIBUTE) {
      this.#config = this.#readConfigAttribute(newValue);
      this.#render();
      return;
    }

    if (name === SELECTED_OPTION_ATTRIBUTE) {
      this.#config = {
        ...this.#config,
        selectedOptionId: newValue ?? undefined,
      };
      this.#render();
      return;
    }

    if (name === LOADING_ATTRIBUTE) {
      this.#config = {
        ...this.#config,
        loading: newValue === "true",
      };
      this.#render();
    }
  }

  #render() {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const selectedId = this.#resolveSelectedOption()?.id;

    const optionsMarkup = this.#config.options
      .map((option) => this.#renderOption(option, selectedId))
      .join("");

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--font-sans, system-ui, sans-serif);
          color: var(--foreground, #111827);
        }

        fieldset {
          border: 0;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.625rem;
        }

        label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid var(--border, #d1d5db);
          border-radius: 0.625rem;
          padding: 0.75rem;
          cursor: pointer;
        }

        label[aria-disabled="true"] {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .option-copy {
          display: grid;
          gap: 0.2rem;
        }

        .option-description {
          color: var(--muted-foreground, #6b7280);
          font-size: 0.875rem;
        }

        .loading {
          color: var(--muted-foreground, #6b7280);
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
      </style>
      <fieldset role="radiogroup" aria-label="Payment methods">
        ${optionsMarkup}
      </fieldset>
      ${this.#config.loading ? '<div class="loading">Loading payment options...</div>' : ""}
    `;

    this.#attachOptionListeners();
    this.#applyStylesheet();
  }

  #renderOption(
    option: PaymentMethodSelectorOption,
    selectedId?: string,
  ): string {
    const isChecked = selectedId === option.id;
    const description = option.description
      ? `<span class="option-description">${this.#escapeHtml(option.description)}</span>`
      : "";

    return `
      <label aria-disabled="${option.disabled ? "true" : "false"}">
        <input
          type="radio"
          name="foxy-payment-option"
          value="${this.#escapeHtml(option.id)}"
          ${isChecked ? "checked" : ""}
          ${option.disabled ? "disabled" : ""}
        />
        <span class="option-copy">
          <span>${this.#escapeHtml(option.label)}</span>
          ${description}
        </span>
      </label>
    `;
  }

  #attachOptionListeners(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const options = shadow.querySelectorAll<HTMLInputElement>(
      'input[name="foxy-payment-option"]',
    );

    options.forEach((input) => {
      input.addEventListener("change", () => {
        if (!input.checked) return;

        const selected = this.#config.options.find(
          (option) => option.id === input.value,
        );
        if (!selected) return;

        this.#config = {
          ...this.#config,
          selectedOptionId: selected.id,
        };

        this.dispatchEvent(
          new CustomEvent<PaymentMethodSelectorChangeEventDetail>(
            paymentMethodSelectorEvents.methodChange,
            {
              bubbles: true,
              composed: true,
              detail: {
                optionId: selected.id,
                optionType: selected.type,
              },
            },
          ),
        );
      });
    });
  }

  #readConfigAttribute(raw: string | null): PaymentMethodSelectorConfig {
    if (!raw) return { options: [] };

    try {
      const parsed = JSON.parse(raw) as Partial<PaymentMethodSelectorConfig>;
      return {
        locale: parsed.locale,
        options: Array.isArray(parsed.options) ? parsed.options : [],
        selectedOptionId: parsed.selectedOptionId,
        loading: parsed.loading ?? false,
      };
    } catch {
      return { options: [] };
    }
  }

  #resolveSelectedOption(): PaymentMethodSelectorOption | undefined {
    if (!this.#config.options.length) return undefined;

    const explicit = this.#config.options.find(
      (option) => option.id === this.#config.selectedOptionId,
    );
    if (explicit) return explicit;

    return this.#config.options.find((option) => !option.disabled);
  }

  #escapeHtml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  #applyStylesheet() {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    if (this.#stylesheet instanceof CSSStyleSheet) {
      shadow.adoptedStyleSheets = [this.#stylesheet];
    } else if (typeof this.#stylesheet === "string") {
      let style = shadow.querySelector(
        "style[data-foxy-payment-styles]",
      ) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement("style");
        style.setAttribute("data-foxy-payment-styles", "");
        shadow.insertBefore(style, shadow.firstChild);
      }
      style.textContent = this.#stylesheet;
    }
  }
}

export function definePaymentMethodSelectorElement() {
  if (!customElements.get(PAYMENT_METHOD_SELECTOR_ELEMENT_TAG)) {
    customElements.define(
      PAYMENT_METHOD_SELECTOR_ELEMENT_TAG,
      PaymentMethodSelectorElement,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "foxy-payment-method-selector": PaymentMethodSelectorElement;
  }
}
