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
  link: (FollowableLink<DefaultPaymentMethodResource> & { href: string }) | undefined;
};

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space["2xs"]};
  padding: ${(props) => props.theme.tokens.space.md} ${(props) => props.theme.tokens.space.lg};
  border: ${(props) => props.theme.tokens.border.default};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
  background: ${(props) => props.theme.tokens.background.surface};
`;

const Brand = styled.div`
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.body};
  text-transform: capitalize;
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

  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <Alert.Root $variant="destructive">
        <Alert.Description>
          {intl.formatMessage(messages.errorUnknown)}
        </Alert.Description>
      </Alert.Root>
    );
  }

  if (!data || !data.cc_number_masked) {
    return <Empty>{intl.formatMessage(messages.paymentMethodsEmpty)}</Empty>;
  }

  return (
    <Card>
      <Brand>
        {data.cc_type} {data.cc_number_masked}
      </Brand>
      <Expiry>
        {intl.formatMessage(messages.paymentMethodsExpires, {
          month: data.cc_exp_month,
          year: data.cc_exp_year,
        })}
      </Expiry>
    </Card>
  );
}
