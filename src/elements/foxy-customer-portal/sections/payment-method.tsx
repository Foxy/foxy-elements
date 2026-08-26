import { useIntl } from "react-intl";
import styled from "styled-components";
import { Alert } from "@foxy.io/design-system/alert";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useResource, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../messages";

export type DefaultPaymentMethodResource = {
  cc_type: string;
  cc_number_masked: string;
  cc_exp_month: string;
  cc_exp_year: string;
};

type Props = {
  link:
    | (FollowableLink<DefaultPaymentMethodResource> & { href: string })
    | undefined;
};

type Scheme = "visa" | "mastercard" | "other";

function schemeOf(ccType: string): Scheme {
  const type = ccType.toLowerCase();
  if (type === "visa") return "visa";
  if (type === "mastercard") return "mastercard";
  return "other";
}

/** The chip is 32px wide, so anything unrecognised gets a two-letter stand-in. */
function chipLabel(ccType: string): string {
  const scheme = schemeOf(ccType);
  if (scheme === "visa") return "VISA";
  if (scheme === "mastercard") return "MC";
  return ccType.slice(0, 2).toUpperCase();
}

/** Title-cases the raw `cc_type` ("visa" -> "Visa") for display. */
function brandName(ccType: string): string {
  return ccType.charAt(0).toUpperCase() + ccType.slice(1);
}

/**
 * True once `data` resolves to a resource that actually carries a card this
 * UI can show. A customer with no card on file still gets a 200 with every
 * field blank, so having the resource is not the same as having a card.
 * Exported so other callers (e.g. the subscription page's billing row) can
 * gate on the same rule `PaymentMethod` itself uses, rather than
 * re-deriving it.
 */
export function hasSavedCard(
  data: DefaultPaymentMethodResource | null | undefined,
): data is DefaultPaymentMethodResource {
  return !!data && !!data.cc_number_masked;
}

/**
 * Formats a resolved card the same way `PaymentMethod`'s own card line does
 * -- brand name plus the masked number's last four -- for a caller that only
 * needs the compact label, not the full loading/empty/error block. Callers
 * must check `hasSavedCard(data)` first; this assumes a real card.
 */
export function formatCardLabel(data: DefaultPaymentMethodResource): string {
  return `${brandName(data.cc_type)} ••••${data.cc_number_masked.slice(-4)}`;
}

const Heading = styled.h3`
  margin: 0 0 16px;
  font: ${(props) => props.theme.tokens.font.h3};
  color: ${(props) => props.theme.tokens.color.body};
`;

const Card = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  gap: ${(props) => props.theme.tokens.space.sm};
  padding: 14px 16px;
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
  background: ${(props) => props.theme.tokens.background.surface};
`;

/**
 * A small coloured rectangle standing in for the card-scheme logo.
 * Deliberately not the real brand marks: the checkout flow's icon set
 * (`foxy-payment-method-selector`) exists to help a customer *choose* between
 * schemes, which is not what this read-only line does, and pulling that
 * pipeline in for a single label would cost far more than it shows.
 */
const BrandChip = styled.div<{ $scheme: Scheme }>`
  box-sizing: border-box;
  width: 32px;
  height: 20px;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 2px;
  border-radius: ${(props) => props.theme.tokens.borderRadius.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  font: ${(props) => props.theme.tokens.font.bodySmall};
  font-size: 8px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
  color: ${(props) => props.theme.tokens.color.onPrimary};
  background: ${(props) =>
    props.$scheme === "visa"
      ? props.theme.tokens.color.primary
      : props.$scheme === "mastercard"
        ? props.theme.tokens.color.body
        : props.theme.tokens.color.secondary};
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 auto;
`;

const CardNumber = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.tokens.space.sm};
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.body};
`;

const Expiry = styled.div`
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const Empty = styled.p`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

export function PaymentMethod({ link }: Props) {
  const intl = useIntl();
  const { data, isLoading, error } = useResource<DefaultPaymentMethodResource>(
    link ?? null,
  );

  const hasCard = hasSavedCard(data);

  const heading = (
    <Heading>
      {intl.formatMessage(messages.paymentMethodsHeading, {
        count: hasCard ? 1 : 0,
      })}
    </Heading>
  );

  if (isLoading) {
    return (
      <>
        {heading}
        <Skeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        {heading}
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      </>
    );
  }

  if (!hasCard) {
    return (
      <>
        {heading}
        <Empty>{intl.formatMessage(messages.paymentMethodsEmpty)}</Empty>
      </>
    );
  }

  return (
    <>
      {heading}
      <Card>
        <BrandChip $scheme={schemeOf(data.cc_type)}>
          {chipLabel(data.cc_type)}
        </BrandChip>

        <Details>
          <CardNumber>{formatCardLabel(data)}</CardNumber>
          <Expiry>
            {intl.formatMessage(messages.paymentMethodsExpires, {
              month: data.cc_exp_month,
              // The API sends a four-digit year; a card shows two.
              year: data.cc_exp_year.slice(-2),
            })}
          </Expiry>
        </Details>
      </Card>
    </>
  );
}
