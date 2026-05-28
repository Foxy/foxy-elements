import { client as checkoutClient } from "@foxy.io/sdk/checkout/client";
import type { ReactNode } from "react";
import type {
  PaymentMethodSelectorBillingError,
  PaymentController,
  PaymentMethodSelectorBillingAddress,
  PaymentMethodSelectorOption,
} from "./types";

import {
  Suspense,
  createElement,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
} from "@foxy.io/design-system/ui/card";
import { BillingAddressSection } from "./billing";
import { Checkbox } from "@foxy.io/design-system/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@foxy.io/design-system/ui/field";
import { Input } from "@foxy.io/design-system/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@foxy.io/design-system/ui/radio-group";
import { Skeleton } from "@foxy.io/design-system/ui/skeleton";
import {
  type HostedFieldStyleAttributes,
  useHostedFieldStyleAttributes,
} from "./stripe/style-hooks";
import { PaymentOptionBrandIcon as PaymentOptionBrandIconComponent } from "./icons/payment-option-brand-icon";
import {
  BUTTON_CLICK_HINT_OPTION_TYPES,
  CARD_TYPES,
  FIELD_STYLE_PROBE_CLASS_NAME,
  GATEWAY_NAME_BY_TYPE,
  PURCHASE_ORDER_MAX_LENGTH,
} from "./constants";
import {
  BILLING_FIELD_LABEL_BY_ID,
  BILLING_SECTION_MESSAGES,
  OPTION_DESCRIPTION_BY_TYPE,
  OPTION_LABEL_BY_TYPE,
  messages,
} from "./messages";
import { cn } from "@/lib/utils";
import { useIntl } from "react-intl";
import type { IntlShape } from "react-intl";

const CardOptionEmbed = lazy(() => import("./embeds/card-hosted"));
const AchOptionEmbed = lazy(() => import("./embeds/ach-hosted"));
const KlarnaOptionEmbed = lazy(() => import("./embeds/klarna"));
const PurchaseOrderOptionEmbed = lazy(() => import("./embeds/purchase-order"));
const StripeCardElementOption = lazy(() => import("./embeds/stripe-card"));
const StripePaymentElementOption = lazy(
  () => import("./embeds/stripe-payment"),
);
const PAYMENT_OPTION_BODY_FALLBACK = <Skeleton className="h-8 w-full" />;

type PaymentProps = {
  options: PaymentMethodSelectorOption[];
  selectedOptionId?: string;
  lang?: string;
  disabled?: boolean;
  loading?: boolean;
  onSelectionChange?: (
    optionId: string,
    optionType: string | undefined,
  ) => void;
  onControllerReady?: (
    optionId: string,
    controller: PaymentController | null,
  ) => void;
  renderStripeContent?: (params: {
    option: PaymentMethodSelectorOption;
    disabled?: boolean;
    onControllerReady?: (controller: PaymentController | null) => void;
  }) => ReactNode;
  billingAddress?: PaymentMethodSelectorBillingAddress;
  billingError?: PaymentMethodSelectorBillingError;
  onBillingAddressChange?: (params: {
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  }) => void;
};

type CheckoutClientLike = {
  paypal?: unknown;
};

type PayPalMessagesRenderer = {
  render?: (element: HTMLElement) => Promise<unknown> | unknown;
};

type PayPalMessagesSdk = {
  createPayPalMessages?: () =>
    | PayPalMessagesRenderer
    | Promise<PayPalMessagesRenderer>;
};

function getGatewayName(gateway: string): string {
  const normalized = gateway.trim();
  if (!normalized) return "";

  const mappedGateway = GATEWAY_NAME_BY_TYPE[normalized.toLowerCase()];
  return mappedGateway ?? normalized;
}

type PaymentOptionLabel = {
  fullLabel: string;
  baseLabel: string;
  viaLabel?: string;
};

function getBasePaymentOptionLabel(
  option: PaymentMethodSelectorOption,
  intl: IntlShape,
): string {
  const labelDescriptor = option.type
    ? OPTION_LABEL_BY_TYPE[option.type]
    : undefined;
  if (labelDescriptor) {
    return intl.formatMessage(labelDescriptor);
  }

  if (option.type !== "saved-card") {
    return option.label;
  }

  const compactMatch = option.label.match(/^(.*?)\s*••••\s*(\d{4})$/);
  const endingInMatch = option.label.match(/^(.*?)\s+ending\s+in\s+(\d{4})$/i);
  const labelMatch = compactMatch ?? endingInMatch;
  const brandName = labelMatch?.[1]?.trim();
  const last4 = labelMatch?.[2];

  if (!brandName || !last4) {
    return option.label;
  }

  const expiryMatch = option.description?.match(/(\d{1,2})\s*\/\s*(\d{2,4})/);
  if (!expiryMatch) {
    return `${brandName} ••••${last4}`;
  }

  const month = expiryMatch[1].padStart(2, "0");
  const year = expiryMatch[2].slice(-2);
  return `${brandName} ••••${last4}, ${intl.formatMessage(messages.savedCardExpiresLabel, { month, year })}`;
}

function getPaymentOptionLabel(
  option: PaymentMethodSelectorOption,
  typeCounts: Record<string, number>,
  baseLabelCounts: Record<string, number>,
  intl: IntlShape,
): PaymentOptionLabel {
  const baseLabel = getBasePaymentOptionLabel(option, intl);

  const hasDuplicateType = option.type
    ? (typeCounts[option.type] ?? 0) >= 2
    : false;
  const hasDuplicateBaseLabel = (baseLabelCounts[baseLabel] ?? 0) >= 2;

  if (!hasDuplicateType && !hasDuplicateBaseLabel) {
    return { fullLabel: baseLabel, baseLabel };
  }

  if (!option.gateway) {
    return { fullLabel: baseLabel, baseLabel };
  }

  const gatewayName = getGatewayName(option.gateway);
  if (!gatewayName) {
    return { fullLabel: baseLabel, baseLabel };
  }

  const viaLabel = intl.formatMessage(messages.optionViaGateway, {
    gatewayName,
  });
  return {
    fullLabel: `${baseLabel} ${viaLabel}`,
    baseLabel,
    viaLabel,
  };
}

function getPaymentOptionDescriptionText(
  option: PaymentMethodSelectorOption,
  intl: IntlShape,
): string | undefined {
  if (option.klarna) {
    return intl.formatMessage(messages.optionDescriptionKlarna);
  }

  if (!option.type) return option.description;
  const descriptor = OPTION_DESCRIPTION_BY_TYPE[option.type];
  if (!descriptor) return option.description;
  return intl.formatMessage(descriptor);
}

function CursorClickButtonIcon({
  className,
}: {
  className?: string;
}): ReactNode {
  return (
    <svg
      className={cn("fill-current", className)}
      width="64"
      height="33"
      viewBox="0 0 64 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M32.6709 13.5104C32.0279 12.929 31 13.3857 31 14.2526V27.0299C31.0003 27.8897 32.0141 28.3483 32.6602 27.7809L35.5498 25.2419L38.6396 32.1022C38.8642 32.6001 39.4469 32.8258 39.9482 32.609L40.4482 32.3932C40.9681 32.1685 41.1974 31.557 40.9541 31.0456L37.7441 24.3014L41.7158 23.9538C42.5856 23.8775 42.9464 22.802 42.2988 22.2165L32.6709 13.5104Z" />
      <path d="M64 6C64 2.68629 61.3137 0 58 0H6C2.68629 0 0 2.68629 0 6V18C0 21.3137 2.68629 24 6 24H28C28.5523 24 29 23.5523 29 23C29 22.4477 28.5523 22 28 22H6C3.79086 22 2 20.2091 2 18V6C2 3.79086 3.79086 2 6 2H58C60.2091 2 62 3.79086 62 6V18C62 20.2091 60.2091 22 58 22H45.4795C44.9272 22 44.4795 22.4477 44.4795 23C44.4795 23.5523 44.9272 24 45.4795 24H58C61.3137 24 64 21.3137 64 18V6Z" />
      <path d="M23.117 12.8881C22.5836 12.7451 22.267 12.1968 22.4099 11.6633C22.5529 11.1298 23.1012 10.8133 23.6347 10.9562L27.4984 11.9915C28.0318 12.1344 28.3484 12.6828 28.2055 13.2162C28.0625 13.7497 27.5142 14.0663 26.9807 13.9233L23.117 12.8881Z" />
      <path d="M36.1214 6.33133C36.5119 5.9408 37.1451 5.9408 37.5356 6.33133C37.9261 6.72185 37.9261 7.35502 37.5356 7.74554L34.7071 10.574C34.3166 10.9645 33.6835 10.9645 33.2929 10.574C32.9024 10.1834 32.9024 9.55028 33.2929 9.15975L36.1214 6.33133Z" />
      <path d="M27.0743 6.07106C26.8409 5.57052 27.0574 4.97554 27.558 4.74213C28.0585 4.50873 28.6535 4.72528 28.8869 5.22582L30.5774 8.85105C30.8108 9.35159 30.5942 9.94657 30.0937 10.18C29.5932 10.4134 28.9982 10.1968 28.7648 9.69629L27.0743 6.07106Z" />
    </svg>
  );
}

function PayPalPayLaterDescription({
  option,
  fallbackText,
}: {
  option: PaymentMethodSelectorOption;
  fallbackText: string;
}) {
  const elementRef = useRef<HTMLElement | null>(null);
  const payPalMessage = option.paypalMessage;

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !payPalMessage) {
      return;
    }

    const paypal = (checkoutClient as CheckoutClientLike).paypal as
      | PayPalMessagesSdk
      | null
      | undefined;

    if (!paypal?.createPayPalMessages) {
      return;
    }

    let cancelled = false;

    void Promise.resolve(paypal.createPayPalMessages())
      .then((messagesRenderer) => {
        if (cancelled || !messagesRenderer?.render) {
          return;
        }

        return messagesRenderer.render(element);
      })
      .catch(() => {
        // Keep the light-DOM fallback visible when PayPal messages are unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [
    payPalMessage,
    payPalMessage?.amount,
    payPalMessage?.buyerCountry,
    payPalMessage?.currencyCode,
    payPalMessage?.locale,
  ]);

  return createElement(
    "paypal-message",
    {
      ref: (node: Element | null) => {
        elementRef.current = node as HTMLElement | null;
      },
      class: "block min-h-5",
      "data-paypal-paylater-label": "true",
      "data-pp-page-type": "checkout",
      "data-pp-style-layout": "text",
      "data-pp-style-logo-type": "inline",
      "data-pp-amount": payPalMessage?.amount,
      "data-pp-currency": payPalMessage?.currencyCode,
      "data-pp-buyercountry": payPalMessage?.buyerCountry,
      "data-pp-locale": payPalMessage?.locale,
    },
    fallbackText,
  );
}

function renderPaymentOptionDescription(
  option: PaymentMethodSelectorOption,
  intl: IntlShape,
): ReactNode {
  const description = getPaymentOptionDescriptionText(option, intl);

  if (!description) {
    return null;
  }

  const content =
    option.type === "paypal-pay-later" && option.paypalMessage ? (
      <PayPalPayLaterDescription option={option} fallbackText={description} />
    ) : (
      description
    );

  if (!option.type || !BUTTON_CLICK_HINT_OPTION_TYPES.has(option.type)) {
    return content;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="min-w-0">{content}</div>
      <span
        aria-hidden="true"
        data-payment-option-click-hint="true"
        className="text-muted-foreground"
      >
        <CursorClickButtonIcon className="h-12 w-12 text-muted-foreground" />
      </span>
    </div>
  );
}

function getPaymentOptionBrandIcon(
  option: PaymentMethodSelectorOption,
): ReactNode {
  return <PaymentOptionBrandIconComponent option={option} />;
}

function renderPaymentOptionBodyFallback(
  option: PaymentMethodSelectorOption,
  intl: IntlShape,
): ReactNode {
  if (option.type === "ach") {
    return (
      <div className="flex flex-col gap-2.5">
        <Field orientation="horizontal" className="sm:col-span-2">
          <Checkbox
            id={`ach-owner-confirmation-${option.id}`}
            checked={false}
            disabled
            data-ach-owner-confirmation="true"
            aria-label={intl.formatMessage(messages.achOwnerConfirmationLabel)}
          />
          <FieldLabel htmlFor={`ach-owner-confirmation-${option.id}`}>
            {intl.formatMessage(messages.achOwnerConfirmationLabel)}
          </FieldLabel>
        </Field>
      </div>
    );
  }

  if (option.type === "purchase-order") {
    const fieldId = `purchase-order-number-${option.id}`;

    return (
      <div className="flex flex-col gap-2">
        <Field>
          <FieldLabel htmlFor={fieldId}>
            {intl.formatMessage(messages.purchaseOrderNumberLabel)}
          </FieldLabel>
          <Input
            id={fieldId}
            data-purchase-order-number="true"
            type="text"
            disabled
            value=""
            readOnly
            className="text-foreground"
            placeholder={intl.formatMessage(
              messages.purchaseOrderNumberPlaceholder,
            )}
          />
        </Field>
      </div>
    );
  }

  return PAYMENT_OPTION_BODY_FALLBACK;
}

function PaymentOptionBody({
  option,
  lang,
  disabled,
  styleAttributes,
  onControllerReady,
  renderStripeContent,
  billingAddress,
  billingError,
  onBillingAddressChange,
}: {
  option: PaymentMethodSelectorOption;
  lang?: string;
  disabled?: boolean;
  styleAttributes: HostedFieldStyleAttributes;
  onControllerReady?: (controller: PaymentController | null) => void;
  renderStripeContent?: (params: {
    option: PaymentMethodSelectorOption;
    disabled?: boolean;
    onControllerReady?: (controller: PaymentController | null) => void;
  }) => ReactNode;
  billingAddress?: PaymentMethodSelectorBillingAddress;
  billingError?: PaymentMethodSelectorBillingError;
  onBillingAddressChange?: (params: {
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  }) => void;
}) {
  const intl = useIntl();
  const isCard = option.type ? CARD_TYPES.has(option.type) : false;
  const bodyFallback = renderPaymentOptionBodyFallback(option, intl);
  const achDefaultLabels = {
    "routing-number": intl.formatMessage(messages.achRoutingNumber),
    "account-number": intl.formatMessage(messages.achAccountNumber),
    "account-type": intl.formatMessage(messages.achAccountType),
    "account-holder-name": intl.formatMessage(messages.achAccountHolderName),
  };
  const billingSection = (
    <BillingAddressSection
      option={option}
      disabled={disabled}
      billingAddress={billingAddress}
      billingError={billingError}
      onBillingAddressChange={onBillingAddressChange}
      fieldLabelById={BILLING_FIELD_LABEL_BY_ID}
      messages={BILLING_SECTION_MESSAGES}
    />
  );

  if (isCard && option.hostedCard) {
    return (
      <>
        <Suspense fallback={bodyFallback}>
          <CardOptionEmbed
            option={option}
            lang={lang}
            disabled={disabled}
            styleAttributes={styleAttributes}
            onControllerReady={onControllerReady}
            fullFieldLabel={intl.formatMessage(messages.cardFieldLabelFull)}
            cscFieldLabel={intl.formatMessage(messages.cardFieldLabelCsc)}
            tokenizeErrorMessage={intl.formatMessage(
              messages.tokenizeCardError,
            )}
          />
        </Suspense>
        {billingSection}
      </>
    );
  }

  if (option.type === "ach" && option.hostedFields) {
    return (
      <>
        <Suspense fallback={bodyFallback}>
          <AchOptionEmbed
            option={option}
            lang={lang}
            disabled={disabled}
            styleAttributes={styleAttributes}
            onControllerReady={onControllerReady}
            defaultLabelsByField={achDefaultLabels}
            ownerConfirmationLabel={intl.formatMessage(
              messages.achOwnerConfirmationLabel,
            )}
            ownerConfirmationErrorMessage={intl.formatMessage(
              messages.achOwnerConfirmationError,
            )}
            tokenizeErrorMessage={intl.formatMessage(messages.tokenizeAchError)}
          />
        </Suspense>
        {billingSection}
      </>
    );
  }

  if (option.type === "stripe-card-element" && option.stripeCardElement) {
    if (renderStripeContent) {
      return (
        <>
          {renderStripeContent({ option, disabled, onControllerReady })}
          {billingSection}
        </>
      );
    }

    return (
      <>
        <Suspense fallback={bodyFallback}>
          <StripeCardElementOption
            option={option}
            disabled={disabled}
            onControllerReady={onControllerReady}
          />
        </Suspense>
        {billingSection}
      </>
    );
  }

  if (option.type === "stripe-payment-element" && option.stripePaymentElement) {
    if (renderStripeContent) {
      return (
        <>
          {renderStripeContent({ option, disabled, onControllerReady })}
          {billingSection}
        </>
      );
    }

    return (
      <>
        <Suspense fallback={bodyFallback}>
          <StripePaymentElementOption
            option={option}
            disabled={disabled}
            onControllerReady={onControllerReady}
          />
        </Suspense>
        {billingSection}
      </>
    );
  }

  if (option.type === "purchase-order") {
    return (
      <Suspense fallback={bodyFallback}>
        <PurchaseOrderOptionEmbed
          option={option}
          disabled={disabled}
          onControllerReady={onControllerReady}
          label={intl.formatMessage(messages.purchaseOrderNumberLabel)}
          placeholder={intl.formatMessage(
            messages.purchaseOrderNumberPlaceholder,
          )}
          requiredErrorMessage={intl.formatMessage(
            messages.purchaseOrderNumberRequired,
          )}
          tooLongErrorMessage={intl.formatMessage(
            messages.purchaseOrderNumberTooLong,
            { maxLength: PURCHASE_ORDER_MAX_LENGTH },
          )}
          maxLength={PURCHASE_ORDER_MAX_LENGTH}
        />
      </Suspense>
    );
  }

  if (option.klarna) {
    return (
      <>
        <Suspense fallback={bodyFallback}>
          <KlarnaOptionEmbed
            option={option}
            disabled={disabled}
            onControllerReady={onControllerReady}
            loadingMessage={intl.formatMessage(messages.klarnaLoading)}
            unavailableMessage={intl.formatMessage(messages.klarnaUnavailable)}
            loadErrorMessage={intl.formatMessage(messages.klarnaLoadError)}
            authorizeErrorMessage={intl.formatMessage(
              messages.klarnaAuthorizeError,
            )}
            finalizeErrorMessage={intl.formatMessage(
              messages.klarnaFinalizeError,
            )}
          />
        </Suspense>
        {billingSection}
      </>
    );
  }

  return billingSection;
}

function hasBillingAddressContent(
  option: PaymentMethodSelectorOption,
  billingAddress: PaymentMethodSelectorBillingAddress | undefined,
): boolean {
  if (!billingAddress?.fields.length) {
    return false;
  }

  if (option.klarna) {
    return true;
  }

  if (!option.type) {
    return false;
  }

  return (
    option.type === "new-card" ||
    option.type === "saved-card" ||
    option.type === "stripe-card-element" ||
    option.type === "stripe-payment-element"
  );
}

function hasPaymentOptionBodyContent(
  option: PaymentMethodSelectorOption,
  billingAddress: PaymentMethodSelectorBillingAddress | undefined,
): boolean {
  const isCard = option.type ? CARD_TYPES.has(option.type) : false;

  if (isCard && option.hostedCard) {
    return true;
  }

  if (option.type === "ach" && option.hostedFields) {
    return true;
  }

  if (option.type === "stripe-card-element" && option.stripeCardElement) {
    return true;
  }

  if (option.type === "stripe-payment-element" && option.stripePaymentElement) {
    return true;
  }

  if (option.type === "purchase-order") {
    return true;
  }

  if (option.klarna) {
    return true;
  }

  return hasBillingAddressContent(option, billingAddress);
}

export function Payment({
  options,
  selectedOptionId,
  lang,
  disabled,
  loading,
  onSelectionChange,
  onControllerReady,
  renderStripeContent,
  billingAddress,
  billingError,
  onBillingAddressChange,
}: PaymentProps) {
  const intl = useIntl();
  const visibleOptions = options ?? [];
  const hasSingleOption = visibleOptions.length === 1;
  const baseLabelCounts = useMemo(() => {
    return visibleOptions.reduce<Record<string, number>>((counts, option) => {
      const baseLabel = getBasePaymentOptionLabel(option, intl);
      counts[baseLabel] = (counts[baseLabel] ?? 0) + 1;
      return counts;
    }, {});
  }, [intl, visibleOptions]);
  const optionTypeCounts = useMemo(() => {
    return visibleOptions.reduce<Record<string, number>>((counts, option) => {
      if (!option.type) return counts;

      counts[option.type] = (counts[option.type] ?? 0) + 1;
      return counts;
    }, {});
  }, [visibleOptions]);
  const [selection, setSelection] = useState<string>(selectedOptionId ?? "");
  const { probeRef, styleAttributes } = useHostedFieldStyleAttributes();
  const pendingSelectionChangeRef = useRef<string | null>(null);

  // Keep a ref so the notify effect doesn't re-fire just because the parent
  // created a new inline callback reference on every render.
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  // Sync external `selectedOptionId` prop → internal `selection` state.
  // `selection` must NOT be a dep here: adding it would cause the effect to
  // run whenever the user clicks an option, see the stale `selectedOptionId`
  // prop, and immediately revert the selection (the flash).
  useEffect(() => {
    if (!visibleOptions.length) {
      pendingSelectionChangeRef.current = null;
      setSelection((prev) => (prev ? "" : prev));
      return;
    }

    if (
      selectedOptionId &&
      visibleOptions.some((option) => option.id === selectedOptionId)
    ) {
      pendingSelectionChangeRef.current = null;
      setSelection(selectedOptionId);
      return;
    }

    // Keep the current selection if it is still a valid option; otherwise
    // fall back to the first non-disabled option.
    setSelection((prev) => {
      if (visibleOptions.some((option) => option.id === prev)) return prev;
      const fallback =
        visibleOptions.find((option) => !option.disabled) ?? visibleOptions[0];
      pendingSelectionChangeRef.current = null;
      return fallback.id;
    });
  }, [selectedOptionId, visibleOptions]);

  useEffect(() => {
    const selected = visibleOptions.find((option) => option.id === selection);
    if (!selected) return;

    if (pendingSelectionChangeRef.current !== selected.id) {
      return;
    }

    pendingSelectionChangeRef.current = null;
    onSelectionChangeRef.current?.(selected.id, selected.type);
  }, [selection, visibleOptions]);

  const [mountedOptionIds, setMountedOptionIds] = useState<Set<string>>(
    () =>
      new Set(
        [selection || selectedOptionId || visibleOptions[0]?.id].filter(
          Boolean,
        ),
      ),
  );

  useEffect(() => {
    if (!selection) return;
    setMountedOptionIds((previous) => {
      if (previous.has(selection)) return previous;
      const next = new Set(previous);
      next.add(selection);
      return next;
    });
  }, [selection]);

  useEffect(() => {
    const validOptionIds = new Set(visibleOptions.map((option) => option.id));
    setMountedOptionIds((previous) => {
      let hasChanges = false;
      const next = new Set<string>();

      previous.forEach((optionId) => {
        if (validOptionIds.has(optionId)) {
          next.add(optionId);
        } else {
          hasChanges = true;
        }
      });

      if (selection && !next.has(selection) && validOptionIds.has(selection)) {
        next.add(selection);
        hasChanges = true;
      }

      return hasChanges ? next : previous;
    });
  }, [selection, visibleOptions]);

  if (!visibleOptions.length) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full flex-col gap-1 rounded-[var(--radius)] border border-input bg-card px-4 py-3"
      >
        <p className="m-0 text-sm font-medium">
          {intl.formatMessage(messages.noPaymentMethods)}
        </p>
        <p className="m-0 text-sm text-muted-foreground">
          {intl.formatMessage(messages.noPaymentMethodsDescription)}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-2.5" aria-live="polite">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-22 w-full" />
        <p className="m-0 text-sm text-muted-foreground">
          {intl.formatMessage(messages.loadingOptions)}
        </p>
      </div>
    );
  }

  return (
    <FieldSet
      aria-label={intl.formatMessage(messages.paymentMethodsLegend)}
      className="m-0 flex border-0 p-0"
    >
      <FieldLegend className="sr-only">
        {intl.formatMessage(messages.paymentMethodsLegend)}
      </FieldLegend>
      <input
        ref={probeRef}
        data-foxy-field-style-probe="true"
        tabIndex={-1}
        aria-hidden="true"
        readOnly
        placeholder=""
        value=""
        style={{ fontFamily: "var(--font-sans)" }}
        className={`${FIELD_STYLE_PROBE_CLASS_NAME} pointer-events-none absolute z-[-1] opacity-0`}
      />
      <RadioGroup
        value={selection}
        onValueChange={(value) => {
          pendingSelectionChangeRef.current = value;
          setSelection(value);
        }}
        className="w-full"
      >
        {visibleOptions.map((option) => {
          const checked = option.id === selection;
          const mounted = mountedOptionIds.has(option.id);
          const optionDisabled = Boolean(disabled || option.disabled);
          const hasLeadingBrandIcon = Boolean(
            hasSingleOption &&
            option.type &&
            BUTTON_CLICK_HINT_OPTION_TYPES.has(option.type),
          );
          const hasBodyContent = hasPaymentOptionBodyContent(
            option,
            billingAddress,
          );
          const shouldUseCardChrome = !hasSingleOption || !hasBodyContent;
          const brandIcon = getPaymentOptionBrandIcon(option);
          const optionLabel = getPaymentOptionLabel(
            option,
            optionTypeCounts,
            baseLabelCounts,
            intl,
          );
          const optionDescription = renderPaymentOptionDescription(
            option,
            intl,
          );
          const optionBody = (
            <div className={cn(shouldUseCardChrome && "px-3 py-3")}>
              <Field orientation="horizontal" data-disabled={optionDisabled}>
                {!hasSingleOption ? (
                  <RadioGroupItem
                    id={`payment-option-${option.id}`}
                    value={option.id}
                    disabled={optionDisabled}
                    aria-label={optionLabel.fullLabel}
                    className="mt-0.5"
                  />
                ) : null}
                <FieldContent
                  style={
                    hasLeadingBrandIcon
                      ? {
                          columnGap: "calc(var(--spacing) * 3)",
                          rowGap: "calc(var(--spacing) * 0.5)",
                        }
                      : undefined
                  }
                  className={cn(
                    "min-w-0 flex-1",
                    hasLeadingBrandIcon &&
                      "grid grid-cols-[max-content_minmax(0,1fr)] items-start",
                  )}
                >
                  {hasLeadingBrandIcon ? (
                    <div className="row-span-3 pt-0.5">{brandIcon}</div>
                  ) : null}
                  <FieldLabel
                    htmlFor={`payment-option-${option.id}`}
                    className={cn(
                      "text-sm w-full",
                      hasLeadingBrandIcon
                        ? "min-w-0 col-start-2"
                        : "justify-between",
                      !hasSingleOption &&
                        !checked &&
                        !optionDisabled &&
                        "cursor-pointer",
                    )}
                  >
                    <span className="min-w-0">
                      {optionLabel.baseLabel}
                      {optionLabel.viaLabel ? (
                        <span className="text-muted-foreground">
                          {` ${optionLabel.viaLabel}`}
                        </span>
                      ) : null}
                    </span>
                    {!hasLeadingBrandIcon ? brandIcon : null}
                  </FieldLabel>
                  {mounted ? (
                    <>
                      {optionDescription ? (
                        <CardDescription
                          className={cn(
                            "text-sm",
                            hasLeadingBrandIcon && "col-start-2",
                            !checked && "hidden",
                          )}
                        >
                          {optionDescription}
                        </CardDescription>
                      ) : null}
                      <CardContent
                        className={cn(
                          "flex flex-col gap-3 p-0 empty:hidden",
                          hasLeadingBrandIcon && "col-start-2",
                          !checked && "hidden",
                          hasSingleOption ? "mt-3" : "mt-3 py-3",
                        )}
                      >
                        <PaymentOptionBody
                          option={option}
                          lang={lang}
                          disabled={optionDisabled}
                          styleAttributes={styleAttributes}
                          onControllerReady={(controller) =>
                            onControllerReady?.(option.id, controller)
                          }
                          renderStripeContent={renderStripeContent}
                          billingAddress={billingAddress}
                          billingError={checked ? billingError : undefined}
                          onBillingAddressChange={onBillingAddressChange}
                        />
                      </CardContent>
                    </>
                  ) : null}
                </FieldContent>
              </Field>
            </div>
          );

          if (!shouldUseCardChrome) {
            return <div key={option.id}>{optionBody}</div>;
          }

          return (
            <Card
              key={option.id}
              className={cn(
                "gap-0 py-0 transition-colors rounded-[var(--radius)] border border-input ring-0",
                !checked && !optionDisabled && "cursor-pointer hover:bg-muted",
              )}
              data-disabled={optionDisabled}
            >
              {optionBody}
            </Card>
          );
        })}
      </RadioGroup>
    </FieldSet>
  );
}
