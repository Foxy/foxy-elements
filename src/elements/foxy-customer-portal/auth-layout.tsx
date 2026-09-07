import styled from "styled-components";

/**
 * Shared chrome for the four signed-out screens: sign-in, sign-up, access
 * recovery and password reset.
 *
 * They had none at all -- a bare `<form>` with a browser-default `<h1>`, no
 * padding and no page background, so they rendered flush against whatever
 * embedded them while every signed-in screen sat in a framed container.
 *
 * The container sets no width of its own, matching `AccountPageLayout`: the
 * portal is an embeddable element, so page width belongs to the host. The
 * `Column` inside is what caps and centres the content.
 */
export const AuthContainer = styled.div`
  box-sizing: border-box;
  padding: 40px clamp(16px, 5vw, 32px) 96px;
  background: ${(props) => props.theme.tokens.background.page};
  color: ${(props) => props.theme.tokens.color.body};
`;

/**
 * The centred column the form sits in.
 *
 * Narrower than the account forms' 480px, and centred rather than left
 * aligned. These carry one or two fields; at 480px hard against the left edge
 * of a wide monitor they read as unfinished rather than deliberate, and a
 * centred sign-in is what people expect to meet.
 *
 * 420px is a layout measurement the token scale does not carry, so it stays a
 * literal; the spacing inside comes from tokens.
 */
export const AuthColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.tokens.space.lg};
  max-width: 420px;
  margin: 0 auto;
`;

/**
 * Matches the home screen's customer name and every account sub-page: `<h1>`
 * at `font.h1`. These screens rendered a bare `<h1>`, which browsers style
 * themselves -- a different size and weight from the rest of the portal, in
 * the font the host page happened to set rather than the theme's.
 */
export const AuthTitle = styled.h1`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.h1};
  color: ${(props) => props.theme.tokens.color.body};
`;

/** Supporting copy under a title, e.g. access recovery's explanation. */
export const AuthHint = styled.p`
  margin: 0;
  font: ${(props) => props.theme.tokens.font.body};
  color: ${(props) => props.theme.tokens.color.secondary};
`;

/**
 * A field label with an action on the same line -- sign-in's "Forgot
 * password?" beside the Password label.
 *
 * It sits here rather than below the form because that is where a customer
 * looks when the password is the thing going wrong, and it keeps the block
 * under the form for the one alternative that is not about this field.
 *
 * `baseline` rather than `center`: the link and the label are both text, and
 * aligning their boxes instead of their type leaves the link visibly high.
 */
export const AuthLabelRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${(props) => props.theme.tokens.space.sm};
`;

/**
 * The primary action under an auth form.
 *
 * Full width, unlike the account forms' `Actions`, which sizes the button to
 * its own text. In a 420px centred column a left-aligned submit sitting under
 * full-width inputs and above centred links reads as a stray element rather
 * than the form's conclusion.
 */
export const AuthActions = styled.div`
  display: flex;
  margin-top: ${(props) => props.theme.tokens.space.sm};

  > * {
    flex: 1;
  }
`;

/**
 * The secondary actions under a form -- "Forgot password?", "Create an
 * account", "Back to sign in".
 *
 * They were siblings of the fields, in the same undifferentiated stack, so
 * the submit button and the links that navigate away from it read as one
 * group. Stacked and centred to match the column, with a rule above
 * separating them from the action they are alternatives to.
 */
export const AuthAlternatives = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props) => props.theme.tokens.space.xs};
  padding-top: ${(props) => props.theme.tokens.space.lg};
  border-top: ${(props) => props.theme.tokens.border.field};
`;
