import type { ReactNode } from "react";
import { Suspense, lazy } from "react";
import { CreditCard, FileText, Landmark, Wallet } from "lucide-react";
import type { PaymentMethodSelectorOption } from "../types";
import SezzleMarkIcon from "./sezzle";
import {
  CursorClickButtonIcon,
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
      <img
        src={logoUrl}
        alt=""
        loading="lazy"
        className="h-5 w-auto max-w-24 object-contain"
      />,
    );
  }

  if (
    option.type === "paypal" ||
    option.type === "paypal-pay-later" ||
    option.type === "paypal-credit"
  ) {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<PayPalMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "venmo") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<VenmoMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "sepa") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SepaMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "bancontact") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <BancontactMarkIcon className="h-5 w-auto" />,
        )}
      </Suspense>
    );
  }

  if (option.type === "eps") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<EpsMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "blik") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<BlikMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "ideal") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<IdealMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "przelewy24") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <Przelewy24MarkIcon className="h-5 w-auto" />,
        )}
      </Suspense>
    );
  }

  if (option.type === "sezzle") {
    return getGenericPaymentOptionIcon(
      <SezzleMarkIcon className="h-5 w-auto" />,
    );
  }

  if (option.type === "apple-pay") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        <span className="inline-flex h-5 shrink-0 items-center" aria-hidden>
          <ApplePayMarkIcon className="h-5 w-auto" />
        </span>
      </Suspense>
    );
  }

  if (option.type === "google-pay") {
    return (
      <Suspense
        fallback={<PaymentOptionIconFallback wrapperClassName="-mr-[0.1em]" />}
      >
        <span
          className="inline-flex h-5 shrink-0 items-center -mr-[0.1em]"
          aria-hidden
        >
          <GooglePayMarkIcon className="h-5 w-auto" />
        </span>
      </Suspense>
    );
  }

  if (option.type === "mollie") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        <span className="inline-flex h-5 shrink-0 items-center" aria-hidden>
          <MollieMarkIcon className="h-5 w-auto" />
        </span>
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
    return getGenericPaymentOptionIcon(
      <CreditCard className="h-4 w-4 text-muted-foreground" />,
    );
  }

  if (option.type === "ach") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<AchMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "bank-transfer") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <BankTransferMarkIcon className="h-5 w-auto" />,
        )}
      </Suspense>
    );
  }

  if (option.type === "dragonpay") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <DragonpayMarkIcon className="h-5 w-auto" />,
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
    return getGenericPaymentOptionIcon(
      <Landmark className="h-4 w-4 text-muted-foreground" />,
    );
  }

  if (option.type === "bacs-direct-debit") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<BacsMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "eft") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<EftMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "bizum") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<BizumMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "swish") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<SwishMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "vipps") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<VippsMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "twint") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<TwintMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "zip") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<ZipMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "zip-pos") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<ZipPosMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "alipay") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<AlipayMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "paysafecard") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(
          <PaysafecardMarkIcon className="h-5 w-auto" />,
        )}
      </Suspense>
    );
  }

  if (option.type === "afterpay") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<AfterpayMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "cash-app") {
    return (
      <Suspense fallback={<PaymentOptionIconFallback />}>
        {getGenericPaymentOptionIcon(<CashAppMarkIcon className="h-5 w-auto" />)}
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
        {getGenericPaymentOptionIcon(<WeChatMarkIcon className="h-5 w-auto" />)}
      </Suspense>
    );
  }

  if (option.type === "generic") {
    return getGenericPaymentOptionIcon(
      <CursorClickButtonIcon className="h-4 w-4 text-muted-foreground" />,
    );
  }

  if (option.type === "stripe-payment-element") {
    return getGenericPaymentOptionIcon(
      <Wallet className="h-4 w-4 text-muted-foreground" />,
    );
  }

  if (option.type === "purchase-order") {
    return getGenericPaymentOptionIcon(
      <FileText className="h-4 w-4 text-muted-foreground" />,
    );
  }

  return null;
}
