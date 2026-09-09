import styled from "styled-components";
import type { LineItem } from "./line-items";

/** How many tiles a grid ever shows, whatever the item count. */
const MAX_TILES = 4;

// `grid-auto-rows: 1fr` is what splits the square between the rows. Without
// it the rows size to their content, so a third item pushed each cell to the
// image's own height and the grid rendered tall, narrow tiles instead of a
// 2x2 of squares.
const Grid = styled.div<{ $multi: boolean }>`
  flex-shrink: 0;
  width: 6rem;
  height: 6rem;
  display: grid;
  grid-template-columns: ${(props) => (props.$multi ? "repeat(2, 1fr)" : "1fr")};
  grid-auto-rows: 1fr;
  gap: 6px;
`;

// Square regardless of the cell it lands in, so a row that ever sizes
// differently cannot stretch a tile out of shape. Item images are arbitrary
// sizes and aspect ratios, so they fill that square by cropping rather than
// letterboxing -- a tile that matches its neighbours matters more here than
// showing the whole of any one image.
const Tile = styled.div`
  width: 100%;
  aspect-ratio: 1;
  align-self: start;
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

/**
 * The item thumbnails a card leads with: one tile per item up to four, laid
 * out 1x1 or 2x2 inside a fixed square.
 *
 * Shared by the subscription card and the payment card so the two cannot
 * drift -- both lead with the same square, and both inherit the two layout
 * fixes above rather than each rediscovering them.
 *
 * An item with no `image` still gets its tile: the empty swatch keeps the
 * grid's shape, so a two-item card reads as two items whether or not the
 * store uploaded pictures for both.
 */
export function ThumbnailGrid({ items }: { items: LineItem[] }) {
  const tiles = items.slice(0, MAX_TILES);

  return (
    <Grid $multi={tiles.length > 1}>
      {tiles.map((item, index) => (
        <Tile key={`${item.name}-${index}`}>
          {item.image ? <img src={item.image} alt="" loading="lazy" /> : null}
        </Tile>
      ))}
    </Grid>
  );
}
