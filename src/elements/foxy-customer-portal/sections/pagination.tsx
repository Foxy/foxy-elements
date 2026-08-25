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
  margin-top: 20px;
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
  gap: 8px;
`;

const Ellipsis = styled.span`
  box-sizing: border-box;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font: ${(props) => props.theme.tokens.font.bodySmall};
  color: ${(props) => props.theme.tokens.color.secondary};
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

  &:focus-visible {
    outline: ${(props) => props.theme.tokens.outline.primary};
    outline-offset: 2px;
  }
`;

// Windows the rendered page numbers so a customer with hundreds of
// transactions doesn't get hundreds of page buttons in one row: always show
// the first page, the last page, and the current page with its immediate
// neighbours, collapsing any gap between those into a single ellipsis.
function getPageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set(
    [1, total, current, current - 1, current + 1].filter(
      (p) => p >= 1 && p <= total,
    ),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

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
  const pages = getPageWindow(currentPage, totalPages);

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
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <Ellipsis key={`ellipsis-${index}`} aria-hidden="true">
              &hellip;
            </Ellipsis>
          ) : (
            <PageButton
              key={page}
              type="button"
              $current={page === currentPage}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onGoToPage(page)}
            >
              {page}
            </PageButton>
          ),
        )}
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
