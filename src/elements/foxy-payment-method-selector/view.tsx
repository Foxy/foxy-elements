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
import { Card } from "@foxy.io/design-system/card";
import { BillingAddressSection } from "./billing";
import { Checkbox } from "@foxy.io/design-system/checkbox";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { Radio } from "@foxy.io/design-system/radio";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { styled, useTheme } from "styled-components";
import {
  type HostedFieldStyleAttributes,
  useHostedFieldStyleAttributes,
} from "./stripe/style-hooks";
import { PaymentOptionBrandIcon as PaymentOptionBrandIconComponent } from "./icons/payment-option-brand-icon";
import { CursorClickButtonIcon } from "./icons/shared";
import {
  BUTTON_CLICK_HINT_OPTION_TYPES,
  CARD_TYPES,
  GATEWAY_NAME_BY_TYPE,
  ONLINE_BANKING_COUNTRY_BY_TYPE,
  ONLINE_BANKING_OPTION_TYPES,
  PURCHASE_ORDER_MAX_LENGTH,
} from "./constants";
import {
  BILLING_FIELD_LABEL_BY_ID,
  BILLING_SECTION_MESSAGES,
  OPTION_DESCRIPTION_BY_TYPE,
  OPTION_LABEL_BY_TYPE,
  messages,
} from "./messages";
import { useIntl } from "react-intl";
import type { IntlShape } from "react-intl";

const CardOptionEmbed = lazy(() => import("./embeds/card-hosted"));
const AchOptionEmbed = lazy(() => import("./embeds/ach-hosted"));
const PurchaseOrderOptionEmbed = lazy(() => import("./embeds/purchase-order"));
const StripeCardElementOption = lazy(() => import("./embeds/stripe-card"));
const StripePaymentElementOption = lazy(
  () => import("./embeds/stripe-payment"),
);
const AdyenEmbeddedOption = lazy(() => import("./embeds/adyen-embedded"));
const SquareWebPaymentsOption = lazy(() => import("./embeds/square-web-payments"));
import { SquareAchAvailabilityProbe, SquareWalletAvailabilityProbe, SquareWalletController } from "./embeds/square-web-payments";
const SQUARE_WALLET_PROBE_TYPES = new Set(["apple-pay", "google-pay", "cash-app", "afterpay"]);

const PaymentOptionsFieldSet = styled(Field.Set)`
  margin: 0;
  display: flex;
  gap: ${(props) => props.theme.tokens.space.sm};
  border: 0;
  padding: 0;
`;

const VisuallyHiddenLegend = styled(Field.Legend)`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const OptionRadioGroup = styled(Radio.Group)`
  width: 100%;
`;

const OptionRow = styled.div<{ $padded?: boolean }>`
  ${(props) =>
    props.$padded &&
    `padding: ${props.theme.tokens.space.sm} ${props.theme.tokens.space.md};`}
`;

// Field.Root's own base styles are \`display: grid\` (label stacked above
// control). This file only ever needs the old shadcn Field's
// \`orientation="horizontal"\` layout (control beside content), which the new
// Field.Root has no equivalent prop for, so it's baked in here instead.
const OptionField = styled(Field.Root)`
  display: flex;
  align-items: flex-start;
`;

const OptionRadioIndicatorWrapper = styled(Radio.Root)`
  margin-top: 0.125rem;
`;

const OptionFieldContent = styled(Field.Content)<{ $withBrandIcon?: boolean }>`
  min-width: 0;
  flex: 1;

  ${(props) =>
    props.$withBrandIcon &&
    `
      display: grid;
      grid-template-columns: max-content minmax(0, 1fr);
      align-items: start;
      column-gap: ${props.theme.tokens.space.sm};
      row-gap: ${props.theme.tokens.space.xs};
    `}
`;

const BrandIconSlot = styled.div`
  grid-row: span 3;
  padding-top: 0.125rem;
`;

const OptionFieldLabel = styled(Field.Label)<{
  $withBrandIcon?: boolean;
  $clickable?: boolean;
}>`
  font-size: 0.875rem;
  width: 100%;
  display: flex;
  ${(props) =>
    props.$withBrandIcon
      ? `min-width: 0; grid-column: 2;`
      : `justify-content: space-between;`}
  ${(props) => props.$clickable && "cursor: pointer;"}
`;

const OptionViaLabel = styled.span`
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const OptionDescription = styled(Card.Description)<{
  $withBrandIcon?: boolean;
  $hidden?: boolean;
}>`
  font-size: 0.875rem;
  ${(props) => props.$withBrandIcon && "grid-column: 2;"}
  ${(props) => props.$hidden && "display: none;"}
`;

const OptionContent = styled(Card.Content)<{
  $withBrandIcon?: boolean;
  $hidden?: boolean;
  $topSpacing: "single" | "multi";
}>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space.sm};
  padding: 0;
  ${(props) => props.$withBrandIcon && "grid-column: 2;"}
  ${(props) => props.$hidden && "display: none;"}
  margin-top: ${(props) =>
    props.$topSpacing === "single"
      ? props.theme.tokens.space.md
      : props.theme.tokens.space.md};
  ${(props) => props.$topSpacing === "multi" && `padding-bottom: ${props.theme.tokens.space.sm};`}
`;

const OptionCard = styled(Card.Root)<{ $clickable?: boolean }>`
  gap: 0;
  padding-top: 0;
  padding-bottom: 0;
  transition: background-color 150ms ease;
  ${(props) => props.$clickable && "cursor: pointer;"}
  ${(props) =>
    props.$clickable &&
    `&:hover { background: ${props.theme.tokens.background.disabledField}; }`}
`;

const SkeletonBlock = styled(Skeleton)<{ $height: string }>`
  width: 100%;
  height: ${(props) => props.$height};
`;

const Stack = styled.div<{ $gap: "xs" | "sm" | "md" }>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space[props.$gap]};
`;

// min-width: 0 wrapper for text content sitting beside the click-hint icon,
// so long descriptions can still shrink/wrap inside the flex row instead of
// forcing an overflow (was the Tailwind "min-w-0" utility).
const MinWidthZeroBox = styled.div`
  min-width: 0;
`;

const LoadingOptionsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space.sm};
`;

const MutedFootnote = styled.p`
  all: unset;
  display: block;
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  font-size: 0.875rem;
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const EmptyStateBanner = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.25rem;
  border-radius: ${(props) => props.theme.tokens.borderRadius.sm};
  border: ${(props) => props.theme.tokens.border.field};
  background: ${(props) => props.theme.tokens.background.surface};
  padding: 0.75rem 1rem;
`;

const EmptyStateTitle = styled.p`
  all: unset;
  display: block;
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => props.theme.tokens.color.body};
`;

const PAYMENT_OPTION_BODY_FALLBACK = <SkeletonBlock $height="2rem" />;

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
  renderAdyenContent?: (params: {
    option: PaymentMethodSelectorOption;
    disabled?: boolean;
    onControllerReady?: (controller: PaymentController | null) => void;
  }) => ReactNode;
  billingAddress?: PaymentMethodSelectorBillingAddress;
  billingError?: PaymentMethodSelectorBillingError;
  orderTotal?: number;
  orderCurrencyCode?: string;
  onBillingAddressChange?: (params: {
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  }) => void;
  portalContainer: ShadowRoot;
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
  baseLabelGateways: Record<string, Set<string>>,
  obGateways: Record<string, Set<string>>,
  intl: IntlShape,
): PaymentOptionLabel {
  const baseLabel = getBasePaymentOptionLabel(option, intl);

  if (option.type && ONLINE_BANKING_OPTION_TYPES.has(option.type)) {
    // True when the same OB subtype is available through multiple gateways.
    const needsGateway = (obGateways[option.type]?.size ?? 0) > 1;
    // True when at least one other OB option has a different subtype.
    const hasDifferentSubtype = [...ONLINE_BANKING_OPTION_TYPES]
      .filter((t) => t !== option.type)
      .some((t) => (typeCounts[t] ?? 0) >= 1);

    const gatewayName = option.gateway ? getGatewayName(option.gateway) : "";
    let viaLabel = "";

    if (option.type === "dragonpay") {
      if (hasDifferentSubtype && needsGateway) {
        viaLabel = `via DragonPay & ${gatewayName}`;
      } else if (needsGateway) {
        // Only DragonPay subtypes — gateway is the differentiator, DragonPay is context.
        viaLabel = `via ${gatewayName} & DragonPay`;
      } else if (hasDifferentSubtype) {
        viaLabel = "via DragonPay";
      }
    } else {
      const country =
        ONLINE_BANKING_COUNTRY_BY_TYPE[option.type] ?? option.type;
      if (hasDifferentSubtype && needsGateway) {
        viaLabel = `in ${country} via ${gatewayName}`;
      } else if (needsGateway) {
        viaLabel = `via ${gatewayName}`;
      } else if (hasDifferentSubtype) {
        viaLabel = `in ${country}`;
      }
    }

    if (!viaLabel) return { fullLabel: baseLabel, baseLabel };
    return { fullLabel: `${baseLabel} ${viaLabel}`, baseLabel, viaLabel };
  }

  const hasDuplicateType = option.type
    ? (typeCounts[option.type] ?? 0) >= 2
    : false;
  const hasDuplicateBaseLabel = (baseLabelGateways[baseLabel]?.size ?? 0) >= 2;

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
  orderTotal?: number,
  orderCurrencyCode?: string,
): string | undefined {
  if (option.klarna) {
    const identifier = option.klarna.category.identifier;

    if (identifier === "pay_later") {
      return intl.formatMessage(messages.optionDescriptionKlarnaPayLater);
    }
    if (identifier === "pay_now") {
      return intl.formatMessage(messages.optionDescriptionKlarnaPayNow);
    }

    const hasAmounts =
      typeof orderTotal === "number" &&
      Number.isFinite(orderTotal) &&
      orderTotal > 0 &&
      orderCurrencyCode;

    if (!hasAmounts) {
      return intl.formatMessage(messages.optionDescriptionKlarnaDefault);
    }

    const fmt = (amount: number) =>
      intl.formatNumber(amount, {
        style: "currency",
        currency: orderCurrencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    if (identifier === "pay_in_x") {
      return intl.formatMessage(messages.optionDescriptionKlarnaPayInX, {
        installmentAmount: fmt(orderTotal / 4),
      });
    }
    if (identifier === "pay_over_time") {
      return intl.formatMessage(messages.optionDescriptionKlarnaPayOverTime, {
        monthlyAmount: fmt(orderTotal / 24),
      });
    }

    return intl.formatMessage(messages.optionDescriptionKlarna, {
      installmentAmount: fmt(orderTotal / 4),
      monthlyAmount: fmt(orderTotal / 24),
    });
  }

  if (option.adyenEmbedded) {
    return intl.formatMessage(messages.optionDescriptionAdyenEmbedded);
  }

  if (option.squareUp && option.type === "afterpay") {
    return intl.formatMessage(messages.optionDescriptionSquareUpAfterpay);
  }

  if (option.squareUp && option.type === "ach") {
    return intl.formatMessage(messages.optionDescriptionSquareUpAch);
  }

  if (!option.type) return option.description;
  const descriptor = OPTION_DESCRIPTION_BY_TYPE[option.type];
  if (!descriptor) return option.description;
  return intl.formatMessage(descriptor);
}

// Shared "muted, 48px glyph" treatment for the click-hint icon, mirroring
// icons/payment-option-brand-icon.tsx's MutedGlyph pattern (styled wrapper
// sized/colored from theme tokens) but at this call site's larger size.
const ClickHintIcon = styled.svg`
  height: 3rem;
  width: 3rem;
  color: ${(props) => props.theme.tokens.color.secondary};
`;

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
      style: { display: "block", minHeight: "1.25rem" },
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
  orderTotal?: number,
  orderCurrencyCode?: string,
): ReactNode {
  const description = getPaymentOptionDescriptionText(option, intl, orderTotal, orderCurrencyCode);

  if (!description) {
    return null;
  }

  const content =
    option.type === "paypal-pay-later" && option.paypalMessage ? (
      <PayPalPayLaterDescription option={option} fallbackText={description} />
    ) : (
      description
    );

  const isSquareButtonOnly =
    option.squareUp && (option.type === "ach" || option.type === "afterpay");
  if (
    option.adyenEmbedded ||
    !option.type ||
    (!BUTTON_CLICK_HINT_OPTION_TYPES.has(option.type) && !isSquareButtonOnly)
  ) {
    return content;
  }

  return (
    <Stack $gap="xs">
      <MinWidthZeroBox>{content}</MinWidthZeroBox>
      <span aria-hidden="true" data-payment-option-click-hint="true">
        <ClickHintIcon as={CursorClickButtonIcon} />
      </span>
    </Stack>
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
      <Stack $gap="sm">
        <OptionField>
          <Checkbox.Root
            id={`ach-owner-confirmation-${option.id}`}
            checked={false}
            disabled
            data-ach-owner-confirmation="true"
            aria-label={intl.formatMessage(messages.achOwnerConfirmationLabel)}
          >
            <Checkbox.Indicator />
          </Checkbox.Root>
          <Field.Label htmlFor={`ach-owner-confirmation-${option.id}`}>
            {intl.formatMessage(messages.achOwnerConfirmationLabel)}
          </Field.Label>
        </OptionField>
      </Stack>
    );
  }

  if (option.type === "purchase-order") {
    const fieldId = `purchase-order-number-${option.id}`;

    return (
      <Stack $gap="sm">
        <Field.Root>
          <Field.Label htmlFor={fieldId}>
            {intl.formatMessage(messages.purchaseOrderNumberLabel)}
          </Field.Label>
          <Input
            id={fieldId}
            data-purchase-order-number="true"
            type="text"
            disabled
            value=""
            readOnly
            placeholder={intl.formatMessage(
              messages.purchaseOrderNumberPlaceholder,
            )}
          />
        </Field.Root>
      </Stack>
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
  renderAdyenContent,
  billingAddress,
  billingError,
  onBillingAddressChange,
  portalContainer,
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
  renderAdyenContent?: (params: {
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
  portalContainer: ShadowRoot;
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
      portalContainer={portalContainer}
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

  if (option.adyenEmbedded) {
    if (renderAdyenContent) {
      return (
        <>
          {renderAdyenContent({ option, disabled, onControllerReady })}
          {billingSection}
        </>
      );
    }

    return (
      <>
        <Suspense fallback={bodyFallback}>
          <AdyenEmbeddedOption
            option={option}
            disabled={disabled}
            onControllerReady={onControllerReady}
            loadingMessage={intl.formatMessage(messages.adyenLoading)}
            unavailableMessage={intl.formatMessage(messages.adyenUnavailable)}
            loadErrorMessage={intl.formatMessage(messages.adyenLoadError)}
            submitErrorMessage={intl.formatMessage(messages.adyenSubmitError)}
          />
        </Suspense>
        {billingSection}
      </>
    );
  }

  if (option.squareUp && (option.type === "new-card" || option.type === "ach")) {
    return (
      <>
        <Suspense fallback={bodyFallback}>
          <SquareWebPaymentsOption
            option={option}
            disabled={disabled}
            onControllerReady={onControllerReady}
            loadingMessage={intl.formatMessage(messages.squareUpLoading)}
            loadErrorMessage={intl.formatMessage(messages.squareUpLoadError)}
            submitErrorMessage={intl.formatMessage(messages.squareUpSubmitError)}
          />
        </Suspense>
        {billingSection}
      </>
    );
  }

  if (
    option.squareUp &&
    (option.type === "apple-pay" ||
      option.type === "google-pay" ||
      option.type === "cash-app" ||
      option.type === "afterpay")
  ) {
    return (
      <>
        <SquareWalletController
          option={option}
          onControllerReady={onControllerReady}
          submitErrorMessage={intl.formatMessage(messages.squareUpSubmitError)}
        />
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

  const isSquareFormBased = option.type === "new-card";
  if (option.klarna || option.adyenEmbedded || (option.squareUp && isSquareFormBased)) {
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

  const isSquareFormBased = option.type === "new-card";
  if (option.adyenEmbedded || (option.squareUp && isSquareFormBased)) {
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
  renderAdyenContent,
  billingAddress,
  billingError,
  orderTotal,
  orderCurrencyCode,
  onBillingAddressChange,
  portalContainer,
}: PaymentProps) {
  const intl = useIntl();
  const theme = useTheme();
  const allOptions = options ?? [];
  const [optionAvailability, setOptionAvailability] = useState<
    Record<string, "pending" | "available" | "unavailable">
  >(() =>
    Object.fromEntries(
      allOptions
        .filter((o) => o.squareUp && o.type === "ach")
        .map((o) => [o.id, "pending" as const]),
    ),
  );
  const isCheckingAvailability = Object.values(optionAvailability).some(
    (s) => s === "pending",
  );
  const visibleOptions = useMemo(
    () => allOptions.filter((o) => optionAvailability[o.id] !== "unavailable"),
    [allOptions, optionAvailability],
  );
  const nativeOptions = useMemo(
    () => visibleOptions.filter((o) => !o.adyenEmbedded),
    [visibleOptions],
  );
  const adyenOption = useMemo(
    () => visibleOptions.find((o) => Boolean(o.adyenEmbedded)) ?? null,
    [visibleOptions],
  );
  const hasSingleOption = nativeOptions.length === 1 && !adyenOption;
  const baseLabelGateways = useMemo(() => {
    return visibleOptions.reduce<Record<string, Set<string>>>((map, option) => {
      const baseLabel = getBasePaymentOptionLabel(option, intl);
      if (!map[baseLabel]) map[baseLabel] = new Set();
      map[baseLabel].add(option.gateway ?? "");
      return map;
    }, {});
  }, [intl, visibleOptions]);
  const optionTypeCounts = useMemo(() => {
    return visibleOptions.reduce<Record<string, number>>((counts, option) => {
      if (!option.type) return counts;

      counts[option.type] = (counts[option.type] ?? 0) + 1;
      return counts;
    }, {});
  }, [visibleOptions]);
  // Maps each OB subtype → set of gateways that offer it, for cross-gateway detection.
  const obGateways = useMemo(() => {
    return visibleOptions.reduce<Record<string, Set<string>>>((map, option) => {
      if (!option.type || !ONLINE_BANKING_OPTION_TYPES.has(option.type))
        return map;
      if (!map[option.type]) map[option.type] = new Set();
      map[option.type].add(option.gateway ?? "");
      return map;
    }, {});
  }, [visibleOptions]);
  const [selection, setSelection] = useState<string>(selectedOptionId ?? "");
  const styleAttributes = useHostedFieldStyleAttributes();
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

  const [mountedOptionIds, setMountedOptionIds] = useState<Set<string>>(() => {
    const initial = new Set<string>(
      [selection || selectedOptionId || visibleOptions[0]?.id].filter(
        Boolean,
      ) as string[],
    );
    // Pre-mount Square ACH options so the availability probe runs before the
    // user selects the option — otherwise we only hide it after first selection.
    for (const option of allOptions) {
      if (option.squareUp && option.type === "ach") initial.add(option.id);
    }
    return initial;
  });

  useEffect(() => {
    if (!selection) return;
    setMountedOptionIds((previous) => {
      if (previous.has(selection)) return previous;
      const next = new Set(previous);
      next.add(selection);
      return next;
    });
  }, [selection]);

  // Keep Square ACH options pre-mounted so SquareWebPaymentsOption can initialize
  // early. Also track new ACH options that arrive after initial render.
  useEffect(() => {
    const squareAchIds = allOptions
      .filter((o) => o.squareUp && o.type === "ach")
      .map((o) => o.id);
    if (!squareAchIds.length) return;
    setMountedOptionIds((previous) => {
      let changed = false;
      const next = new Set(previous);
      for (const id of squareAchIds) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      return changed ? next : previous;
    });
    setOptionAvailability((previous) => {
      let changed = false;
      const next = { ...previous };
      for (const id of squareAchIds) {
        if (!(id in next)) {
          next[id] = "pending";
          changed = true;
        }
      }
      return changed ? next : previous;
    });
  }, [allOptions]);

  // Safety timeout: if the Square SDK never loads or the probe never resolves,
  // unblock the UI after 8 seconds rather than showing a spinner indefinitely.
  useEffect(() => {
    if (!isCheckingAvailability) return;
    const timer = setTimeout(() => {
      setOptionAvailability((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const id of Object.keys(next)) {
          if (next[id] === "pending") {
            next[id] = "available";
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 8000);
    return () => clearTimeout(timer);
  }, [isCheckingAvailability]);

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

  // Wallet options default to visible; probes mark them unavailable if the SDK rejects.
  // They are NOT "pending" — so they never block the skeleton.
  const squareWalletOptions = allOptions.filter(
    (o) => o.squareUp && SQUARE_WALLET_PROBE_TYPES.has(o.type ?? ""),
  );
  const onWalletUnavailable = (id: string) =>
    setOptionAvailability((prev) => ({ ...prev, [id]: "unavailable" }));

  if (loading || isCheckingAvailability) {
    const pendingSquareAchOptions = allOptions.filter(
      (o) => o.squareUp && o.type === "ach" && optionAvailability[o.id] === "pending",
    );
    return (
      <>
        {pendingSquareAchOptions.map((option) => (
          <SquareAchAvailabilityProbe
            key={option.id}
            option={option}
            onResolved={() =>
              setOptionAvailability((prev) => ({ ...prev, [option.id]: "available" }))
            }
            onUnavailable={() =>
              setOptionAvailability((prev) => ({ ...prev, [option.id]: "unavailable" }))
            }
          />
        ))}
        {squareWalletOptions.map((option) => (
          <SquareWalletAvailabilityProbe
            key={option.id}
            option={option}
            onResolved={() => {}}
            onUnavailable={() => onWalletUnavailable(option.id)}
          />
        ))}
        <LoadingOptionsWrapper aria-live="polite">
          <SkeletonBlock $height="2.25rem" />
          <SkeletonBlock $height="5.5rem" />
          <MutedFootnote>
            {intl.formatMessage(messages.loadingOptions)}
          </MutedFootnote>
        </LoadingOptionsWrapper>
      </>
    );
  }

  if (!visibleOptions.length) {
    return (
      <EmptyStateBanner role="status" aria-live="polite">
        <EmptyStateTitle>
          {intl.formatMessage(messages.noPaymentMethods)}
        </EmptyStateTitle>
        <MutedFootnote>
          {intl.formatMessage(messages.noPaymentMethodsDescription)}
        </MutedFootnote>
      </EmptyStateBanner>
    );
  }

  return (
    <PaymentOptionsFieldSet
      aria-label={intl.formatMessage(messages.paymentMethodsLegend)}
    >
      {squareWalletOptions.map((option) => (
        <SquareWalletAvailabilityProbe
          key={option.id}
          option={option}
          onResolved={() => {}}
          onUnavailable={() => onWalletUnavailable(option.id)}
        />
      ))}

      <VisuallyHiddenLegend>
        {intl.formatMessage(messages.paymentMethodsLegend)}
      </VisuallyHiddenLegend>

      <OptionRadioGroup
        value={selection}
        onValueChange={(value) => {
          const nextValue = value as string;
          pendingSelectionChangeRef.current = nextValue;
          setSelection(nextValue);
        }}
      >
        {nativeOptions.map((option) => {
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
            baseLabelGateways,
            obGateways,
            intl,
          );
          const optionDescription = renderPaymentOptionDescription(
            option,
            intl,
            orderTotal,
            orderCurrencyCode,
          );
          const optionBody = (
            <OptionRow $padded={shouldUseCardChrome}>
              <OptionField data-disabled={optionDisabled}>
                {!hasSingleOption ? (
                  <OptionRadioIndicatorWrapper
                    id={`payment-option-${option.id}`}
                    value={option.id}
                    disabled={optionDisabled}
                    aria-label={optionLabel.fullLabel}
                  >
                    <Radio.Indicator />
                  </OptionRadioIndicatorWrapper>
                ) : null}
                <OptionFieldContent
                  $withBrandIcon={hasLeadingBrandIcon}
                  style={
                    hasLeadingBrandIcon
                      ? {
                          columnGap: theme.tokens.space.md,
                          rowGap: theme.tokens.space.xs,
                        }
                      : undefined
                  }
                >
                  {hasLeadingBrandIcon ? (
                    <BrandIconSlot>{brandIcon}</BrandIconSlot>
                  ) : null}
                  <OptionFieldLabel
                    htmlFor={`payment-option-${option.id}`}
                    $withBrandIcon={hasLeadingBrandIcon}
                    $clickable={
                      !hasSingleOption && !checked && !optionDisabled
                    }
                  >
                    <span style={{ minWidth: 0 }}>
                      {optionLabel.baseLabel}
                      {optionLabel.viaLabel ? (
                        <OptionViaLabel>
                          {` ${optionLabel.viaLabel}`}
                        </OptionViaLabel>
                      ) : null}
                    </span>
                    {!hasLeadingBrandIcon ? brandIcon : null}
                  </OptionFieldLabel>
                  {mounted ? (
                    <>
                      {optionDescription ? (
                        <OptionDescription
                          $withBrandIcon={hasLeadingBrandIcon}
                          $hidden={!checked}
                        >
                          {optionDescription}
                        </OptionDescription>
                      ) : null}
                      <OptionContent
                        $withBrandIcon={hasLeadingBrandIcon}
                        $hidden={!checked}
                        $topSpacing={hasSingleOption ? "single" : "multi"}
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
                          renderAdyenContent={renderAdyenContent}
                          billingAddress={billingAddress}
                          billingError={checked ? billingError : undefined}
                          onBillingAddressChange={onBillingAddressChange}
                          portalContainer={portalContainer}
                        />
                      </OptionContent>
                    </>
                  ) : null}
                </OptionFieldContent>
              </OptionField>
            </OptionRow>
          );

          if (!shouldUseCardChrome) {
            return <div key={option.id}>{optionBody}</div>;
          }

          return (
            <OptionCard
              key={option.id}
              $clickable={!checked && !optionDisabled}
              data-disabled={optionDisabled}
            >
              {optionBody}
            </OptionCard>
          );
        })}
      </OptionRadioGroup>

      {adyenOption !== null &&
        renderAdyenContent?.({
          option: adyenOption,
          onControllerReady: (controller) =>
            onControllerReady?.(adyenOption.id, controller),
        })}
    </PaymentOptionsFieldSet>
  );
}
