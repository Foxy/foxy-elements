import styled from "styled-components";

/**
 * The chrome a portal detail page is built from: the title/status header, the
 * main-plus-sticky-rail grid, the per-item cards and the rail's summary card.
 *
 * Shared by the subscription page and the order page. The two are the same
 * object in the design -- one record, its items, and a totals rail -- so the
 * layout lives here rather than once per section. `card-layout.tsx` holds the
 * chrome for the *list* cards, which is a different shape.
 */

export const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
`;

export const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.h1};
  color: ${(props) => props.theme.tokens.color.body};
`;

export const TitleId = styled.span`
  color: ${(props) => props.theme.tokens.color.secondary};
`;

export const Note = styled.p`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

export const AlertSlot = styled.div`
  margin-top: 24px;
`;

// The rail keeps a fixed width beside a column that may hold a wide table;
// `minmax(0, 1fr)` is what stops that table pushing the rail off screen.
export const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: clamp(24px, 4vw, 48px);
  margin-top: 32px;
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  min-width: 0;
`;

export const Rail = styled.aside`
  position: sticky;
  top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;

  /* Once the columns stack there is nothing to stay level with, and a
     sticky rail would just pin itself mid-scroll. */
  @media (max-width: 860px) {
    position: static;
  }
`;

export const SectionHeading = styled.h2<{ $flush?: boolean }>`
  margin: ${(props) => (props.$flush ? "0" : "0 0 16px")};
  font: ${(props) => props.theme.tokens.font.h2};
  color: ${(props) => props.theme.tokens.color.body};
`;

/**
 * A section heading with an action beside it -- the subscription page's
 * "Modify items" link-out. The heading inside goes `$flush` so this row owns
 * the spacing below instead of two margins stacking.
 */
export const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

export const ItemCard = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 16px;
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
  background: ${(props) => props.theme.tokens.background.surface};
`;

export const ItemThumb = styled.div`
  width: 56px;
  aspect-ratio: 1;
  flex-shrink: 0;
  align-self: flex-start;
  border-radius: ${(props) => props.theme.tokens.borderRadius.sm};
  background: ${(props) => props.theme.tokens.background.disabledField};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
`;

export const ItemName = styled.div`
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.body};
`;

export const DetailRow = styled.div`
  display: flex;
  gap: 6px;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

export const DetailValue = styled.span`
  color: ${(props) => props.theme.tokens.color.body};
`;

export const ItemPrice = styled.div`
  font: ${(props) => props.theme.tokens.font.bodyEmphasis};
  color: ${(props) => props.theme.tokens.color.body};
  flex-shrink: 0;
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const RailCard = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
  background: ${(props) => props.theme.tokens.background.surface};
`;

/**
 * An `<h2>`, not a `<div>`: spec §6.6 calls this a heading, and as a div it
 * was the one section of a customer-facing account page unreachable by
 * heading navigation. `<h2>` is the level that fits the page's outline --
 * the `<h1>` is the record's title and the left column's sections are
 * all `SectionHeading`, itself an `<h2>`. The `font.h3` styling is
 * unchanged; heading *level* and heading *size* are separate. `margin: 0`
 * replaces the UA stylesheet's own margin, which a `<div>` never had --
 * `RailCard`'s `gap` does the spacing.
 */
export const RailTitle = styled.h2`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.h3};
  color: ${(props) => props.theme.tokens.color.body};
`;

export const RailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const RailRow = styled.div<{ $error?: boolean }>`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  span:first-child {
    font: ${(props) => props.theme.tokens.font.body};
    color: ${(props) =>
      props.$error
        ? props.theme.tokens.color.error
        : props.theme.tokens.color.secondary};
  }

  span:last-child {
    font: ${(props) => props.theme.tokens.font.bodyEmphasis};
    color: ${(props) =>
      props.$error
        ? props.theme.tokens.color.error
        : props.theme.tokens.color.body};
  }
`;

/**
 * The rail's own emphasised last row -- a grand total set apart from the
 * lines above it by a rule and heavier type.
 *
 * Its separation is not decoration. A transaction's `total_item_price`,
 * `total_tax`, `total_shipping` and `total_order` are each reported
 * independently by the API and are NOT guaranteed to sum: a coupon discount
 * is the known reason a gap can appear, and this resource graph has no field
 * to label it. So the total is its own authoritative figure, never a fourth
 * line implying a running sum of the three above. Do not "fix" this into one
 * flat list.
 */
export const RailTotalRow = styled(RailRow)`
  margin-top: 4px;
  padding-top: 14px;
  border-top: ${(props) => props.theme.tokens.border.default};

  span:last-child {
    font: ${(props) => props.theme.tokens.font.h3};
  }
`;

/**
 * A bordered panel of label/value rows -- the subscription page's Billing &
 * shipping block, and the order page's read-only equivalent.
 */
export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  border: ${(props) => props.theme.tokens.border.field};
  border-radius: ${(props) => props.theme.tokens.borderRadius.md};
  background: ${(props) => props.theme.tokens.background.surface};
`;


export const PanelRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;

  /* A rule between rows, never above the first -- the panel's own border
     already closes the top. Rows hold unrelated blocks (how the order was
     paid, then each place it shipped to), so without this a multi-shipment
     panel reads as one run of grey lines. */
  & + & {
    border-top: ${(props) => props.theme.tokens.border.default};
  }

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;


export const PanelLabel = styled.div`
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.body};
`;


export const PanelNote = styled.div`
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;


export const PanelAction = styled.div`
  flex-shrink: 0;

  @media (max-width: 560px) {
    width: 100%;
  }
`;


export const PanelValue = styled.div`
  flex-shrink: 0;
  font: ${(props) => props.theme.tokens.font.label};
  color: ${(props) => props.theme.tokens.color.body};
`;

