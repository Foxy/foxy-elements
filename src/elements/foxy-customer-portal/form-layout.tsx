import styled from "styled-components";

/**
 * Shared layout for the portal's account forms: profile, password, address.
 *
 * `Field.Root` is a grid with a `space.xs` gap, but that gap is *inside* one
 * field -- between its label, control and error. Nothing separated one field
 * from the next, so all three forms read as a single undifferentiated stack.
 *
 * The width cap lives on the form rather than the page. The page container
 * deliberately fills its host (see `AccountPageLayout`) because the portal is
 * an embeddable element; a row of short text inputs stretched across a wide
 * monitor is the *content's* problem to solve, not the page's. The widths are
 * layout measurements the token scale does not carry, so they stay literals;
 * the spacing between fields comes from tokens.
 */
export const Form = styled.form<{ $maxWidth?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space.lg};
  max-width: ${(props) => props.$maxWidth ?? "480px"};
`;

/**
 * Two fields side by side, for the pairs an address form conventionally
 * keeps together: first/last name, country/region, city/postal code.
 *
 * Collapses to one column at the same 560px the subscription page's billing
 * rows stack at -- two text inputs sharing a phone's width are narrower than
 * the content they hold.
 */
export const Pair = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${(props) => props.theme.tokens.space.lg};

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * The submit row. The button sizes to its own text instead of stretching to
 * the form's width, and takes a little more room above it than sits between
 * two fields -- it ends the form rather than being another field in it.
 */
export const Actions = styled.div`
  display: flex;
  margin-top: ${(props) => props.theme.tokens.space.sm};
`;
