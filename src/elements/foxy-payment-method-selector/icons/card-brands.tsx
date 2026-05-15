import type { PaymentMethodSelectorOption } from "../types";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  AmericanExpressFlatRoundedIcon,
  DinersClubFlatRoundedIcon,
  DiscoverFlatRoundedIcon,
  JCBFlatRoundedIcon,
  MaestroFlatRoundedIcon,
  MastercardFlatRoundedIcon,
  UnionPayFlatRoundedIcon,
  VisaFlatRoundedIcon,
} from "react-svg-credit-card-payment-icons";

type CardBrandIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const NEW_CARD_BRAND_ICONS: CardBrandIconComponent[] = [
  VisaFlatRoundedIcon,
  MastercardFlatRoundedIcon,
  AmericanExpressFlatRoundedIcon,
  DiscoverFlatRoundedIcon,
  JCBFlatRoundedIcon,
  DinersClubFlatRoundedIcon,
  UnionPayFlatRoundedIcon,
  MaestroFlatRoundedIcon,
];

const CARD_BRAND_ICON_MAP: Record<string, CardBrandIconComponent> = {
  visa: VisaFlatRoundedIcon,
  mastercard: MastercardFlatRoundedIcon,
  "master card": MastercardFlatRoundedIcon,
  mc: MastercardFlatRoundedIcon,
  "american express": AmericanExpressFlatRoundedIcon,
  amex: AmericanExpressFlatRoundedIcon,
  discover: DiscoverFlatRoundedIcon,
  "diners club": DinersClubFlatRoundedIcon,
  diners: DinersClubFlatRoundedIcon,
  jcb: JCBFlatRoundedIcon,
  unionpay: UnionPayFlatRoundedIcon,
  "union pay": UnionPayFlatRoundedIcon,
  maestro: MaestroFlatRoundedIcon,
};

function NewCardBrandCycler({ acceptedBrands }: { acceptedBrands?: string[] }) {
  const icons = useMemo(() => {
    if (!acceptedBrands?.length) return NEW_CARD_BRAND_ICONS;
    const filtered = acceptedBrands
      .map((brand) => CARD_BRAND_ICON_MAP[brand.toLowerCase()])
      .filter((icon): icon is CardBrandIconComponent => Boolean(icon));
    return filtered.length ? filtered : NEW_CARD_BRAND_ICONS;
  }, [acceptedBrands]);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIndex(0);
    setVisible(true);
  }, [icons]);

  useEffect(() => {
    if (icons.length <= 1) return;

    const intervalId = setInterval(() => {
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setIndex((previous) => (previous + 1) % icons.length);
        setVisible(true);
      }, 350);
    }, 2200);

    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [icons]);

  const BrandIcon = icons[index];

  return (
    <span className="inline-flex h-5 shrink-0 items-center" aria-hidden>
      <span
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
          display: "inline-flex",
        }}
      >
        <BrandIcon className="h-5 w-auto" />
      </span>
    </span>
  );
}

function getSavedCardBrandIcon(option: PaymentMethodSelectorOption): ReactNode {
  const compactMatch = option.label.match(/^(.*?)\s*••••\s*(\d{4})$/);
  const endingInMatch = option.label.match(/^(.*?)\s+ending\s+in\s+(\d{4})$/i);
  const labelMatch = compactMatch ?? endingInMatch;
  const brandName = labelMatch?.[1]?.trim();
  if (!brandName) return null;

  const BrandIcon = CARD_BRAND_ICON_MAP[brandName.toLowerCase()];
  if (!BrandIcon) return null;

  return (
    <span className="inline-flex h-5 shrink-0 items-center" aria-hidden>
      <BrandIcon className="h-5 w-auto" />
    </span>
  );
}

export default function PaymentOptionCardBrandIcon({
  option,
}: {
  option: PaymentMethodSelectorOption;
}): ReactNode {
  if (option.type === "saved-card") {
    return getSavedCardBrandIcon(option);
  }

  if (option.type === "new-card") {
    return <NewCardBrandCycler acceptedBrands={option.acceptedBrands} />;
  }

  return null;
}
