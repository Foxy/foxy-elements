import type { ReactNode } from "react";
import { Suspense, lazy } from "react";
import { CreditCard, FileText, Landmark, Wallet } from "lucide-react";
import { styled } from "styled-components";
import type { PaymentMethodSelectorOption } from "../types";
import SezzleMarkIcon from "./sezzle";
import {
  CursorClickButtonIcon,
  IconSlot,
  PaymentOptionIconFallback,
  getGenericPaymentOptionIcon,
} from "./shared";

const ApplePayMarkIcon = lazy(() => import("./apple-pay"));
const GooglePayMarkIcon = lazy(() => import("./google-pay"));
const MollieMarkIcon = lazy(() => import("./mollie"));
const PayPalMarkIcon = lazy(() => import("./paypal"));
const VenmoMarkIcon = lazy(() => import("./venmo"));
const IdealMarkIcon = lazy(() => import("./ideal"));
const BancontactMarkIcon = lazy(() => import("./bancontact"));
const SepaMarkIcon = lazy(() => import("./sepa"));
const EpsMarkIcon = lazy(() => import("./eps"));
const BlikMarkIcon = lazy(() => import("./blik"));
const Przelewy24MarkIcon = lazy(() => import("./przelewy24"));
const AlipayMarkIcon = lazy(() => import("./alipay"));
const PaysafecardMarkIcon = lazy(() => import("./paysafecard"));
const AfterpayMarkIcon = lazy(() => import("./afterpay"));
const CashAppMarkIcon = lazy(() => import("./cash-app"));
const WeChatMarkIcon = lazy(() => import("./we-chat"));
const PaymentOptionCardBrandIcon = lazy(() => import("./card-brands"));
const BankTransferMarkIcon = lazy(() => import("./bank-transfer"));
const BizumMarkIcon = lazy(() => import("./bizum"));
const SwishMarkIcon = lazy(() => import("./swish"));
const VippsMarkIcon = lazy(() => import("./vipps"));
const TwintMarkIcon = lazy(() => import("./twint"));
const ZipMarkIcon = lazy(() => import("./zip"));
const ZipPosMarkIcon = lazy(() => import("./zip-pos"));
const DragonpayMarkIcon = lazy(() => import("./dragonpay"));
const BacsMarkIcon = lazy(() => import("./bacs"));
const AchMarkIcon = lazy(() => import("./ach"));
const EftMarkIcon = lazy(() => import("./eft"));

// One shared wrapper reused (via the polymorphic `as` prop) across every
// lazily-loaded mark icon below rather than a `styled(...)` call per icon:
// each call site's icon component is statically known here, but a wrapper
// per icon would mint 28 near-identical stylesheet rules for the same two
// declarations.
const SizedMarkIcon = styled.svg`
  height: 1.25rem;
  width: auto;
`;

// Klarna's logo is a remote-hosted <img>, not a bundled SVG component, and
// needs the extra sizing/fit rules the original className carried
// (`max-w-24 object-contain`) so arbitrary logo aspect ratios don't blow out
// the row.
const KlarnaMarkImage = styled.img`
  height: 1.25rem;
  width: auto;
  max-width: 6rem;
  object-fit: contain;
`;

// Shared "muted, 16px glyph" treatment for the lucide-react icons (and the
// local CursorClickButtonIcon) used as generic-payment-type fallbacks.
const MutedGlyph = styled.svg`
  height: 1rem;
  width: 1rem;
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const TightIconSlot = styled(IconSlot)`
  margin-right: -0.1em;
`;

const TightPaymentOptionIconFallback = styled(PaymentOptionIconFallback)`
  margin-right: -0.1em;
`;

export function PaymentOptionBrandIcon({
  option,
}: {
  option: PaymentMethodSelectorOption;
}): ReactNode {
  if (option.klarna) {
    const logoUrl =
      option.klarna.category.asset_urls.standard ||
      option.klarna.category.asset_urls.descriptive;

    if (!logoUrl) {
      return null;
    }

    return getGenericPaymentOptionIcon(
      <KlarnaMarkImage src={logoUrl} alt="" loading="lazy" />,
    );
  }

  if (
    option.type === "paypal" ||
    option.type === "paypal-pay-later" ||
    option.type === "paypal-credit"
  ) {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={PayPalMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "venmo") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={VenmoMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "sepa") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={SepaMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "bancontact") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <SizedMarkIcon as={BancontactMarkIcon} />,
        )}
      </Suspense>
    );
  }

  if (option.type === "eps") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={EpsMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "blik") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={BlikMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "ideal") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={IdealMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "przelewy24") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <SizedMarkIcon as={Przelewy24MarkIcon} />,
        )}
      </Suspense>
    );
  }

  if (option.type === "sezzle") {
    return getGenericPaymentOptionIcon(
      <SizedMarkIcon as={SezzleMarkIcon} />,
    );
  }

  if (option.type === "apple-pay") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        <IconSlot aria-hidden>
          <SizedMarkIcon as={ApplePayMarkIcon} />
        </IconSlot>
      </Suspense>
    );
  }

  if (option.type === "google-pay") {
    return (
      <Suspense fallback={<TightPaymentOptionIconFallback />}>
        <TightIconSlot aria-hidden>
          <SizedMarkIcon as={GooglePayMarkIcon} />
        </TightIconSlot>
      </Suspense>
    );
  }

  if (option.type === "mollie") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        <IconSlot aria-hidden>
          <SizedMarkIcon as={MollieMarkIcon} />
        </IconSlot>
      </Suspense>
    );
  }

  if (option.type === "saved-card" || option.type === "new-card") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        <PaymentOptionCardBrandIcon option={option} />
      </Suspense>
    );
  }

  if (option.type === "stripe-card-element") {
    return getGenericPaymentOptionIcon(<MutedGlyph as={CreditCard} />);
  }

  if (option.type === "ach") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={AchMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "bank-transfer") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <SizedMarkIcon as={BankTransferMarkIcon} />,
        )}
      </Suspense>
    );
  }

  if (option.type === "dragonpay") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <SizedMarkIcon as={DragonpayMarkIcon} />,
        )}
      </Suspense>
    );
  }

  if (
    option.type === "online-banking-pl" ||
    option.type === "online-banking-cz" ||
    option.type === "online-banking-fi" ||
    option.type === "online-banking-sk" ||
    option.type === "online-banking-in"
  ) {
    return getGenericPaymentOptionIcon(<MutedGlyph as={Landmark} />);
  }

  if (option.type === "bacs-direct-debit") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={BacsMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "eft") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={EftMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "bizum") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={BizumMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "swish") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={SwishMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "vipps") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={VippsMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "twint") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={TwintMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "zip") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={ZipMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "zip-pos") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={ZipPosMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "alipay") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={AlipayMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "paysafecard") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <SizedMarkIcon as={PaysafecardMarkIcon} />,
        )}
      </Suspense>
    );
  }

  if (option.type === "afterpay") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={AfterpayMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "cash-app") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={CashAppMarkIcon} />)}
      </Suspense>
    );
  }

  if (
    option.type === "we-chat" ||
    option.type === "we-chat-qr" ||
    option.type === "we-chat-web" ||
    option.type === "we-chat-mini-program"
  ) {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SizedMarkIcon as={WeChatMarkIcon} />)}
      </Suspense>
    );
  }

  if (option.type === "generic") {
    return getGenericPaymentOptionIcon(
      <MutedGlyph as={CursorClickButtonIcon} />,
    );
  }

  if (option.type === "stripe-payment-element") {
    return getGenericPaymentOptionIcon(<MutedGlyph as={Wallet} />);
  }

  if (option.type === "purchase-order") {
    return getGenericPaymentOptionIcon(<MutedGlyph as={FileText} />);
  }

  return null;
}
