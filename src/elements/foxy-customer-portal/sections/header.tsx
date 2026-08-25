import { LogOut } from "lucide-react";
import { useIntl } from "react-intl";
import styled from "styled-components";
import { Button } from "@foxy.io/design-system/button";
import { Spinner } from "@foxy.io/design-system/spinner";
import { formatFullName } from "../full-name";
import { messages } from "../messages";

export type CustomerProps = {
  first_name?: string;
  last_name?: string;
  email?: string;
  tax_id?: string;
};

/**
 * Sign-out has three visible states, matching v1: idle, in flight, and a
 * one-second error state after a failed request (spec 7.1). A boolean cannot
 * express the third, so the parent drives this instead.
 */
export type SignOutState = "idle" | "busy" | "error";

type Props = {
  customer: CustomerProps;
  fullNameTemplate: string;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onSignOut: () => void;
  signOutState: SignOutState;
};

const Wrapper = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${(props) => props.theme.tokens.space.lg};
  flex-wrap: wrap;
`;

const Identity = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space["2xs"]};
`;

const Name = styled.h1`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.h1};
  color: ${(props) => props.theme.tokens.color.body};
`;

const Meta = styled.p`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

const Actions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.tokens.space.sm};
  flex-shrink: 0;
`;

export function PortalHeader({
  customer,
  fullNameTemplate,
  onEditProfile,
  onChangePassword,
  onSignOut,
  signOutState,
}: Props) {
  const intl = useIntl();
  const fullName = formatFullName(fullNameTemplate, customer);

  return (
    <Wrapper>
      <Identity>
        <Name>{fullName}</Name>
        <Meta>
          {customer.email}
          {customer.tax_id
            ? ` • ${intl.formatMessage(messages.headerTaxId, {
                taxId: customer.tax_id,
              })}`
            : null}
        </Meta>
      </Identity>

      <Actions>
        <Button type="button" $variant="outline" onClick={onEditProfile}>
          {intl.formatMessage(messages.headerEditProfile)}
        </Button>

        <Button type="button" $variant="outline" onClick={onChangePassword}>
          {intl.formatMessage(messages.profileChangePassword)}
        </Button>

        <Button
          type="button"
          $variant="outline"
          aria-label={intl.formatMessage(
            signOutState === "error"
              ? messages.headerSignOutFailed
              : messages.headerSignOut,
          )}
          disabled={signOutState === "busy"}
          onClick={onSignOut}
        >
          {signOutState === "busy" ? (
            <Spinner />
          ) : (
            <>
              {intl.formatMessage(messages.headerSignOut)} <LogOut size={16} />
            </>
          )}
        </Button>
      </Actions>
    </Wrapper>
  );
}
