/**
 * hAPI v1 reports a scope denial as HTTP 401 with a `vnd.error` body. That status is
 * also what the OAuth2 layer returns for a bad or missing token, and many unrelated
 * authorization failures reuse the same exception and body shape, so the scope check's
 * own message is the only unambiguous signal.
 *
 * The message reads "The current authenticated user does not appear to have <type>
 * permission for [zoomed ]<rel> resource.", where <type> is `read`, `write` or
 * `resend` and <rel> is a snake_case rel name.
 */
const SCOPE_DENIAL =
  /^The current authenticated user does not appear to have \w+ permission for (?:zoomed )?\w+ resource\.$/;

/**
 * Returns `true` if the given failed response means the token lacks the scope
 * required for the resource.
 *
 * 403 is accepted alongside 401 so that a future backend fix to the status code
 * does not require a coordinated frontend release.
 *
 * The response body is read from a clone, so the caller's body stays unconsumed.
 * Any parse failure returns `false`, which degrades to the generic error message
 * rather than throwing inside a render path.
 */
export async function isAccessDenied(response: Response): Promise<boolean> {
  if (response.status !== 401 && response.status !== 403) return false;

  try {
    const errors = (await response.clone().json())?._embedded?.['fx:errors'];
    if (!Array.isArray(errors)) return false;
    return errors.some(error => SCOPE_DENIAL.test(error?.message ?? ''));
  } catch {
    return false;
  }
}
