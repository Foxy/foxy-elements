import styled from "styled-components";

/**
 * The chrome a portal card is built from: the surface, the thumbnail-beside-body
 * split, the title/price row, the bundle child lines and the caption grid with
 * its trailing action slot.
 *
 * Shared by the subscription card and the payment card. The two are the same
 * object in the design -- a big card with images, a heading, a price and a row
 * of captions -- and only their captions differ, so the layout lives here
 * rather than once per section. `thumbnail-grid.tsx` holds the square that
 * every card leads with.
 */

export const Card = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${(props) => props.theme.tokens.space.lg};
  padding: 20px;
  background: ${(props) => props.theme.tokens.background.surface};
  border: ${(props) => props.theme.tokens.border.default};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 220px;
  min-width: 220px;
  gap: ${(props) => props.theme.tokens.space.md};
`;

export const CardTitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${(props) => props.theme.tokens.space.sm};
`;

export const CardTitle = styled.div`
  font: ${(props) => props.theme.tokens.font.h3};
  color: ${(props) => props.theme.tokens.color.body};
`;

export const CardPrice = styled.div`
  font: ${(props) => props.theme.tokens.font.h3};
  color: ${(props) => props.theme.tokens.color.body};
`;

export const CardChildList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CardChildLine = styled.div`
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

export const CardInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 14px;
`;

export const CardCellLabel = styled.div`
  font: ${(props) => props.theme.tokens.font.bodySmall};
  color: ${(props) => props.theme.tokens.color.faint};
`;

export const CardCellValue = styled.div<{ $error?: boolean }>`
  font: ${(props) => props.theme.tokens.font.bodyEmphasis};
  color: ${(props) =>
    props.$error
      ? props.theme.tokens.color.error
      : props.theme.tokens.color.body};
`;

export const CardActionSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;

  /* Pinned to the last column rather than left to auto-placement, which drops
     it into whichever cell follows the final caption -- the middle of the
     card at any width where the captions wrap. The track count varies with
     the viewport (the grid is auto-fit) and with how many captions the card
     has, so the column is addressed from the end. */
  grid-column: -2 / -1;
`;
