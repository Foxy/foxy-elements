import { afterEach, describe, expect, it, vi } from "vitest";
import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";

import { PaymentButtonElement } from "./element";
import { PaymentMethodSelectorElement } from "../foxy-payment-method-selector/element";

function overrideCheckoutClient(properties: Record<string, unknown>) {
  const descriptors = new Map<string, PropertyDescriptor | undefined>();

  for (const [key, value] of Object.entries(properties)) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(checkoutClient, key));
    Object.defineProperty(checkoutClient, key, {
      configurable: true,
      value,
    });
  }

  return () => {
    for (const [key, descriptor] of descriptors.entries()) {
      if (descriptor) {
        Object.defineProperty(checkoutClient, key, descriptor);
      } else {
        delete (checkoutClient as Record<string, unknown>)[key];
      }
    }
  };
}

async function waitForRender(): Promise<void> {
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForTruthy<T>(
  getValue: () => T | null | undefined,
  label: string,
): Promise<NonNullable<T>> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const value = getValue();
    if (value) {
      return value as NonNullable<T>;
    }

    await waitForRender();
  }

  throw new Error(`Timed out waiting for value: ${label}`);
}

function createAdyenButtonApiState() {
  return {
    billing_address: {
      use_customer_shipping_address: true,
      first_name: "Taylor",
      last_name: "Morgan",
      company: "",
      address1: "123 Main Street",
      address2: "",
      city: "Minneapolis",
      region: "MN",
      postal_code: "55401",
      country: "US",
      phone: "6125550100",
    },
    shipments: [
      {
        country_options: ["US", "NL", "BE", "PL"],
        region_options: ["MN", "WI"],
      },
    ],
    payment_gateways: [
      {
        type: "adyen_embedded",
        session_id: "adyen-session-id",
        session_data: "adyen-session-data",
        environment: "test",
        client_key: "adyen-client-key",
      },
    ],
  };
}

type AdyenComponentProps = Record<string, unknown> & {
  type?: string;
  onPaymentCompleted?: (result: unknown) => void;
};

type AdyenComponentInstance = {
  props: AdyenComponentProps;
  mount: ReturnType<typeof vi.fn>;
  unmount: ReturnType<typeof vi.fn>;
  isAvailable: ReturnType<typeof vi.fn>;
  submit: ReturnType<typeof vi.fn>;
};

type AdyenButtonMethodCase = {
  componentName: string;
  expectedButtonType: string;
  methodName: string;
  methodType: string;
  optionType: string;
};

const ADYEN_BUTTON_METHOD_CASES: AdyenButtonMethodCase[] = [
  {
    componentName: "ApplePay",
    expectedButtonType: "plain",
    methodName: "Apple Pay",
    methodType: "applepay",
    optionType: "apple-pay",
  },
  {
    componentName: "GooglePay",
    expectedButtonType: "pay",
    methodName: "Google Pay",
    methodType: "googlepay",
    optionType: "google-pay",
  },
  {
    componentName: "Redirect",
    expectedButtonType: "pay",
    methodName: "AliPay",
    methodType: "alipay",
    optionType: "alipay",
  },
  {
    componentName: "Redirect",
    expectedButtonType: "pay",
    methodName: "Paysafecard",
    methodType: "paysafecard",
    optionType: "paysafecard",
  },
  {
    componentName: "CashAppPay",
    expectedButtonType: "pay",
    methodName: "Cash App Pay",
    methodType: "cashapp",
    optionType: "cash-app",
  },
  {
    componentName: "Redirect",
    expectedButtonType: "pay",
    methodName: "Zip",
    methodType: "zip",
    optionType: "zip",
  },
  {
    componentName: "WeChat",
    expectedButtonType: "pay",
    methodName: "WeChat Pay",
    methodType: "wechatpay",
    optionType: "we-chat",
  },
  {
    componentName: "WeChat",
    expectedButtonType: "pay",
    methodName: "WeChat Pay QR",
    methodType: "wechatpayQR",
    optionType: "we-chat-qr",
  },
  {
    componentName: "Redirect",
    expectedButtonType: "pay",
    methodName: "WeChat Pay Web",
    methodType: "wechatpayWeb",
    optionType: "we-chat-web",
  },
  {
    componentName: "Redirect",
    expectedButtonType: "pay",
    methodName: "WeChat Pay Mini Program",
    methodType: "wechatpayMiniProgram",
    optionType: "we-chat-mini-program",
  },
  {
    componentName: "Redirect",
    expectedButtonType: "pay",
    methodName: "Zip POS",
    methodType: "zip_pos",
    optionType: "zip-pos",
  },
];

function createAdyenComponentMock(params?: {
  mountText?: string;
  result?: Record<string, unknown>;
}) {
  const instances: AdyenComponentInstance[] = [];
  const Component = vi.fn(function AdyenComponent(
    this: AdyenComponentInstance,
    _checkout: unknown,
    props?: AdyenComponentProps,
  ) {
    const componentProps = props ?? {};
    this.props = componentProps;
    this.mount = vi.fn((container: HTMLElement) => {
      container.textContent =
        params?.mountText ?? `Adyen ${componentProps.type}`;
    });
    this.unmount = vi.fn();
    this.isAvailable = vi.fn(() => Promise.resolve());
    this.submit = vi.fn(() => {
      componentProps.onPaymentCompleted?.(
        params?.result ?? {
          resultCode: "Authorised",
          sessionData: "next-session-data",
        },
      );
    });
    instances.push(this);
  });

  return { Component, instances };
}

afterEach(() => {
  document.body.replaceChildren();
  document.head
    .querySelectorAll('link[data-foxy-adyen-css="true"]')
    .forEach((node) => node.remove());
  document.head
    .querySelectorAll('style[data-foxy-adyen-button-styles="true"]')
    .forEach((node) => node.remove());
});

describe("PaymentButtonElement", () => {
  it("renders Adyen Apple Pay instead of the default button", async () => {
    const { Component: ApplePay, instances } = createAdyenComponentMock();
    const restoreClient = overrideCheckoutClient({
      state: createAdyenButtonApiState(),
      json: undefined,
      adyenEmbedded: {
        ApplePay,
        paymentMethodsResponse: {
          paymentMethods: [{ type: "applepay", name: "Apple Pay" }],
        },
      },
    });
    const selector = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    const button = document.createElement(
      "foxy-payment-button",
    ) as PaymentButtonElement;

    try {
      selector.setAttribute("button", "pay-btn");
      button.id = "pay-btn";
      document.body.append(selector, button);

      const adyenContainer = await waitForTruthy(
        () => button.querySelector("[data-foxy-adyen-button]"),
        "Adyen Apple Pay container",
      );

      expect(adyenContainer.textContent).toContain("Adyen applepay");
      expect((adyenContainer as HTMLElement).style.minHeight).toBe("2.75rem");
      expect((adyenContainer as HTMLElement).style.height).toBe("2.75rem");
      expect(
        (adyenContainer as HTMLElement).style.getPropertyValue(
          "--apple-pay-button-height",
        ),
      ).toBe("2.75rem");
      expect(
        (adyenContainer as HTMLElement).style.getPropertyValue(
          "--apple-pay-button-border-radius",
        ),
      ).toBe("var(--radius, 0.625rem)");
      expect(
        document.head.querySelector(
          'style[data-foxy-adyen-button-styles="true"]',
        )?.textContent,
      ).toContain("height: 2.75rem !important");
      expect(button.hasAttribute("data-adyen-button")).toBe(true);
      expect(
        button.shadowRoot?.querySelector("slot[name='adyen-button']"),
      ).not.toBeNull();
      expect(button.shadowRoot?.textContent).toContain(
        ":host([data-adyen-button]) button[part='button'] { display: none; }",
      );
      expect(ApplePay).toHaveBeenCalledTimes(1);
      expect(instances[0]?.props).toMatchObject({
        type: "applepay",
        paymentMethodType: "applepay",
        paymentMethod: { type: "applepay", name: "Apple Pay" },
        showPayButton: true,
        buttonType: "plain",
      });
    } finally {
      selector.remove();
      button.remove();
      restoreClient();
    }
  });

  it("renders Adyen Google Pay instead of the default button", async () => {
    const { Component: GooglePay, instances } = createAdyenComponentMock();
    const restoreClient = overrideCheckoutClient({
      state: createAdyenButtonApiState(),
      json: undefined,
      adyenEmbedded: {
        GooglePay,
        paymentMethodsResponse: {
          paymentMethods: [{ type: "googlepay", name: "Google Pay" }],
        },
      },
    });
    const selector = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    const button = document.createElement(
      "foxy-payment-button",
    ) as PaymentButtonElement;

    try {
      selector.setAttribute("button", "pay-btn");
      button.id = "pay-btn";
      document.body.append(selector, button);

      const adyenContainer = await waitForTruthy(
        () => button.querySelector("[data-foxy-adyen-button]"),
        "Adyen Google Pay container",
      );

      expect(adyenContainer.textContent).toContain("Adyen googlepay");
      expect((adyenContainer as HTMLElement).style.height).toBe("2.75rem");
      expect(
        document.head.querySelector(
          'style[data-foxy-adyen-button-styles="true"]',
        )?.textContent,
      ).toContain("[data-foxy-adyen-button] google-pay-button");
      expect(
        document.head.querySelector(
          'style[data-foxy-adyen-button-styles="true"]',
        )?.textContent,
      ).toContain("border: none !important");
      expect(
        document.head.querySelector(
          'style[data-foxy-adyen-button-styles="true"]',
        )?.textContent,
      ).toContain("--foxy-adyen-button-background: var(--primary, #00112c)");
      expect(
        document.head.querySelector(
          'style[data-foxy-adyen-button-styles="true"]',
        )?.textContent,
      ).toContain(
        "--adyen-sdk-color-background-always-dark: var(--foxy-adyen-button-background)",
      );
      expect(
        document.head.querySelector(
          'style[data-foxy-adyen-button-styles="true"]',
        )?.textContent,
      ).toContain("[data-foxy-adyen-button] .adyen-checkout__button--pay");
      expect(button.hasAttribute("data-adyen-button")).toBe(true);
      expect(GooglePay).toHaveBeenCalledTimes(1);
      expect(instances[0]?.props).toMatchObject({
        type: "googlepay",
        paymentMethodType: "googlepay",
        paymentMethod: { type: "googlepay", name: "Google Pay" },
        showPayButton: true,
        buttonType: "pay",
      });
    } finally {
      selector.remove();
      button.remove();
      restoreClient();
    }
  });

  it("registers Adyen Apple Pay as the selector tokenization controller", async () => {
    const adyenResult = {
      resultCode: "Authorised",
      sessionData: "next-session-data",
    };
    const { Component: ApplePay, instances } = createAdyenComponentMock({
      result: adyenResult,
    });
    const restoreClient = overrideCheckoutClient({
      state: createAdyenButtonApiState(),
      json: undefined,
      adyenEmbedded: {
        ApplePay,
        paymentMethodsResponse: {
          paymentMethods: [{ type: "applepay", name: "Apple Pay" }],
        },
      },
    });
    const selector = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    const button = document.createElement(
      "foxy-payment-button",
    ) as PaymentButtonElement;

    try {
      selector.setAttribute("button", "pay-btn");
      button.id = "pay-btn";
      document.body.append(selector, button);

      await waitForTruthy(
        () => button.querySelector("[data-foxy-adyen-button]"),
        "Adyen Apple Pay container",
      );

      await expect(selector.tokenize()).resolves.toEqual({
        adyenEmbedded: {
          sessionId: "adyen-session-id",
          paymentMethodType: "applepay",
          paymentMethod: { type: "applepay", name: "Apple Pay" },
          result: adyenResult,
        },
      });
      expect(
        instances.some((instance) => instance.submit.mock.calls.length === 1),
      ).toBe(true);
    } finally {
      selector.remove();
      button.remove();
      restoreClient();
    }
  });

  it("registers Adyen Google Pay as the selector tokenization controller", async () => {
    const adyenResult = {
      resultCode: "Authorised",
      sessionData: "next-session-data",
    };
    const { Component: GooglePay, instances } = createAdyenComponentMock({
      result: adyenResult,
    });
    const restoreClient = overrideCheckoutClient({
      state: createAdyenButtonApiState(),
      json: undefined,
      adyenEmbedded: {
        GooglePay,
        paymentMethodsResponse: {
          paymentMethods: [{ type: "googlepay", name: "Google Pay" }],
        },
      },
    });
    const selector = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    const button = document.createElement(
      "foxy-payment-button",
    ) as PaymentButtonElement;

    try {
      selector.setAttribute("button", "pay-btn");
      button.id = "pay-btn";
      document.body.append(selector, button);

      await waitForTruthy(
        () => button.querySelector("[data-foxy-adyen-button]"),
        "Adyen Google Pay container",
      );

      await expect(selector.tokenize()).resolves.toEqual({
        adyenEmbedded: {
          sessionId: "adyen-session-id",
          paymentMethodType: "googlepay",
          paymentMethod: { type: "googlepay", name: "Google Pay" },
          result: adyenResult,
        },
      });
      expect(
        instances.some((instance) => instance.submit.mock.calls.length === 1),
      ).toBe(true);
    } finally {
      selector.remove();
      button.remove();
      restoreClient();
    }
  });

  it("enables the default button for Adyen Online Banking", async () => {
    const { Component: OnlineBankingPL, instances } =
      createAdyenComponentMock();
    const restoreClient = overrideCheckoutClient({
      state: createAdyenButtonApiState(),
      json: undefined,
      adyenEmbedded: {
        OnlineBankingPL,
        paymentMethodsResponse: {
          paymentMethods: [
            { type: "onlinebanking_PL", name: "Online Banking" },
          ],
        },
      },
    });
    const selector = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    const button = document.createElement(
      "foxy-payment-button",
    ) as PaymentButtonElement;

    try {
      selector.setAttribute("button", "pay-btn");
      button.id = "pay-btn";
      document.body.append(selector, button);

      await waitForTruthy(() => instances[0], "Adyen Online Banking component");
      const defaultButton = await waitForTruthy(
        () => button.shadowRoot?.querySelector("button[part='button']"),
        "default payment button",
      );

      expect(button.hasAttribute("data-adyen-button")).toBe(false);
      expect(button.querySelector("[data-foxy-adyen-button]")).toBeNull();
      expect((defaultButton as HTMLButtonElement).disabled).toBe(false);
      expect(defaultButton.textContent).toBe("Continue to Online Banking");
      expect(OnlineBankingPL).toHaveBeenCalledTimes(1);
      expect(instances[0]?.props).toMatchObject({
        type: "onlinebanking_PL",
        paymentMethodType: "onlinebanking_PL",
        paymentMethod: {
          type: "onlinebanking_PL",
          name: "Online Banking",
        },
        showPayButton: false,
      });
    } finally {
      selector.remove();
      button.remove();
      restoreClient();
    }
  });

  it("labels Adyen Dragonpay as Online Banking", async () => {
    const { Component: Dragonpay, instances } = createAdyenComponentMock();
    const restoreClient = overrideCheckoutClient({
      state: createAdyenButtonApiState(),
      json: undefined,
      adyenEmbedded: {
        Dragonpay,
        paymentMethodsResponse: {
          paymentMethods: [{ type: "dragonpay", name: "Online Banking" }],
        },
      },
    });
    const selector = document.createElement(
      "foxy-payment-method-selector",
    ) as PaymentMethodSelectorElement;
    const button = document.createElement(
      "foxy-payment-button",
    ) as PaymentButtonElement;

    try {
      selector.setAttribute("button", "pay-btn");
      button.id = "pay-btn";
      document.body.append(selector, button);

      await waitForTruthy(() => instances[0], "Adyen Dragonpay component");
      const defaultButton = await waitForTruthy(
        () => button.shadowRoot?.querySelector("button[part='button']"),
        "default payment button",
      );

      expect(button.hasAttribute("data-adyen-button")).toBe(false);
      expect(button.querySelector("[data-foxy-adyen-button]")).toBeNull();
      expect((defaultButton as HTMLButtonElement).disabled).toBe(false);
      expect(defaultButton.textContent).toBe("Continue to Online Banking");
      expect(Dragonpay).toHaveBeenCalledTimes(1);
      expect(instances[0]?.props).toMatchObject({
        type: "dragonpay",
        paymentMethodType: "dragonpay",
        paymentMethod: {
          type: "dragonpay",
          name: "Online Banking",
        },
        showPayButton: false,
      });
    } finally {
      selector.remove();
      button.remove();
      restoreClient();
    }
  });

  it.each(
    ADYEN_BUTTON_METHOD_CASES.filter(
      ({ optionType }) =>
        optionType !== "apple-pay" && optionType !== "google-pay",
    ),
  )(
    "renders Adyen $methodName instead of the default button",
    async ({ componentName, expectedButtonType, methodName, methodType }) => {
      const { Component, instances } = createAdyenComponentMock();
      const restoreClient = overrideCheckoutClient({
        state: createAdyenButtonApiState(),
        json: undefined,
        adyenEmbedded: {
          [componentName]: Component,
          paymentMethodsResponse: {
            paymentMethods: [{ type: methodType, name: methodName }],
          },
        },
      });
      const selector = document.createElement(
        "foxy-payment-method-selector",
      ) as PaymentMethodSelectorElement;
      const button = document.createElement(
        "foxy-payment-button",
      ) as PaymentButtonElement;

      try {
        selector.setAttribute("button", "pay-btn");
        button.id = "pay-btn";
        document.body.append(selector, button);

        const adyenContainer = await waitForTruthy(
          () => button.querySelector("[data-foxy-adyen-button]"),
          `Adyen ${methodName} container`,
        );

        expect(adyenContainer.textContent).toContain(`Adyen ${methodType}`);
        expect((adyenContainer as HTMLElement).style.height).toBe("2.75rem");
        expect(button.hasAttribute("data-adyen-button")).toBe(true);
        expect(Component).toHaveBeenCalledTimes(1);
        expect(instances[0]?.props).toMatchObject({
          type: methodType,
          paymentMethodType: methodType,
          paymentMethod: { type: methodType, name: methodName },
          showPayButton: true,
          buttonType: expectedButtonType,
        });
      } finally {
        selector.remove();
        button.remove();
        restoreClient();
      }
    },
  );

  it.each(
    ADYEN_BUTTON_METHOD_CASES.filter(
      ({ optionType }) =>
        optionType !== "apple-pay" && optionType !== "google-pay",
    ),
  )(
    "registers Adyen $methodName as the selector tokenization controller",
    async ({ componentName, methodName, methodType }) => {
      const adyenResult = {
        resultCode: "Authorised",
        sessionData: "next-session-data",
      };
      const { Component, instances } = createAdyenComponentMock({
        result: adyenResult,
      });
      const restoreClient = overrideCheckoutClient({
        state: createAdyenButtonApiState(),
        json: undefined,
        adyenEmbedded: {
          [componentName]: Component,
          paymentMethodsResponse: {
            paymentMethods: [{ type: methodType, name: methodName }],
          },
        },
      });
      const selector = document.createElement(
        "foxy-payment-method-selector",
      ) as PaymentMethodSelectorElement;
      const button = document.createElement(
        "foxy-payment-button",
      ) as PaymentButtonElement;

      try {
        selector.setAttribute("button", "pay-btn");
        button.id = "pay-btn";
        document.body.append(selector, button);

        await waitForTruthy(
          () => button.querySelector("[data-foxy-adyen-button]"),
          `Adyen ${methodName} container`,
        );

        await expect(selector.tokenize()).resolves.toEqual({
          adyenEmbedded: {
            sessionId: "adyen-session-id",
            paymentMethodType: methodType,
            paymentMethod: { type: methodType, name: methodName },
            result: adyenResult,
          },
        });
        expect(
          instances.some((instance) => instance.submit.mock.calls.length === 1),
        ).toBe(true);
      } finally {
        selector.remove();
        button.remove();
        restoreClient();
      }
    },
  );
});
