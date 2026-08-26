import type { ReactNode } from "react";
import { useIntl } from "react-intl";
import { ChevronLeft } from "lucide-react";
import styled from "styled-components";
import { messages } from "./messages";

type Props = {
  title?: ReactNode;
  onBack: () => void;
  /** The design's column width for this page. */
  maxWidth?: string;
  children: ReactNode;
};

/**
 * Replaces `PortalDialog` for the five account sub-pages: a Back control
 * instead of dialog chrome, since these render as the account screen's main
 * content rather than an overlay. `title` is optional -- a page whose
 * underlying resource is still loading has nothing to put here yet, and an
 * empty `<h2>` would be worse than none.
 *
 * The container lives here rather than in any one page so all five share it.
 * `box-sizing` is explicit: a shadow root gets no page-level reset, so this
 * box would otherwise measure its max-width *plus* its padding.
 */
const Container = styled.div<{ $maxWidth: string }>`
  box-sizing: border-box;
  max-width: ${(props) => props.$maxWidth};
  margin: 0 auto;
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

const Title = styled.h2`
  margin: 0 0 20px;
  font: ${(props) => props.theme.tokens.font.h2};
  color: ${(props) => props.theme.tokens.color.body};
`;

export function AccountPageLayout({
  title,
  onBack,
  maxWidth = "960px",
  children,
}: Props) {
  const intl = useIntl();

  return (
    <Container $maxWidth={maxWidth}>
      <BackButton type="button" onClick={onBack}>
        <ChevronLeft size={16} />
        {intl.formatMessage(messages.back)}
      </BackButton>

      {title ? <Title>{title}</Title> : null}

      {children}
    </Container>
  );
}
