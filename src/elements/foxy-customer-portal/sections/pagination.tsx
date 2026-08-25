import { useIntl } from "react-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styled from "styled-components";
import { Button } from "@foxy.io/design-system/button";
import { messages } from "../messages";

type Props = {
  offset: number;
  limit: number;
  totalItems: number;
  onGoToPage: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: ${(props) => props.theme.tokens.space.md};
  margin-top: ${(props) => props.theme.tokens.space.lg};
`;

// Hidden below 640px, matching the mock's own breakpoint for collapsing the
// Previous/Next labeled buttons -- the numbered pages stay visible at every
// width. CSS, not the mock's `window.innerWidth` state (see Global
// Constraints).
const PrevSlot = styled.div`
  margin-right: auto;

  @media (max-width: 640px) {
    display: none;
  }
`;

const NextSlot = styled.div`
  margin-left: auto;

  @media (max-width: 640px) {
    display: none;
  }
`;

const Pages = styled.div`
  display: flex;
  gap: ${(props) => props.theme.tokens.space.xs};
`;

const PageButton = styled.button<{ $current: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.tokens.borderRadius.xs};
  font: ${(props) => props.theme.tokens.font.bodySmall};
  cursor: pointer;
  background: ${(props) =>
    props.$current ? props.theme.tokens.color.primary : "transparent"};
  color: ${(props) =>
    props.$current
      ? props.theme.tokens.color.onPrimary
      : props.theme.tokens.color.body};
`;

export function Pagination({
  offset,
  limit,
  totalItems,
  onGoToPage,
  onPrev,
  onNext,
}: Props) {
  const intl = useIntl();
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <Wrapper>
      <PrevSlot>
        <Button
          type="button"
          $variant="outline"
          onClick={onPrev}
          disabled={currentPage <= 1}
        >
          <ChevronLeft size={16} />{" "}
          {intl.formatMessage(messages.paginationPrevious)}
        </Button>
      </PrevSlot>

      <Pages>
        {pages.map((page) => (
          <PageButton
            key={page}
            type="button"
            $current={page === currentPage}
            onClick={() => onGoToPage(page)}
          >
            {page}
          </PageButton>
        ))}
      </Pages>

      <NextSlot>
        <Button
          type="button"
          $variant="outline"
          onClick={onNext}
          disabled={currentPage >= totalPages}
        >
          {intl.formatMessage(messages.paginationNext)}{" "}
          <ChevronRight size={16} />
        </Button>
      </NextSlot>
    </Wrapper>
  );
}
