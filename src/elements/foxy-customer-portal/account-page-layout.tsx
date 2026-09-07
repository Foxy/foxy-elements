import type { ReactNode } from "react";
import { useIntl } from "react-intl";
import { ChevronLeft } from "lucide-react";
import styled from "styled-components";
import { messages } from "./messages";

type Props = {
  title?: ReactNode;
  onBack: () => void;
  children: ReactNode;
};

/**
 * Replaces `PortalDialog` for the five account sub-pages: a Back control
 * instead of dialog chrome, since these render as the account screen's main
 * content rather than an overlay. `title` is optional -- a page whose
 * underlying resource is still loading has nothing to put here yet, and an
 * empty heading would be worse than none.
 *
 * The container lives here rather than in any one page so all five share it.
 * It sets no width of its own: this is an embeddable custom element, so page
 * width belongs to the host that embeds it, not to the widget. It fills
 * whatever it is given.
 *
 * `box-sizing` is explicit anyway -- a shadow root gets no page-level reset,
 * so a host that does set a width on the element would otherwise get that
 * width *plus* this padding.
 */
const Container = styled.div`
  box-sizing: border-box;
  padding: 40px clamp(16px, 5vw, 32px) 96px;
  background: ${(props) => props.theme.tokens.background.page};
  color: ${(props) => props.theme.tokens.color.body};
`;

// A button, not a link: it calls back into the screen's own navigation
// rather than going anywhere.
const BackButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  cursor: pointer;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};

  &:focus-visible {
    outline: ${(props) => props.theme.tokens.outline.primary};
    outline-offset: 2px;
  }
`;

// An `<h1>` at `font.h1`, matching the home screen's customer name and the
// subscription page's title. These four sub-pages were the portal's only
// screens whose top heading was an `<h2>` -- visibly smaller than every
// other page, and an outline with no `<h1>` at all for anyone navigating by
// heading.
const Title = styled.h1`
  margin: 0 0 24px;
  font: ${(props) => props.theme.tokens.font.h1};
  color: ${(props) => props.theme.tokens.color.body};
`;

export function AccountPageLayout({ title, onBack, children }: Props) {
  const intl = useIntl();

  return (
    <Container>
      <BackButton type="button" onClick={onBack}>
        <ChevronLeft size={16} />
        {intl.formatMessage(messages.back)}
      </BackButton>

      {title ? <Title>{title}</Title> : null}

      {children}
    </Container>
  );
}
